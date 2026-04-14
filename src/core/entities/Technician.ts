import type { Technician as TechnicianDTO } from '@/core/types/technician';

export class Technician {
    private readonly dto: TechnicianDTO;

    constructor(dto: TechnicianDTO) {
        this.dto = dto;
    }

    get id() {
        return this.dto.id;
    }
}
