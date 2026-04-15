import { findCompatibleEquipments } from '@/core/scheduler/findCompatibleEquipments';
import { makeEquipmentEntity, makeSampleEntity } from '@tests/helpers/factories';

describe('findCompatibleEquipments', () => {
    const equipments = [
        makeEquipmentEntity({ id: 'EQ001', type: 'BLOOD', compatibleTypes: ['Numération', 'Hémogramme'] }),
        makeEquipmentEntity({ id: 'EQ004', type: 'IMMUNOLOGY', compatibleTypes: ['Sérologie', 'Allergènes'] }),
        makeEquipmentEntity({ id: 'EQ005', type: 'GENETICS', compatibleTypes: ['Caryotype', 'Pharmacogénétique'] }),
    ];

    it('picks equipment whose compatibleTypes match the analysisType', () => {
        const result = findCompatibleEquipments(makeSampleEntity({ analysisType: 'Numération', type: 'BLOOD' }), equipments);
        expect(result.map((e) => e.id)).toEqual(['EQ001']);
    });

    it('matches by substring when the analysisType is enriched with extra words', () => {
        const result = findCompatibleEquipments(makeSampleEntity({ analysisType: 'Caryotype urgent', type: 'BLOOD' }), equipments);
        expect(result.map((e) => e.id)).toEqual(['EQ005']);
    });

    it('matches case-insensitively', () => {
        const result = findCompatibleEquipments(makeSampleEntity({ analysisType: 'allergènes critiques', type: 'BLOOD' }), equipments);
        expect(result.map((e) => e.id)).toEqual(['EQ004']);
    });

    it('returns empty list when no compatibleType matches the analysisType', () => {
        const result = findCompatibleEquipments(makeSampleEntity({ analysisType: 'Vitesse sédimentation', type: 'BLOOD' }), equipments);
        expect(result).toEqual([]);
    });

    it('falls back to matching equipment.type === sample.type when analysisType is undefined', () => {
        const simpleEquipments = [makeEquipmentEntity({ id: 'E_BLOOD', type: 'BLOOD', compatibleTypes: undefined }), makeEquipmentEntity({ id: 'E_GEN', type: 'GENETICS', compatibleTypes: undefined })];
        const result = findCompatibleEquipments(makeSampleEntity({ analysisType: undefined, type: 'BLOOD' }), simpleEquipments);
        expect(result.map((e) => e.id)).toEqual(['E_BLOOD']);
    });
});
