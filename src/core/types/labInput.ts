import type { Constraints } from '@/core/types/models/constraints';
import type { Equipment } from '@/core/types/models/equipment';
import type { Laboratory } from '@/core/types/models/laboratory';
import type { Sample } from '@/core/types/models/sample';
import type { Technician } from '@/core/types/models/technician';

export interface LabInput {
    laboratory: Laboratory;
    samples: Sample[];
    technicians: Technician[];
    equipment: Equipment[];
    constraints: Constraints;
}
