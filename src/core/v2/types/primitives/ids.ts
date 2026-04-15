export type SampleId = string & { readonly __brand: 'SampleId' };
export type TechnicianId = string & { readonly __brand: 'TechnicianId' };
export type EquipmentId = string & { readonly __brand: 'EquipmentId' };
export type PatientId = string & { readonly __brand: 'PatientId' };

export const toSampleId = (value: string): SampleId => value as SampleId;
export const toTechnicianId = (value: string): TechnicianId => value as TechnicianId;
export const toEquipmentId = (value: string): EquipmentId => value as EquipmentId;
export const toPatientId = (value: string): PatientId => value as PatientId;
