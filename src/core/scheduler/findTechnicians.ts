import type { Equipment } from '@/core/entities/Equipment';
import type { Sample } from '@/core/entities/Sample';
import type { Technician } from '@/core/entities/Technician';

export function findCompatibleTechnicians(sample: Sample, equipment: Equipment, technicians: Technician[]): Technician[] {
    const byType = technicians.filter((t) => t.canHandle(sample.getType()));
    if (byType.length > 0) {
        return byType;
    }

    return technicians.filter((t) => t.canHandle(equipment.getType()));
}
