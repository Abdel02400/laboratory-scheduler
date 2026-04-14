import type { AnalysisTime, AnalysisType } from '@/core/types/enums/analysis';
import type { PatientInfo } from '@/core/types/models/patient';
import { PRIORITY, type Priority } from '@/core/types/enums/priority';
import type { Sample as SampleDTO, SampleId, SampleType } from '@/core/types/models/sample';
import type { TimeString } from '@/core/types/primitives/time';
import { parseTime } from '@/core/utils/time';

export class Sample {
    private readonly id: SampleId;
    private readonly priority: Priority;
    private readonly type: SampleType;
    private readonly analysisType: AnalysisType;
    private readonly analysisTime: AnalysisTime;
    private readonly arrivalTime: TimeString;
    private readonly patientInfo: PatientInfo;

    constructor(dto: SampleDTO) {
        this.id = dto.id;
        this.priority = dto.priority;
        this.type = dto.type;
        this.analysisType = dto.analysisType;
        this.analysisTime = dto.analysisTime;
        this.arrivalTime = dto.arrivalTime;
        this.patientInfo = dto.patientInfo;
    }

    getId(): SampleId {
        return this.id;
    }

    getPriority(): Priority {
        return this.priority;
    }

    getType(): SampleType {
        return this.type;
    }

    getAnalysisType(): AnalysisType {
        return this.analysisType;
    }

    getAnalysisTime(): AnalysisTime {
        return this.analysisTime;
    }

    getArrivalTime(): TimeString {
        return this.arrivalTime;
    }

    getPatientInfo(): PatientInfo {
        return this.patientInfo;
    }

    arrivalMinutes(): number {
        return parseTime(this.arrivalTime);
    }

    isStat(): boolean {
        return this.priority === PRIORITY.STAT;
    }

    isUrgent(): boolean {
        return this.priority === PRIORITY.URGENT;
    }
}
