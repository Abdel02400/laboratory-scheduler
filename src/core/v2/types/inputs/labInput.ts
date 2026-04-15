import type { ConstraintsInput } from '@/core/v2/types/inputs/constraints';
import type { EquipmentInput } from '@/core/v2/types/inputs/equipment';
import type { LaboratoryInput } from '@/core/v2/types/inputs/laboratory';
import type { SampleInput } from '@/core/v2/types/inputs/sample';
import type { TechnicianInput } from '@/core/v2/types/inputs/technician';

export interface LabInput {
    samples: SampleInput[];
    technicians: TechnicianInput[];
    equipment: EquipmentInput[];
    laboratory?: LaboratoryInput;
    constraints?: ConstraintsInput;
}
