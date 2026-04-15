import type { LaboratoryInput } from '@/core/types/inputs/laboratory';

export class Laboratory {
    private readonly _name: string;
    private readonly _openingHours: string;
    private readonly _date: string;

    constructor(dto: LaboratoryInput) {
        this._name = dto.name;
        this._openingHours = dto.openingHours;
        this._date = dto.date;
    }

    get name() {
        return this._name;
    }

    get openingHours() {
        return this._openingHours;
    }

    get date() {
        return this._date;
    }
}
