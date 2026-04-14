import type { Specialty } from '@/core/types/specialty';
import type { TimeString } from '@/core/types/time';

export type TechnicianId = string & { readonly __brand: 'TechnicianId' };

export const toTechnicianId = (value: string): TechnicianId => value as TechnicianId;

export interface Technician {
    id: TechnicianId;
    name: string;
    specialty: Specialty[];
    efficiency: number;
    startTime: TimeString;
    endTime: TimeString;
    lunchBreak: string;
}
