import { readFileSync } from 'node:fs';

import { Equipment } from '@/core/entities/Equipment';
import { Sample } from '@/core/entities/Sample';
import { Technician } from '@/core/entities/Technician';
import type { LabInput } from '@/core/types/labInput';

export interface LoadedLab {
    samples: Sample[];
    technicians: Technician[];
    equipment: Equipment[];
}

export function loadLabInput(filePath: string): LoadedLab {
    const raw = readFileSync(filePath, 'utf8');
    const input = JSON.parse(raw) as LabInput;

    return {
        samples: input.samples.map((dto) => new Sample(dto)),
        technicians: input.technicians.map((dto) => new Technician(dto)),
        equipment: input.equipment.map((dto) => new Equipment(dto)),
    };
}
