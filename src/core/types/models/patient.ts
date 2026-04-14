import type { Diagnosis } from '@/core/types/enums/diagnosis';
import type { Service } from '@/core/types/enums/service';
import type { Range } from '@/core/types/primitives/number';

export type Age = Range<0, 200>;

export interface PatientInfo {
    age: Age;
    service: Service;
    diagnosis: Diagnosis;
}
