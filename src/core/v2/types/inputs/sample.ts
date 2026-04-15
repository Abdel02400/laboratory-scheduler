import type { AnalysisType } from '@/core/v2/types/enums/analysis';
import type { Priority } from '@/core/v2/types/enums/priority';
import type { SampleType } from '@/core/v2/types/enums/sampleType';
import type { PatientInfo } from '@/core/v2/types/inputs/patientInfo';
import type { PatientId, SampleId } from '@/core/v2/types/primitives/ids';

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
