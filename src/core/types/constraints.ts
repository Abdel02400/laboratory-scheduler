import type { Priority } from '@/core/types/priority';

export interface Constraints {
    maxProcessingTime: number;
    priorityRules: Priority[];
    contaminationPrevention: boolean;
    parallelProcessing: boolean;
}
