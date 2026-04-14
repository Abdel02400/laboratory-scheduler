export const DIAGNOSES = {
  SUSPICION_HEMORRAGIE: "Suspicion hémorragie",
  INFARCTUS_SUSPECTE: "Infarctus suspecté",
  SEPSIS_SEVERE: "Sepsis sévère",
  CHOC_ANAPHYLACTIQUE: "Choc anaphylactique",
  HEPATITE_VIRALE: "Hépatite virale",
  PRE_OPERATOIRE: "Pré-opératoire",
  INFECTION_URINAIRE: "Infection urinaire",
  SYNDROME_CHROMOSOMIQUE: "Syndrome chromosomique",
  EXPOSITION_VIH: "Exposition VIH",
  LEUCEMIE_SUSPECTEE: "Leucémie suspectée",
  DESHYDRATATION: "Déshydratation",
  PARASITOSE_INTESTINALE: "Parasitose intestinale",
  CONTROLE_CHOLESTEROL: "Contrôle cholestérol",
  VISITE_SYSTEMATIQUE: "Visite systématique",
  TITRE_ANTICORPS: "Titre anticorps",
  ANTECEDENTS_FAMILIAUX: "Antécédents familiaux",
  ANGINE_RECIDIVANTE: "Angine récidivante",
  DIABETE_TYPE_2: "Diabète type 2",
  INFLAMMATION_CHRONIQUE: "Inflammation chronique",
  ADAPTATION_THERAPIE: "Adaptation thérapie",
} as const;

export type Diagnosis = (typeof DIAGNOSES)[keyof typeof DIAGNOSES];

export const DIAGNOSIS_LIST = Object.values(DIAGNOSES) as readonly Diagnosis[];
