export interface LunchBreakInfo {
    technicianId: string;
    planned: string;
    actual: string;
    reason: string;
}

export interface MetadataOutput {
    lunchBreaks: LunchBreakInfo[];
    constraintsApplied: string[];
}
