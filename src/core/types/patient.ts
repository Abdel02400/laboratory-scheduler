import type { Diagnosis } from "@/core/types/diagnosis";
import type { Service } from "@/core/types/service";

export interface PatientInfo {
  age: number;
  service: Service;
  diagnosis: Diagnosis;
}
