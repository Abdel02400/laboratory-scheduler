import type { AnalysisTime, AnalysisType } from '@/core/types/enums/analysis';
import type { PatientInfo } from '@/core/types/models/patient';
import type { Priority } from '@/core/types/enums/priority';
import type { TimeString } from '@/core/types/primitives/time';

export type SampleId = string & { readonly __brand: 'SampleId' };

export const toSampleId = (value: string): SampleId => value as SampleId;

export const SAMPLE_TYPE = {
    BLOOD: 'BLOOD',
    URINE: 'URINE',
    TISSUE: 'TISSUE',
} as const;

export type SampleType = (typeof SAMPLE_TYPE)[keyof typeof SAMPLE_TYPE];

export const SAMPLE_TYPES = Object.values(SAMPLE_TYPE) as readonly SampleType[];

export interface Sample {
    id: SampleId;
    priority: Priority;
    type: SampleType;
    analysisType: AnalysisType;
    analysisTime: AnalysisTime;
    arrivalTime: TimeString;
    patientInfo: PatientInfo;
}
