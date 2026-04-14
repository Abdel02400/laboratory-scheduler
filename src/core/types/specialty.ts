export const SPECIALTY = {
  BLOOD: "BLOOD",
  CHEMISTRY: "CHEMISTRY",
  MICROBIOLOGY: "MICROBIOLOGY",
  IMMUNOLOGY: "IMMUNOLOGY",
  GENETICS: "GENETICS",
} as const;

export type Specialty = (typeof SPECIALTY)[keyof typeof SPECIALTY];

export const SPECIALTIES = Object.values(SPECIALTY) as readonly Specialty[];
