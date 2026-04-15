import { findCompatibleTechnicians } from '@/core/scheduler/findTechnicians';
import { makeEquipmentEntity, makeSampleEntity, makeTechnicianEntity } from '@tests/helpers/factories';

describe('findCompatibleTechnicians', () => {
    it('step 1: picks technicians whose specialty contains sample.type', () => {
        const sample = makeSampleEntity({ type: 'BLOOD' });
        const equipment = makeEquipmentEntity({ type: 'BLOOD' });
        const techs = [makeTechnicianEntity({ id: 'T1', specialty: ['BLOOD'] }), makeTechnicianEntity({ id: 'T2', specialty: ['MICROBIOLOGY'] })];
        expect(findCompatibleTechnicians(sample, equipment, techs).map((t) => t.getId())).toEqual(['T1']);
    });

    it('step 2: falls back to equipment.type when no technician has sample.type', () => {
        const sample = makeSampleEntity({ type: 'URINE' });
        const equipment = makeEquipmentEntity({ type: 'MICROBIOLOGY' });
        const techs = [makeTechnicianEntity({ id: 'T1', specialty: ['BLOOD'] }), makeTechnicianEntity({ id: 'T2', specialty: ['MICROBIOLOGY'] })];
        expect(findCompatibleTechnicians(sample, equipment, techs).map((t) => t.getId())).toEqual(['T2']);
    });

    it('returns an empty list when neither step matches', () => {
        const sample = makeSampleEntity({ type: 'TISSUE' });
        const equipment = makeEquipmentEntity({ type: 'GENETICS' });
        const techs = [makeTechnicianEntity({ specialty: ['BLOOD'] }), makeTechnicianEntity({ specialty: ['MICROBIOLOGY'] })];
        expect(findCompatibleTechnicians(sample, equipment, techs)).toEqual([]);
    });
});
