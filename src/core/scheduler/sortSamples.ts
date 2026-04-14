import type { Sample } from '@/core/entities/Sample';
import { PRIORITY, type Priority } from '@/core/types/enums/priority';

const PRIORITY_ORDER: Record<Priority, number> = {
    [PRIORITY.STAT]: 0,
    [PRIORITY.URGENT]: 1,
    [PRIORITY.ROUTINE]: 2,
};

export function sortSamples(samples: Sample[]): Sample[] {
    return [...samples].sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[a.getPriority()] - PRIORITY_ORDER[b.getPriority()];
        if (priorityDiff !== 0) {
            return priorityDiff;
        }
        return a.arrivalMinutes() - b.arrivalMinutes();
    });
}
