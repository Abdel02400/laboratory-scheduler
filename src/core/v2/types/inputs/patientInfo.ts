import type { Diagnosis } from '@/core/v2/types/enums/diagnosis';
import type { Service } from '@/core/v2/types/enums/service';

export interface PatientInfo {
    age: number;
    service: Service;
    diagnosis: Diagnosis;
}
