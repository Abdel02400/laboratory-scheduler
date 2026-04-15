import type { Priority } from '@/core/types/enums/priority';
import type { EquipmentId, SampleId, TechnicianId } from '@/core/types/primitives/ids';

export interface ScheduleEntry {
    sampleId: SampleId;
    technicianId: TechnicianId;
    equipmentId: EquipmentId;
    startTime: number;
    endTime: number;
    priority: Priority;
}

export interface UnscheduledEntry {
    sampleId: SampleId;
    reason: string;
}

export interface ScheduleResult {
    schedule: ScheduleEntry[];
    unscheduled: UnscheduledEntry[];
    lunchInterruptions: number;
}
