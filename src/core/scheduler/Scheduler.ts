import type { Equipment } from '@/core/entities/Equipment';
import type { Sample } from '@/core/entities/Sample';
import type { Technician } from '@/core/entities/Technician';
import type { ScheduleEntry, ScheduleResult, UnscheduledEntry } from '@/core/types/schedule';
import { formatTime, parseTime } from '@/core/utils/time';

import { findCompatibleEquipments } from './analysisTypeResolver';
import { findCompatibleTechnicians } from './findTechnicians';
import { ResourceTracker } from './ResourceTracker';
import { sortSamples } from './sortSamples';

export class Scheduler {
    private readonly tracker = new ResourceTracker();

    schedule(samples: Sample[], technicians: Technician[], equipments: Equipment[]): ScheduleResult {
        this.tracker.init(technicians, equipments);

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

        return { schedule, unscheduled };
    }

    private scheduleSample(sample: Sample, technicians: Technician[], equipments: Equipment[]): ScheduleEntry | UnscheduledEntry {
        const { primary, fallback } = findCompatibleEquipments(sample, equipments);
        if (primary.length === 0) {
            return { sampleId: sample.getId(), reason: 'No compatible equipment' };
        }

        for (const equipment of primary) {
            const entry = this.tryAssign(sample, equipment, technicians);
            if (entry) {
                return entry;
            }
        }

        for (const equipment of fallback) {
            const entry = this.tryAssign(sample, equipment, technicians);
            if (entry) {
                return entry;
            }
        }

        return {
            sampleId: sample.getId(),
            reason: `No technician/equipment combination fits. Analysis needs ${sample.getAnalysisTime()} min after ${formatTime(sample.arrivalMinutes())}`,
        };
    }

    private tryAssign(sample: Sample, equipment: Equipment, technicians: Technician[]): ScheduleEntry | null {
        const techs = findCompatibleTechnicians(sample, equipment, technicians);
        if (techs.length === 0) {
            return null;
        }

        const slot = this.tracker.getEarliestSlot(equipment.getId());
        const sorted = [...techs].sort((a, b) => {
            const specialtyDiff = a.getSpecialty().length - b.getSpecialty().length;
            if (specialtyDiff !== 0) {
                return specialtyDiff;
            }
            return this.tracker.getTechReady(a.getId()) - this.tracker.getTechReady(b.getId());
        });

        for (const tech of sorted) {
            const earliest = Math.max(sample.arrivalMinutes(), this.tracker.getTechReady(tech.getId()), slot.readyAt, parseTime(tech.getStartTime()));
            const duration = tech.adjustedDuration(sample.getAnalysisTime());
            const afterLunch = tech.adjustForLunch(earliest, duration);
            const start = equipment.adjustForMaintenance(afterLunch, duration);
            const end = start + duration;

            if (end > parseTime(tech.getEndTime())) {
                continue;
            }

            this.tracker.setTechReady(tech.getId(), end);
            this.tracker.useSlot(equipment.getId(), slot.index, end + equipment.getCleaningTime());

            return {
                sampleId: sample.getId(),
                technicianId: tech.getId(),
                equipmentId: equipment.getId(),
                startTime: start,
                endTime: end,
                priority: sample.getPriority(),
            };
        }

        return null;
    }
}
