import { makeLaboratoryEntity } from '@tests/helpers/factories';

describe('Laboratory', () => {
    it('exposes DTO fields through accessors', () => {
        const lab = makeLaboratoryEntity({ name: 'Central Lab', openingHours: '07:00-18:00', date: '2025-03-15' });
        expect(lab.name).toBe('Central Lab');
        expect(lab.openingHours).toBe('07:00-18:00');
        expect(lab.date).toBe('2025-03-15');
    });
});
