import { makeSampleEntity } from '@tests/helpers/factories';

describe('Sample', () => {
    it('exposes DTO fields through getters', () => {
        const sample = makeSampleEntity({ id: 'S042', priority: 'URGENT', analysisType: 'Troponine' });
        expect(sample.getId()).toBe('S042');
        expect(sample.getPriority()).toBe('URGENT');
        expect(sample.getAnalysisType()).toBe('Troponine');
    });

    it('parses arrivalTime to minutes since midnight', () => {
        expect(makeSampleEntity({ arrivalTime: '08:30' }).arrivalMinutes()).toBe(510);
        expect(makeSampleEntity({ arrivalTime: '00:00' }).arrivalMinutes()).toBe(0);
        expect(makeSampleEntity({ arrivalTime: '23:59' }).arrivalMinutes()).toBe(23 * 60 + 59);
    });

    it('classifies priority via isStat and isUrgent helpers', () => {
        expect(makeSampleEntity({ priority: 'STAT' }).isStat()).toBe(true);
        expect(makeSampleEntity({ priority: 'URGENT' }).isUrgent()).toBe(true);
        expect(makeSampleEntity({ priority: 'ROUTINE' }).isStat()).toBe(false);
        expect(makeSampleEntity({ priority: 'ROUTINE' }).isUrgent()).toBe(false);
    });
});
