import type { Diagnosis } from '@/core/types/diagnosis';
import type { Service } from '@/core/types/service';
import type { Range } from '@/core/types/number';

export type Age = Range<0, 200>;

export interface PatientInfo {
    age: Age;
    service: Service;
    diagnosis: Diagnosis;
}
