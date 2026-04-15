import { findCompatibleEquipments } from '@/core/scheduler/analysisTypeResolver';
import { makeEquipmentEntity, makeSampleEntity } from '@tests/helpers/factories';

describe('findCompatibleEquipments', () => {
    const equipments = [
        makeEquipmentEntity({ id: 'EQ001', type: 'BLOOD', compatibleTypes: ['Numération', 'Hémogramme'] }),
        makeEquipmentEntity({ id: 'EQ004', type: 'IMMUNOLOGY', compatibleTypes: ['Sérologie', 'Allergènes'] }),
        makeEquipmentEntity({ id: 'EQ005', type: 'GENETICS', compatibleTypes: ['Caryotype', 'Pharmacogénétique'] }),
    ];

    it('picks by exact match in compatibleTypes', () => {
        const { primary } = findCompatibleEquipments(makeSampleEntity({ analysisType: 'Numération', type: 'BLOOD' }), equipments);
        expect(primary.map((e) => e.getId())).toEqual(['EQ001']);
    });

    it('picks by substring match when the analysisType is enriched with extra words', () => {
        const { primary } = findCompatibleEquipments(makeSampleEntity({ analysisType: 'Caryotype urgent', type: 'BLOOD' }), equipments);
        expect(primary.map((e) => e.getId())).toEqual(['EQ005']);
    });

    it('matches case-insensitively', () => {
        const { primary } = findCompatibleEquipments(makeSampleEntity({ analysisType: 'allergènes critiques', type: 'BLOOD' }), equipments);
        expect(primary.map((e) => e.getId())).toEqual(['EQ004']);
    });

    it('fills the fallback list with equipments whose type matches sample.type', () => {
        const { primary, fallback } = findCompatibleEquipments(makeSampleEntity({ analysisType: 'Sérologie', type: 'BLOOD' }), equipments);
        expect(primary.map((e) => e.getId())).toEqual(['EQ004']);
        expect(fallback.map((e) => e.getId())).toEqual(['EQ001']);
    });

    it('returns empty primary when no compatibleType matches the analysisType', () => {
        const { primary, fallback } = findCompatibleEquipments(makeSampleEntity({ analysisType: 'Vitesse sédimentation', type: 'BLOOD' }), equipments);
        expect(primary).toEqual([]);
        expect(fallback.map((e) => e.getId())).toEqual(['EQ001']);
    });
});
