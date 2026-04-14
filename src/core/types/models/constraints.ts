import type { Priority } from '@/core/types/enums/priority';

export interface Constraints {
    maxProcessingTime: number;
    priorityRules: Priority[];
    contaminationPrevention: boolean;
    parallelProcessing: boolean;
}
