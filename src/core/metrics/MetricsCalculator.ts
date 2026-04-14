import type { Equipment } from '@/core/entities/Equipment';
import type { Sample } from '@/core/entities/Sample';
import type { Technician } from '@/core/entities/Technician';
import { PRIORITY, type Priority } from '@/core/types/enums/priority';
import type { EquipmentId } from '@/core/types/models/equipment';
import type { TechnicianId } from '@/core/types/models/technician';
import type { Metrics } from '@/core/types/metrics';
import type { ScheduleEntry } from '@/core/types/schedule';

const STAT_MAX_WAIT = 30;

export class MetricsCalculator {
    calculate(schedule: ScheduleEntry[], samples: Sample[], technicians: Technician[], equipments: Equipment[]): Metrics {
        const totalTime = this.computeTotalTime(schedule);

        return {
            totalTime,
            averageWaitingTimeByPriority: this.computeWaitingTimes(schedule, samples),
            technicianUtilization: this.computeTechnicianUtilization(schedule, technicians, totalTime),
            equipmentUtilization: this.computeEquipmentUtilization(schedule, equipments, totalTime),
            globalEfficiency: this.computeGlobalEfficiency(schedule, technicians, equipments, totalTime),
            priorityRespectRate: this.computePriorityRespectRate(schedule, samples),
            parallelismRate: this.computeParallelismRate(schedule, totalTime),
        };
    }

    private computeTotalTime(schedule: ScheduleEntry[]): number {
        if (schedule.length === 0) {
            return 0;
        }
        const starts = schedule.map((e) => e.startTime);
        const ends = schedule.map((e) => e.endTime);
        return Math.max(...ends) - Math.min(...starts);
    }

    private computeWaitingTimes(schedule: ScheduleEntry[], samples: Sample[]): Record<Priority, number> {
        const sampleById = new Map(samples.map((s) => [s.getId(), s]));
        const waits: Record<Priority, number[]> = {
            [PRIORITY.STAT]: [],
            [PRIORITY.URGENT]: [],
            [PRIORITY.ROUTINE]: [],
        };

        for (const entry of schedule) {
            const sample = sampleById.get(entry.sampleId);
            if (!sample) continue;
            waits[entry.priority].push(entry.startTime - sample.arrivalMinutes());
        }

        return {
            [PRIORITY.STAT]: this.average(waits[PRIORITY.STAT]),
            [PRIORITY.URGENT]: this.average(waits[PRIORITY.URGENT]),
            [PRIORITY.ROUTINE]: this.average(waits[PRIORITY.ROUTINE]),
        };
    }

    private computeTechnicianUtilization(schedule: ScheduleEntry[], technicians: Technician[], totalTime: number): Record<TechnicianId, number> {
        const occupation = new Map<TechnicianId, number>();
        for (const tech of technicians) {
            occupation.set(tech.getId(), 0);
        }
        for (const entry of schedule) {
            occupation.set(entry.technicianId, (occupation.get(entry.technicianId) ?? 0) + (entry.endTime - entry.startTime));
        }

        const result: Record<TechnicianId, number> = {} as Record<TechnicianId, number>;
        for (const [id, busy] of occupation) {
            result[id] = totalTime === 0 ? 0 : (busy / totalTime) * 100;
        }
        return result;
    }

    private computeEquipmentUtilization(schedule: ScheduleEntry[], equipments: Equipment[], totalTime: number): Record<EquipmentId, number> {
        const occupation = new Map<EquipmentId, number>();
        const capacityById = new Map<EquipmentId, number>();
        for (const eq of equipments) {
            occupation.set(eq.getId(), 0);
            capacityById.set(eq.getId(), eq.getCapacity());
        }
        for (const entry of schedule) {
            occupation.set(entry.equipmentId, (occupation.get(entry.equipmentId) ?? 0) + (entry.endTime - entry.startTime));
        }

        const result: Record<EquipmentId, number> = {} as Record<EquipmentId, number>;
        for (const [id, busy] of occupation) {
            const capacity = capacityById.get(id) ?? 1;
            result[id] = totalTime === 0 ? 0 : (busy / (capacity * totalTime)) * 100;
        }
        return result;
    }

    private computeGlobalEfficiency(schedule: ScheduleEntry[], technicians: Technician[], equipments: Equipment[], totalTime: number): number {
        if (totalTime === 0) {
            return 0;
        }
        let totalOccupation = 0;
        const techBusy = new Map<TechnicianId, number>();
        const eqBusy = new Map<EquipmentId, number>();

        for (const entry of schedule) {
            const dur = entry.endTime - entry.startTime;
            techBusy.set(entry.technicianId, (techBusy.get(entry.technicianId) ?? 0) + dur);
            eqBusy.set(entry.equipmentId, (eqBusy.get(entry.equipmentId) ?? 0) + dur);
        }

        for (const busy of techBusy.values()) totalOccupation += busy;
        for (const busy of eqBusy.values()) totalOccupation += busy;

        const resourceCount = technicians.length + equipments.length;
        return (totalOccupation / resourceCount / totalTime) * 100;
    }

    private computePriorityRespectRate(schedule: ScheduleEntry[], samples: Sample[]): number {
        const statSamples = samples.filter((s) => s.isStat());
        if (statSamples.length === 0) {
            return 100;
        }
        const sampleById = new Map(samples.map((s) => [s.getId(), s]));
        let respected = 0;
        for (const entry of schedule) {
            if (entry.priority !== PRIORITY.STAT) continue;
            const sample = sampleById.get(entry.sampleId);
            if (!sample) continue;
            if (entry.startTime - sample.arrivalMinutes() <= STAT_MAX_WAIT) {
                respected += 1;
            }
        }
        return (respected / statSamples.length) * 100;
    }

    private computeParallelismRate(schedule: ScheduleEntry[], totalTime: number): number {
        if (totalTime === 0 || schedule.length === 0) {
            return 0;
        }
        const minStart = Math.min(...schedule.map((e) => e.startTime));
        const maxEnd = Math.max(...schedule.map((e) => e.endTime));
        let parallelMinutes = 0;

        for (let t = minStart; t < maxEnd; t += 1) {
            const running = schedule.filter((e) => e.startTime <= t && t < e.endTime).length;
            if (running > 1) {
                parallelMinutes += 1;
            }
        }

        return (parallelMinutes / totalTime) * 100;
    }

    private average(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
}
