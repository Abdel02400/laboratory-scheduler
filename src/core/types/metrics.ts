import type { Priority } from '@/core/types/enums/priority';
import type { EquipmentId } from '@/core/types/models/equipment';
import type { TechnicianId } from '@/core/types/models/technician';

export interface Metrics {
    totalTime: number;
    averageWaitingTimeByPriority: Record<Priority, number>;
    technicianUtilization: Record<TechnicianId, number>;
    equipmentUtilization: Record<EquipmentId, number>;
    globalEfficiency: number;
    priorityRespectRate: number;
    parallelismRate: number;
}

export interface MetricsOutput {
    totalTime: number;
    efficiency: number;
    conflicts: number;
    averageWaitTime: Record<Priority, number>;
    technicianUtilization: number;
    priorityRespectRate: number;
    parallelAnalyses: number;
    lunchInterruptions: number;
}
