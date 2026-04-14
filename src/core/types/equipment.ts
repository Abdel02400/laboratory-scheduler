import type { Specialty } from '@/core/types/specialty';

export type EquipmentId = string & { readonly __brand: 'EquipmentId' };

export const toEquipmentId = (value: string): EquipmentId => value as EquipmentId;

export interface Equipment {
    id: EquipmentId;
    name: string;
    type: Specialty;
    compatibleTypes: string[];
    capacity: number;
    maintenanceWindow: string;
    cleaningTime: number;
}
