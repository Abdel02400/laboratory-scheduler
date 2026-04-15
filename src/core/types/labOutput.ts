import type { MetadataOutput } from '@/core/types/metadata';
import type { MetricsOutput } from '@/core/types/metrics';
import type { ScheduleEntryOutput, UnscheduledEntryOutput } from '@/core/types/schedule';

export interface LaboratoryOutput {
    date: string;
    processingDate: string;
    totalSamples: number;
    algorithmVersion: string;
}

export interface PlanifyLabOutput {
    laboratory: LaboratoryOutput;
    schedule: ScheduleEntryOutput[];
    unscheduled: UnscheduledEntryOutput[];
    metrics: MetricsOutput;
    metadata: MetadataOutput;
}
