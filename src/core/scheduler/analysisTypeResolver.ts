import type { Equipment } from '@/core/entities/Equipment';
import type { Sample } from '@/core/entities/Sample';

export interface EquipmentCandidates {
    primary: Equipment[];
    fallback: Equipment[];
}

function matchesAnalysis(analysisType: string, compatibleTypes: string[]): boolean {
    const lowered = analysisType.toLowerCase();
    return compatibleTypes.some((ct) => {
        const target = ct.toLowerCase();
        return target === lowered || lowered.includes(target);
    });
}

export function findCompatibleEquipments(sample: Sample, equipments: Equipment[]): EquipmentCandidates {
    const primary = equipments.filter((eq) => matchesAnalysis(sample.getAnalysisType(), eq.getCompatibleTypes()));
    const fallback = equipments.filter((eq) => eq.getType() === sample.getType() && !primary.includes(eq));
    return { primary, fallback };
}

export function findEquipmentForSample(sample: Sample, equipments: Equipment[]): Equipment | null {
    const { primary, fallback } = findCompatibleEquipments(sample, equipments);
    return primary[0] ?? fallback[0] ?? null;
}
