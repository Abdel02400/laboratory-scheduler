import type { ConstraintsInput } from '@/core/types/inputs/constraints';
import type { EquipmentInput } from '@/core/types/inputs/equipment';
import type { LaboratoryInput } from '@/core/types/inputs/laboratory';
import type { SampleInput } from '@/core/types/inputs/sample';
import type { TechnicianInput } from '@/core/types/inputs/technician';

export interface LabInput {
    samples: SampleInput[];
    technicians: TechnicianInput[];
    equipment: EquipmentInput[];
    laboratory?: LaboratoryInput;
    constraints?: ConstraintsInput;
}
