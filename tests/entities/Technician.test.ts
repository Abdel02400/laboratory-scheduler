import { makeTechnicianEntity } from '@tests/helpers/factories';

describe('Technician', () => {
    it('exposes DTO fields through accessors', () => {
        const tech = makeTechnicianEntity({ id: 'TECH007', efficiency: 1.05 });
        expect(tech.id).toBe('TECH007');
        expect(tech.efficiency).toBe(1.05);
    });

    it('exposes start/end times and lunch break', () => {
        const tech = makeTechnicianEntity({ startTime: '07:30', endTime: '16:00', lunchBreak: '12:00-13:00' });
        expect(tech.startTime).toBe('07:30');
        expect(tech.endTime).toBe('16:00');
        expect(tech.lunchBreak).toBe('12:00-13:00');
    });

    it('exposes specialty array when provided', () => {
        const tech = makeTechnicianEntity({ specialty: ['BLOOD', 'CHEMISTRY'] });
        expect(tech.specialty).toEqual(['BLOOD', 'CHEMISTRY']);
    });

    it('exposes singular speciality when provided', () => {
        const tech = makeTechnicianEntity({ specialty: undefined, speciality: 'GENETICS' });
        expect(tech.speciality).toBe('GENETICS');
        expect(tech.specialty).toBeUndefined();
    });
});
