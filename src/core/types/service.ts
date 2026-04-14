export const SERVICES = {
    URGENCES: 'Urgences',
    CARDIOLOGIE: 'Cardiologie',
    REANIMATION: 'Réanimation',
    PEDIATRIE: 'Pédiatrie',
    GASTROENTEROLOGIE: 'Gastroentérologie',
    CHIRURGIE: 'Chirurgie',
    UROLOGIE: 'Urologie',
    GENETIQUE_MEDICALE: 'Génétique médicale',
    INFECTIOLOGIE: 'Infectiologie',
    HEMATOLOGIE: 'Hématologie',
    GERIATRIE: 'Gériatrie',
    MEDECINE_GENERALE: 'Médecine générale',
    MEDECINE_DU_TRAVAIL: 'Médecine du travail',
    MEDECINE_PREVENTIVE: 'Médecine préventive',
    CONSULTATION_GENETIQUE: 'Consultation génétique',
    ORL: 'ORL',
    ENDOCRINOLOGIE: 'Endocrinologie',
    RHUMATOLOGIE: 'Rhumatologie',
    ONCOLOGIE: 'Oncologie',
} as const;

export type Service = (typeof SERVICES)[keyof typeof SERVICES];

export const SERVICE_LIST = Object.values(SERVICES) as readonly Service[];
