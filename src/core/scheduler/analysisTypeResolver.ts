import type { Equipment } from '@/core/entities/Equipment';
import type { Sample } from '@/core/entities/Sample';

export function findCompatibleEquipments(sample: Sample, equipments: Equipment[]): Equipment[] {
    const byAnalysis = equipments.filter((eq) => eq.getCompatibleTypes().includes(sample.getAnalysisType()));
    const byType = equipments.filter((eq) => eq.getType() === sample.getType() && !byAnalysis.includes(eq));
    return [...byAnalysis, ...byType];
}

export function findEquipmentForSample(sample: Sample, equipments: Equipment[]): Equipment | null {
    return findCompatibleEquipments(sample, equipments)[0] ?? null;
}
