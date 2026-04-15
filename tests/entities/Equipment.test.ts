import { makeEquipmentEntity } from '@tests/helpers/factories';

describe('Equipment', () => {
    it('exposes DTO fields through getters', () => {
        const eq = makeEquipmentEntity({ id: 'EQ005', type: 'GENETICS', capacity: 1, cleaningTime: 30 });
        expect(eq.getId()).toBe('EQ005');
        expect(eq.getType()).toBe('GENETICS');
        expect(eq.getCapacity()).toBe(1);
        expect(eq.getCleaningTime()).toBe(30);
    });

    it('returns its declared compatibleTypes list', () => {
        const eq = makeEquipmentEntity({ compatibleTypes: ['Caryotype', 'Conseil génétique'] });
        expect(eq.getCompatibleTypes()).toEqual(['Caryotype', 'Conseil génétique']);
    });
});
