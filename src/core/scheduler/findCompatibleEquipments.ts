import type { Equipment } from '@/core/entities/Equipment';
import type { Sample } from '@/core/entities/Sample';

export function findCompatibleEquipments(sample: Sample, equipments: Equipment[]): Equipment[] {
    return equipments.filter((eq) => isCompatible(sample, eq));
}

function isCompatible(sample: Sample, equipment: Equipment): boolean {
    if (sample.analysisType !== undefined && equipment.compatibleTypes !== undefined) {
        return equipment.compatibleTypes.some((ct) => sample.analysisType!.toLowerCase().includes(ct.toLowerCase()));
    }
    return equipment.type === sample.type;
}
