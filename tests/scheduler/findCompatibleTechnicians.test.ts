import { findCompatibleTechnicians } from '@/core/scheduler/findCompatibleTechnicians';
import { makeEquipmentEntity, makeTechnicianEntity } from '@tests/helpers/factories';

describe('findCompatibleTechnicians', () => {
    it('picks technicians whose specialty list contains equipment.type', () => {
        const equipment = makeEquipmentEntity({ type: 'BLOOD' });
        const techs = [makeTechnicianEntity({ id: 'T1', specialty: ['BLOOD'] }), makeTechnicianEntity({ id: 'T2', specialty: ['MICROBIOLOGY'] })];
        expect(findCompatibleTechnicians(equipment, techs).map((t) => t.id)).toEqual(['T1']);
    });

    it('also supports the singular speciality field', () => {
        const equipment = makeEquipmentEntity({ type: 'GENETICS' });
        const techs = [makeTechnicianEntity({ id: 'T1', specialty: undefined, speciality: 'GENETICS' })];
        expect(findCompatibleTechnicians(equipment, techs).map((t) => t.id)).toEqual(['T1']);
    });

    it('returns an empty list when no technician matches', () => {
        const equipment = makeEquipmentEntity({ type: 'GENETICS' });
        const techs = [makeTechnicianEntity({ specialty: ['BLOOD'] }), makeTechnicianEntity({ specialty: ['MICROBIOLOGY'] })];
        expect(findCompatibleTechnicians(equipment, techs)).toEqual([]);
    });

    it('sorts specialists-first (fewer specialties ranked before generalists)', () => {
        const equipment = makeEquipmentEntity({ type: 'BLOOD' });
        const techs = [makeTechnicianEntity({ id: 'Gen', specialty: ['BLOOD', 'CHEMISTRY', 'MICROBIOLOGY'] }), makeTechnicianEntity({ id: 'Spec', specialty: ['BLOOD'] })];
        expect(findCompatibleTechnicians(equipment, techs).map((t) => t.id)).toEqual(['Spec', 'Gen']);
    });
});
