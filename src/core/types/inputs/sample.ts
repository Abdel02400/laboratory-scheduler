import type { AnalysisType } from '@/core/types/enums/analysis';
import type { Priority } from '@/core/types/enums/priority';
import type { SampleType } from '@/core/types/enums/sampleType';
import type { PatientInfo } from '@/core/types/inputs/patientInfo';
import type { PatientId, SampleId } from '@/core/types/primitives/ids';

export interface SampleInput {
    id: SampleId;
    type: SampleType;
    priority: Priority;
    analysisTime: number;
    arrivalTime: string;
    patientId?: PatientId;
    analysisType?: AnalysisType;
    patientInfo?: PatientInfo;
}
