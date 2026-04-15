import type { CompatibleType } from '@/core/v2/types/enums/compatibleType';
import type { Specialty } from '@/core/v2/types/enums/specialty';
import type { EquipmentId } from '@/core/v2/types/primitives/ids';

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
