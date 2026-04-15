import type { Equipment } from '@/core/entities/Equipment';
import type { Sample } from '@/core/entities/Sample';
import type { Technician } from '@/core/entities/Technician';
import { PRIORITY, type Priority } from '@/core/types/enums/priority';
import type { Metrics } from '@/core/types/metrics';
import type { ScheduleEntry } from '@/core/types/schedule';
import { parseTime } from '@/core/utils/time';

const STAT_MAX_WAIT = 30;

export class MetricsCalculator {
    calculate(schedule: ScheduleEntry[], samples: Sample[], technicians: Technician[], equipments: Equipment[], lunchInterruptions: number): Metrics {
        const totalTime = this.computeTotalTime(schedule);
        return {
            totalTime,
            efficiency: this.round1(this.computeGlobalEfficiency(schedule, technicians, equipments, totalTime)),
            conflicts: 0,
            averageWaitTime: this.computeWaitingTimes(schedule, samples),
            technicianUtilization: this.round1(this.computeAverageTechUtilization(schedule, technicians, totalTime)),
            priorityRespectRate: this.round1(this.computePriorityRespectRate(schedule, samples)),
            parallelAnalyses: this.computePeakConcurrent(schedule),
            lunchInterruptions,
        };
    }

    private computeTotalTime(schedule: ScheduleEntry[]): number {
        if (schedule.length === 0) return 0;
        const starts = schedule.map((e) => e.startTime);
        const ends = schedule.map((e) => e.endTime);
        return Math.max(...ends) - Math.min(...starts);
    }

    private computeWaitingTimes(schedule: ScheduleEntry[], samples: Sample[]): Record<Priority, number> {
        const sampleById = new Map(samples.map((s) => [s.id, s]));
        const waits: Record<Priority, number[]> = {
            [PRIORITY.STAT]: [],
            [PRIORITY.URGENT]: [],
            [PRIORITY.ROUTINE]: [],
        };
        for (const entry of schedule) {
            const sample = sampleById.get(entry.sampleId);
            if (sample === undefined) continue;
            waits[entry.priority].push(entry.startTime - parseTime(sample.arrivalTime));
        }
        return {
            [PRIORITY.STAT]: Math.round(this.average(waits[PRIORITY.STAT])),
            [PRIORITY.URGENT]: Math.round(this.average(waits[PRIORITY.URGENT])),
            [PRIORITY.ROUTINE]: Math.round(this.average(waits[PRIORITY.ROUTINE])),
        };
    }

    private computeAverageTechUtilization(schedule: ScheduleEntry[], technicians: Technician[], totalTime: number): number {
        if (totalTime === 0 || technicians.length === 0) return 0;
        const occupation = new Map<string, number>();
        for (const t of technicians) occupation.set(t.id, 0);
        for (const e of schedule) {
            occupation.set(e.technicianId, (occupation.get(e.technicianId) ?? 0) + (e.endTime - e.startTime));
        }
        let sum = 0;
        for (const busy of occupation.values()) sum += (busy / totalTime) * 100;
        return sum / technicians.length;
    }

    private computeGlobalEfficiency(schedule: ScheduleEntry[], technicians: Technician[], equipments: Equipment[], totalTime: number): number {
        if (totalTime === 0) return 0;
        const techBusy = new Map<string, number>();
        const eqBusy = new Map<string, number>();
        for (const e of schedule) {
            const dur = e.endTime - e.startTime;
            techBusy.set(e.technicianId, (techBusy.get(e.technicianId) ?? 0) + dur);
            eqBusy.set(e.equipmentId, (eqBusy.get(e.equipmentId) ?? 0) + dur);
        }
        let totalOccupation = 0;
        for (const v of techBusy.values()) totalOccupation += v;
        for (const v of eqBusy.values()) totalOccupation += v;
        const resourceCount = technicians.length + equipments.length;
        return (totalOccupation / resourceCount / totalTime) * 100;
    }

    private computePriorityRespectRate(schedule: ScheduleEntry[], samples: Sample[]): number {
        const stats = samples.filter((s) => s.priority === PRIORITY.STAT);
        if (stats.length === 0) return 100;
        const sampleById = new Map(samples.map((s) => [s.id, s]));
        let respected = 0;
        for (const e of schedule) {
            if (e.priority !== PRIORITY.STAT) continue;
            const sample = sampleById.get(e.sampleId);
            if (sample === undefined) continue;
            if (e.startTime - parseTime(sample.arrivalTime) <= STAT_MAX_WAIT) respected += 1;
        }
        return (respected / stats.length) * 100;
    }

    private computePeakConcurrent(schedule: ScheduleEntry[]): number {
        if (schedule.length === 0) return 0;
        let peak = 0;
        for (const entry of schedule) {
            const t = entry.startTime;
            const concurrent = schedule.filter((e) => e.startTime <= t && t < e.endTime).length;
            if (concurrent > peak) peak = concurrent;
        }
        return peak;
    }

    private average(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    private round1(value: number): number {
        return Math.round(value * 10) / 10;
    }
}
