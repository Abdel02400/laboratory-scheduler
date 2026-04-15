import { LUNCH_BREAK_REASONS } from '@/core/constants/lunchBreakReasons';
import { METADATA_LABELS, type MetadataLabel } from '@/core/constants/metadataLabels';
import type { Equipment } from '@/core/entities/Equipment';
import type { Laboratory } from '@/core/entities/Laboratory';
import type { Sample } from '@/core/entities/Sample';
import type { Technician } from '@/core/entities/Technician';
import type { Metrics } from '@/core/types/metrics';
import type { LaboratoryOutput } from '@/core/types/outputs/laboratory';
import type { LunchBreakInfo, MetadataOutput } from '@/core/types/outputs/metadata';
import type { PlanifyLabOutput } from '@/core/types/outputs/labOutput';
import type { ScheduleEntryOutput, UnscheduledEntryOutput } from '@/core/types/outputs/scheduleEntry';
import type { ScheduleEntry, UnscheduledEntry } from '@/core/types/schedule';
import { formatTime } from '@/core/utils/time';

const ALGORITHM_VERSION = 'v1.0';

export function formatOutput(schedule: ScheduleEntry[], unscheduled: UnscheduledEntry[], metrics: Metrics, samples: Sample[], technicians: Technician[], equipments: Equipment[], laboratory?: Laboratory): PlanifyLabOutput {
    const metadata = buildMetadata(technicians, equipments);

    return {
        ...(laboratory !== undefined ? { laboratory: formatLaboratory(laboratory, samples) } : {}),
        schedule: formatSchedule(schedule, samples, technicians),
        ...(unscheduled.length > 0 ? { unscheduled: formatUnscheduled(unscheduled) } : {}),
        metrics,
        ...(metadata !== undefined ? { metadata } : {}),
    };
}

function formatLaboratory(laboratory: Laboratory, samples: Sample[]): LaboratoryOutput {
    return {
        date: laboratory.date,
        processingDate: laboratory.date,
        totalSamples: samples.length,
        algorithmVersion: ALGORITHM_VERSION,
    };
}

function formatSchedule(entries: ScheduleEntry[], samples: Sample[], technicians: Technician[]): ScheduleEntryOutput[] {
    const sampleById = new Map(samples.map((s) => [s.id, s]));
    const techById = new Map(technicians.map((t) => [t.id, t]));
    const previousOnEquipment = new Set<string>();

    return entries.map((entry) => {
        const sample = sampleById.get(entry.sampleId);
        const tech = techById.get(entry.technicianId);
        const cleaningRequired = previousOnEquipment.has(entry.equipmentId);
        previousOnEquipment.add(entry.equipmentId);

        return {
            sampleId: entry.sampleId,
            priority: entry.priority,
            technicianId: entry.technicianId,
            equipmentId: entry.equipmentId,
            startTime: formatTime(entry.startTime),
            endTime: formatTime(entry.endTime),
            duration: entry.endTime - entry.startTime,
            analysisType: sample?.analysisType ?? null,
            efficiency: tech?.efficiency ?? null,
            lunchBreak: null,
            cleaningRequired,
        };
    });
}

function formatUnscheduled(entries: UnscheduledEntry[]): UnscheduledEntryOutput[] {
    return entries.map((e) => ({ sampleId: e.sampleId, reason: e.reason }));
}

function buildMetadata(technicians: Technician[], equipments: Equipment[]): MetadataOutput | undefined {
    const hasLunch = technicians.some((t) => t.lunchBreak !== undefined);
    const hasEfficiency = technicians.some((t) => t.efficiency !== undefined);
    const hasMaintenance = equipments.some((e) => e.maintenanceWindow !== undefined);
    const hasCleaning = equipments.some((e) => e.cleaningTime !== undefined);
    const hasCompatibleTypes = equipments.some((e) => e.compatibleTypes !== undefined && e.compatibleTypes.length > 0);
    const hasParallelism = equipments.some((e) => e.capacity !== undefined && e.capacity > 1);

    if (!hasLunch && !hasEfficiency && !hasMaintenance && !hasCleaning && !hasCompatibleTypes && !hasParallelism) {
        return undefined;
    }

    const constraintsApplied: MetadataLabel[] = [METADATA_LABELS.PRIORITY_MANAGEMENT, METADATA_LABELS.SPECIALIZATION_MATCHING, METADATA_LABELS.EQUIPMENT_COMPATIBILITY];
    if (hasParallelism) constraintsApplied.push(METADATA_LABELS.PARALLELISM_OPTIMIZATION);
    if (hasLunch) constraintsApplied.push(METADATA_LABELS.LUNCH_BREAKS);
    if (hasMaintenance) constraintsApplied.push(METADATA_LABELS.MAINTENANCE_AVOIDANCE);
    if (hasCleaning) constraintsApplied.push(METADATA_LABELS.CLEANING_DELAYS);
    if (hasEfficiency) constraintsApplied.push(METADATA_LABELS.EFFICIENCY_COEFFICIENTS);

    const lunchBreaks: LunchBreakInfo[] | undefined = hasLunch
        ? technicians.flatMap<LunchBreakInfo>((t) => {
              if (t.lunchBreak === undefined) {
                  return [];
              }
              return [
                  {
                      technicianId: t.id,
                      planned: t.lunchBreak,
                      actual: t.lunchBreak,
                      reason: LUNCH_BREAK_REASONS.ADJUSTED_FOR_OPTIMIZATION,
                  },
              ];
          })
        : undefined;

    return {
        ...(lunchBreaks !== undefined ? { lunchBreaks } : {}),
        constraintsApplied,
    };
}
