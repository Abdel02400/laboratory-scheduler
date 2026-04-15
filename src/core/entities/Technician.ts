import type { Specialty } from '@/core/types/enums/specialty';
import type { TechnicianInput } from '@/core/types/inputs/technician';
import type { TechnicianId } from '@/core/types/primitives/ids';

export class Technician {
    private readonly _id: TechnicianId;
    private readonly _name: string;
    private readonly _speciality?: Specialty;
    private readonly _specialty?: Specialty[];
    private readonly _startTime: string;
    private readonly _endTime: string;
    private readonly _efficiency?: number;
    private readonly _lunchBreak?: string;

    constructor(dto: TechnicianInput) {
        this._id = dto.id;
        this._name = dto.name;
        this._speciality = dto.speciality;
        this._specialty = dto.specialty;
        this._startTime = dto.startTime;
        this._endTime = dto.endTime;
        this._efficiency = dto.efficiency;
        this._lunchBreak = dto.lunchBreak;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get speciality() {
        return this._speciality;
    }

    get specialty() {
        return this._specialty;
    }

    get startTime() {
        return this._startTime;
    }

    get endTime() {
        return this._endTime;
    }

    get efficiency() {
        return this._efficiency;
    }

    get lunchBreak() {
        return this._lunchBreak;
    }
}
