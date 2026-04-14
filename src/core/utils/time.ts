import type { TimeString } from '@/core/types/time';

export function parseTime(time: TimeString): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
