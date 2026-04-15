export function parseTime(time: string): number {
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

export interface TimeRange {
    start: number;
    end: number;
}

export function parseRange(range: string): TimeRange {
    const [start, end] = range.split('-');
    return { start: parseTime(start), end: parseTime(end) };
}

export function overlaps(a: TimeRange, b: TimeRange): boolean {
    return a.start < b.end && b.start < a.end;
}
