import { sortSamples } from '@/core/scheduler/sortSamples';
import { makeSampleEntity } from '@tests/helpers/factories';

describe('sortSamples', () => {
    it('orders STAT > URGENT > ROUTINE regardless of arrival time', () => {
        const samples = [makeSampleEntity({ id: 'R', priority: 'ROUTINE', arrivalTime: '08:00' }), makeSampleEntity({ id: 'U', priority: 'URGENT', arrivalTime: '08:30' }), makeSampleEntity({ id: 'S', priority: 'STAT', arrivalTime: '09:00' })];
        expect(sortSamples(samples).map((s) => s.id)).toEqual(['S', 'U', 'R']);
    });

    it('breaks ties inside a priority by earliest arrival time', () => {
        const samples = [makeSampleEntity({ id: 'A', priority: 'URGENT', arrivalTime: '10:00' }), makeSampleEntity({ id: 'B', priority: 'URGENT', arrivalTime: '08:30' }), makeSampleEntity({ id: 'C', priority: 'URGENT', arrivalTime: '09:15' })];
        expect(sortSamples(samples).map((s) => s.id)).toEqual(['B', 'C', 'A']);
    });

    it('does not mutate the input array', () => {
        const samples = [makeSampleEntity({ id: 'R', priority: 'ROUTINE' }), makeSampleEntity({ id: 'S', priority: 'STAT' })];
        const before = samples.map((s) => s.id);
        sortSamples(samples);
        expect(samples.map((s) => s.id)).toEqual(before);
    });
});
