import type { Metrics } from '@/core/types/metrics';
import type { LaboratoryOutput } from '@/core/types/outputs/laboratory';
import type { MetadataOutput } from '@/core/types/outputs/metadata';
import type { ScheduleEntryOutput, UnscheduledEntryOutput } from '@/core/types/outputs/scheduleEntry';

export interface PlanifyLabOutput {
    laboratory?: LaboratoryOutput;
    schedule: ScheduleEntryOutput[];
    unscheduled?: UnscheduledEntryOutput[];
    metrics: Metrics;
    metadata?: MetadataOutput;
}
