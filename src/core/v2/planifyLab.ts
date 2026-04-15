import type { LabInput } from '@/core/v2/types/inputs/labInput';

export function planifyLab(input: LabInput): unknown {
    return { received: input };
}
