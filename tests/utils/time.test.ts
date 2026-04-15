import { formatTime, overlaps, parseRange, parseTime } from '@/core/utils/time';

describe('parseTime', () => {
    it('converts HH:MM to minutes', () => {
        expect(parseTime('00:00')).toBe(0);
        expect(parseTime('08:30')).toBe(510);
        expect(parseTime('23:59')).toBe(23 * 60 + 59);
    });
});

describe('formatTime', () => {
    it('converts minutes back to HH:MM with padding', () => {
        expect(formatTime(0)).toBe('00:00');
        expect(formatTime(510)).toBe('08:30');
        expect(formatTime(9 * 60 + 5)).toBe('09:05');
    });
});

describe('parseRange', () => {
    it('parses a HH:MM-HH:MM range into start/end minutes', () => {
        expect(parseRange('12:00-13:00')).toEqual({ start: 720, end: 780 });
    });
});

describe('overlaps', () => {
    it('returns true when intervals share any minute', () => {
        expect(overlaps({ start: 100, end: 200 }, { start: 150, end: 250 })).toBe(true);
        expect(overlaps({ start: 100, end: 200 }, { start: 199, end: 210 })).toBe(true);
    });

    it('returns false when intervals are disjoint or only touch', () => {
        expect(overlaps({ start: 100, end: 200 }, { start: 200, end: 300 })).toBe(false);
        expect(overlaps({ start: 100, end: 200 }, { start: 300, end: 400 })).toBe(false);
    });
});
