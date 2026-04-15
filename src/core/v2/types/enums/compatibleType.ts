export const COMPATIBLE_TYPES = {
    HEMOGRAMME: 'Hémogramme',
    NUMERATION: 'Numération',
    COAGULATION: 'Coagulation',
    FROTTIS: 'Frottis',
    BILAN_HEPATIQUE: 'Bilan hépatique',
    LIPIDES: 'Lipides',
    ELECTROLYTES: 'Électrolytes',
    TROPONINE: 'Troponine',
    HBA1C: 'HbA1c',
    ECBU: 'ECBU',
    HEMOCULTURE: 'Hémoculture',
    PARASITOLOGIE: 'Parasitologie',
    PRELEVEMENT_GORGE: 'Prélèvement gorge',
    SEROLOGIE: 'Sérologie',
    ALLERGENES: 'Allergènes',
    VACCINATION: 'Vaccination',
    TITRE_ANTICORPS: 'Titre anticorps',
    CARYOTYPE: 'Caryotype',
    CONSEIL_GENETIQUE: 'Conseil génétique',
    PHARMACOGENETIQUE: 'Pharmacogénétique',
} as const;

export type CompatibleType = (typeof COMPATIBLE_TYPES)[keyof typeof COMPATIBLE_TYPES];

export const COMPATIBLE_TYPE_LIST = Object.values(COMPATIBLE_TYPES) as readonly CompatibleType[];
