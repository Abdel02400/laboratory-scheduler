import type { Sample } from '@/core/entities/Sample';
import { PRIORITY, type Priority } from '@/core/types/enums/priority';
import { parseTime } from '@/core/utils/time';

const PRIORITY_ORDER: Record<Priority, number> = {
    [PRIORITY.STAT]: 0,
    [PRIORITY.URGENT]: 1,
    [PRIORITY.ROUTINE]: 2,
};

export function sortSamples(samples: Sample[]): Sample[] {
    return [...samples].sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityDiff !== 0) {
            return priorityDiff;
        }
        return parseTime(a.arrivalTime) - parseTime(b.arrivalTime);
    });
}
