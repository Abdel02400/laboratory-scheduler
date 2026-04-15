import type { Priority } from '@/core/types/enums/priority';

export interface ConstraintsInput {
    maxProcessingTime?: number;
    priorityRules?: Priority[];
    contaminationPrevention?: boolean;
    parallelProcessing?: boolean;
}
