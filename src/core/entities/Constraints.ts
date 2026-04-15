import type { Priority } from '@/core/types/enums/priority';
import type { ConstraintsInput } from '@/core/types/inputs/constraints';

export class Constraints {
    private readonly _maxProcessingTime?: number;
    private readonly _priorityRules?: Priority[];
    private readonly _contaminationPrevention?: boolean;
    private readonly _parallelProcessing?: boolean;

    constructor(dto: ConstraintsInput) {
        this._maxProcessingTime = dto.maxProcessingTime;
        this._priorityRules = dto.priorityRules;
        this._contaminationPrevention = dto.contaminationPrevention;
        this._parallelProcessing = dto.parallelProcessing;
    }

    get maxProcessingTime() {
        return this._maxProcessingTime;
    }

    get priorityRules() {
        return this._priorityRules;
    }

    get contaminationPrevention() {
        return this._contaminationPrevention;
    }

    get parallelProcessing() {
        return this._parallelProcessing;
    }
}
