import { Equipment } from '@/core/entities/Equipment';
import { Sample } from '@/core/entities/Sample';
import { Technician } from '@/core/entities/Technician';
import { MetricsCalculator } from '@/core/metrics/MetricsCalculator';
import { formatOutput } from '@/core/output/formatter';
import { Scheduler } from '@/core/scheduler/Scheduler';
import type { LabInput } from '@/core/types/labInput';
import type { PlanifyLabOutput } from '@/core/types/labOutput';

export function planifyLab(input: LabInput): PlanifyLabOutput {
    const samples = input.samples.map((dto) => new Sample(dto));
    const technicians = input.technicians.map((dto) => new Technician(dto));
    const equipments = input.equipment.map((dto) => new Equipment(dto));

    const scheduleResult = new Scheduler().schedule(samples, technicians, equipments);
    const metrics = new MetricsCalculator().calculate(scheduleResult.schedule, samples, technicians, equipments);

    return formatOutput(input, scheduleResult, metrics, samples, technicians);
}
