import type { Constraints } from '@/core/entities/Constraints';
import type { Equipment } from '@/core/entities/Equipment';
import type { Laboratory } from '@/core/entities/Laboratory';
import type { Sample } from '@/core/entities/Sample';
import type { Technician } from '@/core/entities/Technician';
import { findCompatibleEquipments } from '@/core/scheduler/findCompatibleEquipments';
import { findCompatibleTechnicians } from '@/core/scheduler/findCompatibleTechnicians';
import { ResourceTracker, type Interval } from '@/core/scheduler/ResourceTracker';
import { sortSamples } from '@/core/scheduler/sortSamples';
import { PRIORITY } from '@/core/types/enums/priority';
import type { ScheduleEntry, ScheduleResult, UnscheduledEntry } from '@/core/types/schedule';
import { overlaps, parseRange, parseTime } from '@/core/utils/time';

const MAX_FIT_ITERATIONS = 50;

interface Assignment {
    start: number;
    end: number;
    slotIndex: number;
}

export class Scheduler {
    private readonly tracker = new ResourceTracker();
    private lunchInterruptions = 0;
    private laboratory?: Laboratory;
    private constraints?: Constraints;

    schedule(samples: Sample[], technicians: Technician[], equipments: Equipment[], laboratory?: Laboratory, constraints?: Constraints): ScheduleResult {
        this.tracker.init(technicians, equipments, constraints);
        this.lunchInterruptions = 0;
        this.laboratory = laboratory;
        this.constraints = constraints;

        const schedule: ScheduleEntry[] = [];
        const unscheduled: UnscheduledEntry[] = [];

        for (const sample of sortSamples(samples)) {
            const entry = this.scheduleSample(sample, technicians, equipments);
            if ('reason' in entry) {
                unscheduled.push(entry);
            } else {
                schedule.push(entry);
            }
        }

        return { schedule, unscheduled, lunchInterruptions: this.lunchInterruptions };
    }

    private scheduleSample(sample: Sample, technicians: Technician[], equipments: Equipment[]): ScheduleEntry | UnscheduledEntry {
        const candidates = findCompatibleEquipments(sample, equipments);
        if (candidates.length === 0) {
            return { sampleId: sample.id, reason: 'No compatible equipment' };
        }

        for (const equipment of candidates) {
            const entry = this.tryAssign(sample, equipment, technicians);
            if (entry !== null) {
                return entry;
            }
        }

        return { sampleId: sample.id, reason: 'No technician/equipment combination fits within working hours' };
    }

    private tryAssign(sample: Sample, equipment: Equipment, technicians: Technician[]): ScheduleEntry | null {
        const compatibleTechs = findCompatibleTechnicians(equipment, technicians);
        if (compatibleTechs.length === 0) {
            return null;
        }

        for (const tech of compatibleTechs) {
            const assignment = this.computeAssignment(sample, equipment, tech);
            if (assignment === null) {
                continue;
            }

            const lunchHit = this.countsAsLunchInterruption(assignment.start, assignment.end, tech, sample);
            if (lunchHit) {
                this.lunchInterruptions += 1;
            }

            const contaminationOn = this.constraints?.contaminationPrevention !== false;
            const cleaning = contaminationOn ? (equipment.cleaningTime ?? 0) : 0;

            this.tracker.reserveTech(tech.id, assignment.start, assignment.end);
            this.tracker.reserveSlot(equipment.id, assignment.slotIndex, assignment.start, assignment.end + cleaning);

            return {
                sampleId: sample.id,
                technicianId: tech.id,
                equipmentId: equipment.id,
                startTime: assignment.start,
                endTime: assignment.end,
                priority: sample.priority,
            };
        }

        return null;
    }

    private computeAssignment(sample: Sample, equipment: Equipment, tech: Technician): Assignment | null {
        const slots = this.tracker.getSlotIntervals(equipment.id);
        if (slots.length === 0) {
            return null;
        }

        let best: Assignment | null = null;
        for (let i = 0; i < slots.length; i += 1) {
            const fit = this.findFit(sample, equipment, tech, slots[i]);
            if (fit === null) {
                continue;
            }
            if (best === null || fit.start < best.start) {
                best = { start: fit.start, end: fit.end, slotIndex: i };
            }
        }
        return best;
    }

    private findFit(sample: Sample, equipment: Equipment, tech: Technician, slotBusy: Interval[]): { start: number; end: number } | null {
        const techStart = parseTime(tech.startTime);
        const techEnd = parseTime(tech.endTime);
        const labOpen = this.laboratory !== undefined ? parseRange(this.laboratory.openingHours) : undefined;

        const minStart = Math.max(parseTime(sample.arrivalTime), techStart, labOpen?.start ?? 0);
        const duration = tech.efficiency !== undefined ? Math.round(sample.analysisTime / tech.efficiency) : sample.analysisTime;
        const techBusy = this.tracker.getTechIntervals(tech.id);
        const lunch = tech.lunchBreak !== undefined ? parseRange(tech.lunchBreak) : undefined;
        const maintenance = equipment.maintenanceWindow !== undefined ? parseRange(equipment.maintenanceWindow) : undefined;

        let candidate = minStart;
        for (let iter = 0; iter < MAX_FIT_ITERATIONS; iter += 1) {
            const window: Interval = { start: candidate, end: candidate + duration };
            let pushed = false;

            for (const busy of techBusy) {
                if (overlaps(window, busy) && busy.end > candidate) {
                    candidate = busy.end;
                    pushed = true;
                    break;
                }
            }
            if (pushed) {
                continue;
            }

            for (const busy of slotBusy) {
                if (overlaps(window, busy) && busy.end > candidate) {
                    candidate = busy.end;
                    pushed = true;
                    break;
                }
            }
            if (pushed) {
                continue;
            }

            if (lunch !== undefined && sample.priority !== PRIORITY.STAT && overlaps(window, lunch) && lunch.end > candidate) {
                candidate = lunch.end;
                continue;
            }

            if (maintenance !== undefined && overlaps(window, maintenance) && maintenance.end > candidate) {
                candidate = maintenance.end;
                continue;
            }

            const end = candidate + duration;
            if (end > techEnd) {
                return null;
            }
            if (labOpen !== undefined && end > labOpen.end) {
                return null;
            }
            return { start: candidate, end };
        }
        return null;
    }

    private countsAsLunchInterruption(start: number, end: number, tech: Technician, sample: Sample): boolean {
        if (tech.lunchBreak === undefined || sample.priority !== PRIORITY.STAT) {
            return false;
        }
        const lunch = parseRange(tech.lunchBreak);
        return overlaps({ start, end }, lunch);
    }
}
