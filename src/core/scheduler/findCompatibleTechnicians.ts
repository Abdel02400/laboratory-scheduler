import type { Equipment } from '@/core/entities/Equipment';
import type { Technician } from '@/core/entities/Technician';
import { SPECIALTY, type Specialty } from '@/core/types/enums/specialty';

export function findCompatibleTechnicians(equipment: Equipment, technicians: Technician[]): Technician[] {
    return technicians.filter((t) => isCompatible(t, equipment)).sort((a, b) => rank(a, equipment) - rank(b, equipment));
}

function rank(technician: Technician, equipment: Equipment): number {
    const specialties = getSpecialties(technician);
    if (specialties.includes(equipment.type)) {
        return specialties.length;
    }
    return Number.POSITIVE_INFINITY;
}

function isCompatible(technician: Technician, equipment: Equipment): boolean {
    const specialties = getSpecialties(technician);
    if (specialties.includes(SPECIALTY.GENERAL)) {
        return true;
    }
    return specialties.includes(equipment.type);
}

function getSpecialties(technician: Technician): Specialty[] {
    if (technician.specialty !== undefined) {
        return technician.specialty;
    }
    if (technician.speciality !== undefined) {
        return [technician.speciality];
    }
    return [];
}
