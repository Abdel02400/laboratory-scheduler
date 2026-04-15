import type { CompatibleType } from '@/core/types/enums/compatibleType';
import type { Specialty } from '@/core/types/enums/specialty';
import type { EquipmentId } from '@/core/types/primitives/ids';

export interface EquipmentInput {
    id: EquipmentId;
    name: string;
    type: Specialty;
    available?: boolean;
    compatibleTypes?: CompatibleType[];
    capacity?: number;
    cleaningTime?: number;
    maintenanceWindow?: string;
}
