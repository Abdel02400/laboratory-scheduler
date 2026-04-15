import type { Sample } from '@/core/entities/Sample';
import type { Technician } from '@/core/entities/Technician';
import { PRIORITY, type Priority } from '@/core/types/enums/priority';
import type { LabInput } from '@/core/types/labInput';
import type { LaboratoryOutput, PlanifyLabOutput } from '@/core/types/labOutput';
import type { LunchBreakInfo, MetadataOutput } from '@/core/types/metadata';
import type { Metrics, MetricsOutput } from '@/core/types/metrics';
import type { ScheduleEntry, ScheduleEntryOutput, ScheduleResult, UnscheduledEntry, UnscheduledEntryOutput } from '@/core/types/schedule';
import { formatTime } from '@/core/utils/time';

const ALGORITHM_VERSION = 'v1.0';
const CONSTRAINTS_APPLIED = ['priority_management', 'specialization_matching', 'lunch_breaks', 'equipment_compatibility', 'cleaning_delays', 'efficiency_coefficients', 'parallelism_optimization'];

export function formatOutput(input: LabInput, result: ScheduleResult, metrics: Metrics, samples: Sample[], technicians: Technician[]): PlanifyLabOutput {
    return {
        laboratory: formatLaboratory(input),
        schedule: formatSchedule(result.schedule, samples, technicians),
        unscheduled: formatUnscheduled(result.unscheduled),
        metrics: formatMetrics(metrics, result.schedule),
        metadata: formatMetadata(technicians),
    };
}

function formatLaboratory(input: LabInput): LaboratoryOutput {
    return {
        date: input.laboratory.date,
        processingDate: input.laboratory.date,
        totalSamples: input.samples.length,
        algorithmVersion: ALGORITHM_VERSION,
    };
}

function formatSchedule(entries: ScheduleEntry[], samples: Sample[], technicians: Technician[]): ScheduleEntryOutput[] {
    const sampleById = new Map(samples.map((s) => [s.getId(), s]));
    const techById = new Map(technicians.map((t) => [t.getId(), t]));
    const previousOnEquipment = new Map<string, number>();

    return entries.map((entry) => {
        const sample = sampleById.get(entry.sampleId)!;
        const tech = techById.get(entry.technicianId)!;
        const cleaningRequired = previousOnEquipment.has(entry.equipmentId);
        previousOnEquipment.set(entry.equipmentId, entry.endTime);

        return {
            sampleId: entry.sampleId,
            priority: entry.priority,
            technicianId: entry.technicianId,
            equipmentId: entry.equipmentId,
            startTime: formatTime(entry.startTime),
            endTime: formatTime(entry.endTime),
            duration: entry.endTime - entry.startTime,
            analysisType: sample.getAnalysisType(),
            efficiency: tech.getEfficiency(),
            lunchBreak: null,
            cleaningRequired,
        };
    });
}

function formatUnscheduled(entries: UnscheduledEntry[]): UnscheduledEntryOutput[] {
    return entries.map((e) => ({ sampleId: e.sampleId, reason: e.reason }));
}

function formatMetrics(metrics: Metrics, schedule: ScheduleEntry[]): MetricsOutput {
    return {
        totalTime: metrics.totalTime,
        efficiency: round1(metrics.globalEfficiency),
        conflicts: 0,
        averageWaitTime: roundWaitTimes(metrics.averageWaitingTimeByPriority),
        technicianUtilization: round1(averageOfRecord(metrics.technicianUtilization)),
        priorityRespectRate: round1(metrics.priorityRespectRate),
        parallelAnalyses: peakConcurrent(schedule),
        lunchInterruptions: 0,
    };
}

function formatMetadata(technicians: Technician[]): MetadataOutput {
    const lunchBreaks: LunchBreakInfo[] = technicians.map((t) => ({
        technicianId: t.getId(),
        planned: t.getLunchBreak(),
        actual: t.getLunchBreak(),
        reason: 'normal',
    }));

    return {
        lunchBreaks,
        constraintsApplied: [...CONSTRAINTS_APPLIED],
    };
}

function roundWaitTimes(values: Record<Priority, number>): Record<Priority, number> {
    return {
        [PRIORITY.STAT]: Math.round(values[PRIORITY.STAT]),
        [PRIORITY.URGENT]: Math.round(values[PRIORITY.URGENT]),
        [PRIORITY.ROUTINE]: Math.round(values[PRIORITY.ROUTINE]),
    };
}

function averageOfRecord(record: Record<string, number>): number {
    const values = Object.values(record);
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function round1(value: number): number {
    return Math.round(value * 10) / 10;
}

function peakConcurrent(schedule: ScheduleEntry[]): number {
    if (schedule.length === 0) return 0;
    let peak = 0;
    for (const entry of schedule) {
        const t = entry.startTime;
        const concurrent = schedule.filter((e) => e.startTime <= t && t < e.endTime).length;
        if (concurrent > peak) peak = concurrent;
    }
    return peak;
}
