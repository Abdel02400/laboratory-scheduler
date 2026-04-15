import type { EquipmentId } from '@/core/types/models/equipment';
import type { SampleId } from '@/core/types/models/sample';
import type { TechnicianId } from '@/core/types/models/technician';
import type { Priority } from '@/core/types/enums/priority';

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

export interface ScheduleEntryOutput {
    sampleId: string;
    priority: Priority;
    technicianId: string;
    equipmentId: string;
    startTime: string;
    endTime: string;
    duration: number;
    analysisType: string;
    efficiency: number;
    lunchBreak: string | null;
    cleaningRequired: boolean;
}

export interface UnscheduledEntryOutput {
    sampleId: string;
    reason: string;
}
