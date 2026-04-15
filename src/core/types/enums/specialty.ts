export const SPECIALTY = {
    BLOOD: 'BLOOD',
    URINE: 'URINE',
    TISSUE: 'TISSUE',
    CHEMISTRY: 'CHEMISTRY',
    MICROBIOLOGY: 'MICROBIOLOGY',
    IMMUNOLOGY: 'IMMUNOLOGY',
    GENETICS: 'GENETICS',
    GENERAL: 'GENERAL',
} as const;

export type Specialty = (typeof SPECIALTY)[keyof typeof SPECIALTY];

export const SPECIALTIES = Object.values(SPECIALTY) as readonly Specialty[];
