import type { Equipment as EquipmentDTO } from '@/core/types/equipment';

export class Equipment {
    private readonly dto: EquipmentDTO;

    constructor(dto: EquipmentDTO) {
        this.dto = dto;
    }

    get id() {
        return this.dto.id;
    }
}
