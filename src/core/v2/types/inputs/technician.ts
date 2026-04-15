import type { Specialty } from '@/core/v2/types/enums/specialty';
import type { TechnicianId } from '@/core/v2/types/primitives/ids';

export interface TechnicianInput {
    id: TechnicianId;
    name: string;
    speciality?: Specialty;
    specialty?: Specialty[];
    startTime: string;
    endTime: string;
    efficiency?: number;
    lunchBreak?: string;
}
