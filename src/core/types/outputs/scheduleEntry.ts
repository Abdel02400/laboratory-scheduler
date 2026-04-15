import type { AnalysisType } from '@/core/types/enums/analysis';
import type { Priority } from '@/core/types/enums/priority';
import type { EquipmentId, SampleId, TechnicianId } from '@/core/types/primitives/ids';

export interface ScheduleEntryOutput {
    sampleId: SampleId;
    priority: Priority;
    technicianId: TechnicianId;
    equipmentId: EquipmentId;
    startTime: string;
    endTime: string;
    duration: number;
    analysisType: AnalysisType | null;
    efficiency: number | null;
    lunchBreak: string | null;
    cleaningRequired: boolean;
}

export interface UnscheduledEntryOutput {
    sampleId: SampleId;
    reason: string;
}
