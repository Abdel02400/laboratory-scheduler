import { makeTechnicianEntity } from '@tests/helpers/factories';

describe('Technician', () => {
    it('exposes DTO fields through getters', () => {
        const tech = makeTechnicianEntity({ id: 'TECH007', efficiency: 1.05 });
        expect(tech.getId()).toBe('TECH007');
        expect(tech.getEfficiency()).toBe(1.05);
    });

    it('canHandle returns true only for declared specialties', () => {
        const tech = makeTechnicianEntity({ specialty: ['BLOOD', 'CHEMISTRY'] });
        expect(tech.canHandle('BLOOD')).toBe(true);
        expect(tech.canHandle('CHEMISTRY')).toBe(true);
        expect(tech.canHandle('GENETICS')).toBe(false);
    });

    it('adjustedDuration applies the efficiency coefficient with Math.round', () => {
        expect(makeTechnicianEntity({ efficiency: 1.2 }).adjustedDuration(45)).toBe(38);
        expect(makeTechnicianEntity({ efficiency: 0.85 }).adjustedDuration(90)).toBe(106);
        expect(makeTechnicianEntity({ efficiency: 1.0 }).adjustedDuration(30)).toBe(30);
    });

    it('adjustForLunch pushes the start past lunch when the window overlaps', () => {
        const tech = makeTechnicianEntity({ lunchBreak: '12:00-13:00' });
        expect(tech.adjustForLunch(690, 60)).toBe(780);
        expect(tech.adjustForLunch(600, 30)).toBe(600);
        expect(tech.adjustForLunch(800, 30)).toBe(800);
    });
});
