import { Equipment } from '@/core/entities/Equipment';
import { Sample } from '@/core/entities/Sample';
import { Technician } from '@/core/entities/Technician';
import { MetricsCalculator } from '@/core/metrics/MetricsCalculator';
import { Scheduler } from '@/core/scheduler/Scheduler';
import type { LabInput } from '@/core/types/labInput';
import type { Metrics } from '@/core/types/metrics';
import type { ScheduleEntry, UnscheduledEntry } from '@/core/types/schedule';

export interface PlanifyLabResult {
    schedule: ScheduleEntry[];
    unscheduled: UnscheduledEntry[];
    metrics: Metrics;
}

export function planifyLab(input: LabInput): PlanifyLabResult {
    const samples = input.samples.map((dto) => new Sample(dto));
    const technicians = input.technicians.map((dto) => new Technician(dto));
    const equipments = input.equipment.map((dto) => new Equipment(dto));

    const { schedule, unscheduled } = new Scheduler().schedule(samples, technicians, equipments);
    const metrics = new MetricsCalculator().calculate(schedule, samples, technicians, equipments);

    return { schedule, unscheduled, metrics };
}
