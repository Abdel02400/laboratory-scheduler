import type { MetadataLabel } from '@/core/constants/metadataLabels';
import type { TechnicianId } from '@/core/types/primitives/ids';

export interface LunchBreakInfo {
    technicianId: TechnicianId;
    planned: string;
    actual: string;
    reason: string;
}

export interface MetadataOutput {
    lunchBreaks?: LunchBreakInfo[];
    constraintsApplied: MetadataLabel[];
}
