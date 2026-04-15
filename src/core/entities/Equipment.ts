import type { CompatibleType } from '@/core/types/enums/compatibleType';
import type { Specialty } from '@/core/types/enums/specialty';
import type { EquipmentInput } from '@/core/types/inputs/equipment';
import type { EquipmentId } from '@/core/types/primitives/ids';

export class Equipment {
    private readonly _id: EquipmentId;
    private readonly _name: string;
    private readonly _type: Specialty;
    private readonly _available?: boolean;
    private readonly _compatibleTypes?: CompatibleType[];
    private readonly _capacity?: number;
    private readonly _cleaningTime?: number;
    private readonly _maintenanceWindow?: string;

    constructor(dto: EquipmentInput) {
        this._id = dto.id;
        this._name = dto.name;
        this._type = dto.type;
        this._available = dto.available;
        this._compatibleTypes = dto.compatibleTypes;
        this._capacity = dto.capacity;
        this._cleaningTime = dto.cleaningTime;
        this._maintenanceWindow = dto.maintenanceWindow;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get type() {
        return this._type;
    }

    get available() {
        return this._available;
    }

    get compatibleTypes() {
        return this._compatibleTypes;
    }

    get capacity() {
        return this._capacity;
    }

    get cleaningTime() {
        return this._cleaningTime;
    }

    get maintenanceWindow() {
        return this._maintenanceWindow;
    }
}
