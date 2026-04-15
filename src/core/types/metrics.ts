import type { Priority } from '@/core/types/enums/priority';

export interface Metrics {
    totalTime: number;
    efficiency: number;
    conflicts: number;
    averageWaitTime: Record<Priority, number>;
    technicianUtilization: number;
    priorityRespectRate: number;
    parallelAnalyses: number;
    lunchInterruptions: number;
}
