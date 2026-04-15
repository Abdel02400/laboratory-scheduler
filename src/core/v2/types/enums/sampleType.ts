export const SAMPLE_TYPE = {
    BLOOD: 'BLOOD',
    URINE: 'URINE',
    TISSUE: 'TISSUE',
} as const;

export type SampleType = (typeof SAMPLE_TYPE)[keyof typeof SAMPLE_TYPE];

export const SAMPLE_TYPES = Object.values(SAMPLE_TYPE) as readonly SampleType[];
