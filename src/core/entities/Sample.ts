import type { Sample as SampleDTO } from '@/core/types/sample';

export class Sample {
    private readonly dto: SampleDTO;

    constructor(dto: SampleDTO) {
        this.dto = dto;
    }

    get id() {
        return this.dto.id;
    }
}
