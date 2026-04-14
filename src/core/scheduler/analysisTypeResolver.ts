import type { Equipment } from '@/core/entities/Equipment';
import type { Sample } from '@/core/entities/Sample';

export function findEquipmentForSample(sample: Sample, equipments: Equipment[]): Equipment | null {
    for (const equipment of equipments) {
        if (equipment.getCompatibleTypes().includes(sample.getAnalysisType())) {
            return equipment;
        }
    }

    for (const equipment of equipments) {
        if (equipment.getType() === sample.getType()) {
            return equipment;
        }
    }

    return null;
}
