import type { Diagnosis } from '@/core/types/enums/diagnosis';
import type { Service } from '@/core/types/enums/service';

export interface PatientInfo {
    age: number;
    service: Service;
    diagnosis: Diagnosis;
}
