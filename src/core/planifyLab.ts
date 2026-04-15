import { Constraints } from '@/core/entities/Constraints';
import { Equipment } from '@/core/entities/Equipment';
import { Laboratory } from '@/core/entities/Laboratory';
import { Sample } from '@/core/entities/Sample';
import { Technician } from '@/core/entities/Technician';
import { MetricsCalculator } from '@/core/metrics/MetricsCalculator';
import { formatOutput } from '@/core/output/formatter';
import { Scheduler } from '@/core/scheduler/Scheduler';
import type { LabInput } from '@/core/types/inputs/labInput';
import type { PlanifyLabOutput } from '@/core/types/outputs/labOutput';

export function planifyLab(input: LabInput): PlanifyLabOutput {
    const samples = input.samples.map((dto) => new Sample(dto));
    const technicians = input.technicians.map((dto) => new Technician(dto));
    const equipments = input.equipment.map((dto) => new Equipment(dto));
    const laboratory = input.laboratory ? new Laboratory(input.laboratory) : undefined;
    const constraints = input.constraints ? new Constraints(input.constraints) : undefined;

    const { schedule, unscheduled, lunchInterruptions } = new Scheduler().schedule(samples, technicians, equipments, laboratory, constraints);
    const metrics = new MetricsCalculator().calculate(schedule, samples, technicians, equipments, lunchInterruptions);

    return formatOutput(schedule, unscheduled, metrics, samples, technicians, equipments, laboratory);
}
