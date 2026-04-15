import { ResourceTracker } from '@/core/scheduler/ResourceTracker';
import { toEquipmentId, toTechnicianId } from '@/core/types/primitives/ids';
import { makeConstraintsEntity, makeEquipmentEntity, makeTechnicianEntity } from '@tests/helpers/factories';

describe('ResourceTracker', () => {
    it('initializes technicians with empty interval lists', () => {
        const tracker = new ResourceTracker();
        tracker.init([makeTechnicianEntity({ id: 'T1', startTime: '08:00' })], []);
        expect(tracker.getTechIntervals(toTechnicianId('T1'))).toEqual([]);
    });

    it('initializes equipments with empty slot arrays matching capacity', () => {
        const tracker = new ResourceTracker();
        tracker.init([], [makeEquipmentEntity({ id: 'E1', capacity: 2 })]);
        const slots = tracker.getSlotIntervals(toEquipmentId('E1'));
        expect(slots).toHaveLength(2);
        expect(slots[0]).toEqual([]);
        expect(slots[1]).toEqual([]);
    });

    it('reserves technician intervals sorted by start', () => {
        const tracker = new ResourceTracker();
        tracker.init([makeTechnicianEntity({ id: 'T1' })], []);
        tracker.reserveTech(toTechnicianId('T1'), 840, 900);
        tracker.reserveTech(toTechnicianId('T1'), 540, 600);
        tracker.reserveTech(toTechnicianId('T1'), 700, 750);
        expect(tracker.getTechIntervals(toTechnicianId('T1'))).toEqual([
            { start: 540, end: 600 },
            { start: 700, end: 750 },
            { start: 840, end: 900 },
        ]);
    });

    it('reserves equipment slot intervals independently per slot', () => {
        const tracker = new ResourceTracker();
        tracker.init([], [makeEquipmentEntity({ id: 'E1', capacity: 2 })]);
        tracker.reserveSlot(toEquipmentId('E1'), 0, 600, 660);
        tracker.reserveSlot(toEquipmentId('E1'), 1, 540, 600);
        const slots = tracker.getSlotIntervals(toEquipmentId('E1'));
        expect(slots[0]).toEqual([{ start: 600, end: 660 }]);
        expect(slots[1]).toEqual([{ start: 540, end: 600 }]);
    });

    it('clamps equipment capacity to 1 when parallelProcessing is disabled', () => {
        const tracker = new ResourceTracker();
        const constraints = makeConstraintsEntity({ parallelProcessing: false });
        tracker.init([], [makeEquipmentEntity({ id: 'E1', capacity: 4 })], constraints);
        expect(tracker.getSlotIntervals(toEquipmentId('E1'))).toHaveLength(1);
    });
});
