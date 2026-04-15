import type { Priority } from '@/core/v2/types/enums/priority';

export interface ConstraintsInput {
    maxProcessingTime?: number;
    priorityRules?: Priority[];
    contaminationPrevention?: boolean;
    parallelProcessing?: boolean;
}
