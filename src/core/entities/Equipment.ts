import type { Equipment as EquipmentDTO, EquipmentId } from '@/core/types/equipment';
import type { Specialty } from '@/core/types/specialty';

export class Equipment {
    private readonly id: EquipmentId;
    private readonly name: string;
    private readonly type: Specialty;
    private readonly compatibleTypes: string[];
    private readonly capacity: number;
    private readonly maintenanceWindow: string;
    private readonly cleaningTime: number;

    constructor(dto: EquipmentDTO) {
        this.id = dto.id;
        this.name = dto.name;
        this.type = dto.type;
        this.compatibleTypes = dto.compatibleTypes;
        this.capacity = dto.capacity;
        this.maintenanceWindow = dto.maintenanceWindow;
        this.cleaningTime = dto.cleaningTime;
    }

    getId(): EquipmentId {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getType(): Specialty {
        return this.type;
    }

    getCompatibleTypes(): string[] {
        return this.compatibleTypes;
    }

    getCapacity(): number {
        return this.capacity;
    }

    getMaintenanceWindow(): string {
        return this.maintenanceWindow;
    }

    getCleaningTime(): number {
        return this.cleaningTime;
    }
}
