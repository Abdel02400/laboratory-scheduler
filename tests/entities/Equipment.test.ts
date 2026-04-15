import { makeEquipmentEntity } from '@tests/helpers/factories';

describe('Equipment', () => {
    it('exposes DTO fields through accessors', () => {
        const eq = makeEquipmentEntity({ id: 'EQ005', type: 'GENETICS', capacity: 1, cleaningTime: 30 });
        expect(eq.id).toBe('EQ005');
        expect(eq.type).toBe('GENETICS');
        expect(eq.capacity).toBe(1);
        expect(eq.cleaningTime).toBe(30);
    });

    it('returns its declared compatibleTypes list', () => {
        const eq = makeEquipmentEntity({ compatibleTypes: ['Caryotype', 'Conseil génétique'] });
        expect(eq.compatibleTypes).toEqual(['Caryotype', 'Conseil génétique']);
    });

    it('exposes the maintenance window', () => {
        const eq = makeEquipmentEntity({ maintenanceWindow: '12:00-13:00' });
        expect(eq.maintenanceWindow).toBe('12:00-13:00');
    });
});
