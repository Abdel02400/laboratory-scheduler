import type { AnalysisType } from '@/core/types/enums/analysis';
import type { Priority } from '@/core/types/enums/priority';
import type { SampleType } from '@/core/types/enums/sampleType';
import type { PatientInfo } from '@/core/types/inputs/patientInfo';
import type { SampleInput } from '@/core/types/inputs/sample';
import type { PatientId, SampleId } from '@/core/types/primitives/ids';

export class Sample {
    private readonly _id: SampleId;
    private readonly _type: SampleType;
    private readonly _priority: Priority;
    private readonly _analysisTime: number;
    private readonly _arrivalTime: string;
    private readonly _patientId?: PatientId;
    private readonly _analysisType?: AnalysisType;
    private readonly _patientInfo?: PatientInfo;

    constructor(dto: SampleInput) {
        this._id = dto.id;
        this._type = dto.type;
        this._priority = dto.priority;
        this._analysisTime = dto.analysisTime;
        this._arrivalTime = dto.arrivalTime;
        this._patientId = dto.patientId;
        this._analysisType = dto.analysisType;
        this._patientInfo = dto.patientInfo;
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    get priority() {
        return this._priority;
    }

    get analysisTime() {
        return this._analysisTime;
    }

    get arrivalTime() {
        return this._arrivalTime;
    }

    get patientId() {
        return this._patientId;
    }

    get analysisType() {
        return this._analysisType;
    }

    get patientInfo() {
        return this._patientInfo;
    }
}
