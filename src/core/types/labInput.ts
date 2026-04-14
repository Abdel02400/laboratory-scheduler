import type { Constraints } from '@/core/types/constraints';
import type { Equipment } from '@/core/types/equipment';
import type { Laboratory } from '@/core/types/laboratory';
import type { Sample } from '@/core/types/sample';
import type { Technician } from '@/core/types/technician';

export interface LabInput {
    laboratory: Laboratory;
    samples: Sample[];
    technicians: Technician[];
    equipment: Equipment[];
    constraints: Constraints;
}
