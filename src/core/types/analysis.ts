import type { Range } from "@/core/types/number";

export const ANALYSIS_TYPES = {
  NUMERATION_COMPLETE: "Numération complète",
  TROPONINE: "Troponine",
  HEMOCULTURE_URGENTE: "Hémoculture urgente",
  ALLERGENES_CRITIQUES: "Allergènes critiques",
  BILAN_HEPATIQUE: "Bilan hépatique",
  COAGULATION: "Coagulation",
  ECBU: "ECBU",
  CARYOTYPE_URGENT: "Caryotype urgent",
  SEROLOGIE_HIV: "Sérologie HIV",
  FROTTIS_SANGUIN: "Frottis sanguin",
  ELECTROLYTES: "Électrolytes",
  PARASITOLOGIE: "Parasitologie",
  BILAN_LIPIDIQUE: "Bilan lipidique",
  HEMOGRAMME_STANDARD: "Hémogramme standard",
  VACCINATION_CONTROLE: "Vaccination contrôle",
  CONSEIL_GENETIQUE: "Conseil génétique",
  PRELEVEMENT_GORGE: "Prélèvement gorge",
  HBA1C: "HbA1c",
  VITESSE_SEDIMENTATION: "Vitesse sédimentation",
  PHARMACOGENETIQUE: "Pharmacogénétique",
} as const;

export type AnalysisType = (typeof ANALYSIS_TYPES)[keyof typeof ANALYSIS_TYPES];

export const ANALYSIS_TYPE_LIST = Object.values(ANALYSIS_TYPES) as readonly AnalysisType[];

export type AnalysisTime = Range<1, 480>;