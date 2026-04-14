import type { Specialty } from '@/core/types/specialty';
import type { Technician as TechnicianDTO, TechnicianId } from '@/core/types/technician';
import type { TimeString } from '@/core/types/time';

export class Technician {
    private readonly id: TechnicianId;
    private readonly name: string;
    private readonly specialty: Specialty[];
    private readonly efficiency: number;
    private readonly startTime: TimeString;
    private readonly endTime: TimeString;
    private readonly lunchBreak: string;

    constructor(dto: TechnicianDTO) {
        this.id = dto.id;
        this.name = dto.name;
        this.specialty = dto.specialty;
        this.efficiency = dto.efficiency;
        this.startTime = dto.startTime;
        this.endTime = dto.endTime;
        this.lunchBreak = dto.lunchBreak;
    }

    getId(): TechnicianId {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getSpecialty(): Specialty[] {
        return this.specialty;
    }

    getEfficiency(): number {
        return this.efficiency;
    }

    getStartTime(): TimeString {
        return this.startTime;
    }

    getEndTime(): TimeString {
        return this.endTime;
    }

    getLunchBreak(): string {
        return this.lunchBreak;
    }
}
