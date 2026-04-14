import type { TimeString } from '@/core/types/primitives/time';

export function parseTime(time: TimeString | string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}
