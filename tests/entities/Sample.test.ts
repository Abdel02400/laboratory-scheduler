import { makeSampleEntity } from '@tests/helpers/factories';

describe('Sample', () => {
    it('exposes DTO fields through accessors', () => {
        const sample = makeSampleEntity({ id: 'S042', priority: 'URGENT', analysisType: 'Troponine' });
        expect(sample.id).toBe('S042');
        expect(sample.priority).toBe('URGENT');
        expect(sample.analysisType).toBe('Troponine');
    });

    it('exposes the sample type and analysisTime and arrivalTime', () => {
        const sample = makeSampleEntity({ type: 'TISSUE', analysisTime: 90, arrivalTime: '10:15' });
        expect(sample.type).toBe('TISSUE');
        expect(sample.analysisTime).toBe(90);
        expect(sample.arrivalTime).toBe('10:15');
    });

    it('exposes the patientInfo object when provided', () => {
        const sample = makeSampleEntity({ patientInfo: { age: 30, service: 'Urgences', diagnosis: 'Suspicion hémorragie' } });
        expect(sample.patientInfo?.age).toBe(30);
        expect(sample.patientInfo?.service).toBe('Urgences');
    });
});
