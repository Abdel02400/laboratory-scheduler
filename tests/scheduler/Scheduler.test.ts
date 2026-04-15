import { Scheduler } from '@/core/scheduler/Scheduler';
import { makeConstraintsEntity, makeEquipmentEntity, makeLaboratoryEntity, makeSampleEntity, makeTechnicianEntity } from '@tests/helpers/factories';

describe('Scheduler', () => {
    it('schedules a single sample at its arrival time', () => {
        const samples = [makeSampleEntity({ arrivalTime: '09:00', analysisTime: 30 })];
        const techs = [makeTechnicianEntity({ efficiency: 1.0, startTime: '08:00', endTime: '17:00' })];
        const equipments = [makeEquipmentEntity()];

        const { schedule, unscheduled } = new Scheduler().schedule(samples, techs, equipments);
        expect(unscheduled).toEqual([]);
        expect(schedule).toHaveLength(1);
        expect(schedule[0].startTime).toBe(9 * 60);
        expect(schedule[0].endTime).toBe(9 * 60 + 30);
    });

    it('processes STAT before URGENT before ROUTINE', () => {
        const samples = [makeSampleEntity({ id: 'A', priority: 'ROUTINE', arrivalTime: '08:00' }), makeSampleEntity({ id: 'B', priority: 'URGENT', arrivalTime: '08:30' }), makeSampleEntity({ id: 'C', priority: 'STAT', arrivalTime: '09:00' })];
        const techs = [makeTechnicianEntity({ efficiency: 1.0, startTime: '07:00', endTime: '17:00', lunchBreak: '12:00-13:00' })];
        const equipments = [makeEquipmentEntity({ capacity: 1, cleaningTime: 0 })];

        const { schedule } = new Scheduler().schedule(samples, techs, equipments);
        expect(schedule.map((e) => e.sampleId)).toEqual(['C', 'B', 'A']);
    });

    it('applies the technician efficiency coefficient to the analysis duration', () => {
        const samples = [makeSampleEntity({ arrivalTime: '09:00', analysisTime: 60 })];
        const techs = [makeTechnicianEntity({ efficiency: 1.2 })];
        const equipments = [makeEquipmentEntity()];

        const { schedule } = new Scheduler().schedule(samples, techs, equipments);
        expect(schedule[0].endTime - schedule[0].startTime).toBe(50);
    });

    it('pushes a non-STAT analysis start past the lunch break when the window would overlap', () => {
        const samples = [makeSampleEntity({ priority: 'URGENT', arrivalTime: '11:45', analysisTime: 45 })];
        const techs = [makeTechnicianEntity({ efficiency: 1.0, startTime: '08:00', endTime: '17:00', lunchBreak: '12:00-13:00' })];
        const equipments = [makeEquipmentEntity()];

        const { schedule } = new Scheduler().schedule(samples, techs, equipments);
        expect(schedule[0].startTime).toBe(13 * 60);
    });

    it('lets a STAT analysis interrupt the lunch and tracks the interruption', () => {
        const samples = [makeSampleEntity({ priority: 'STAT', arrivalTime: '12:15', analysisTime: 30 })];
        const techs = [makeTechnicianEntity({ efficiency: 1.0, startTime: '08:00', endTime: '17:00', lunchBreak: '12:00-13:00' })];
        const equipments = [makeEquipmentEntity()];

        const result = new Scheduler().schedule(samples, techs, equipments);
        expect(result.schedule[0].startTime).toBe(12 * 60 + 15);
        expect(result.lunchInterruptions).toBe(1);
    });

    it('applies the cleaning time between two samples on the same equipment slot', () => {
        const samples = [makeSampleEntity({ id: 'A', arrivalTime: '09:00', analysisTime: 30 }), makeSampleEntity({ id: 'B', arrivalTime: '09:00', analysisTime: 30 })];
        const techs = [makeTechnicianEntity(), makeTechnicianEntity({ id: 'T2' })];
        const equipments = [makeEquipmentEntity({ capacity: 1, cleaningTime: 15 })];

        const { schedule } = new Scheduler().schedule(samples, techs, equipments);
        expect(schedule[1].startTime).toBeGreaterThanOrEqual(schedule[0].endTime + 15);
    });

    it('marks a sample as unscheduled when no compatibleType matches', () => {
        const samples = [makeSampleEntity({ analysisType: 'Unknown thing', type: 'TISSUE' })];
        const techs = [makeTechnicianEntity()];
        const equipments = [makeEquipmentEntity({ type: 'BLOOD', compatibleTypes: ['Numération'] })];

        const { schedule, unscheduled } = new Scheduler().schedule(samples, techs, equipments);
        expect(schedule).toEqual([]);
        expect(unscheduled[0]).toMatchObject({ sampleId: 'S001', reason: 'No compatible equipment' });
    });

    it('honors laboratory opening hours for sample start and end', () => {
        const samples = [makeSampleEntity({ arrivalTime: '06:00', analysisTime: 30 })];
        const techs = [makeTechnicianEntity({ startTime: '05:00', endTime: '18:00', lunchBreak: undefined })];
        const equipments = [makeEquipmentEntity({ maintenanceWindow: undefined })];
        const lab = makeLaboratoryEntity({ openingHours: '08:00-17:00' });

        const { schedule } = new Scheduler().schedule(samples, techs, equipments, lab);
        expect(schedule[0].startTime).toBe(8 * 60);
    });

    it('lets a non-STAT sample fit in the gap before a later-arriving STAT reservation', () => {
        const samples = [makeSampleEntity({ id: 'STAT_LATE', priority: 'STAT', arrivalTime: '14:00', analysisTime: 30 }), makeSampleEntity({ id: 'URGENT_EARLY', priority: 'URGENT', arrivalTime: '09:00', analysisTime: 60 })];
        const techs = [makeTechnicianEntity({ efficiency: 1.0, startTime: '08:00', endTime: '17:00', lunchBreak: undefined })];
        const equipments = [makeEquipmentEntity({ capacity: 1, cleaningTime: 0, maintenanceWindow: undefined })];

        const { schedule } = new Scheduler().schedule(samples, techs, equipments);
        const stat = schedule.find((e) => e.sampleId === 'STAT_LATE');
        const urgent = schedule.find((e) => e.sampleId === 'URGENT_EARLY');
        expect(stat?.startTime).toBe(14 * 60);
        expect(urgent?.startTime).toBe(9 * 60);
        expect(urgent?.endTime).toBe(10 * 60);
    });

    it('skips cleaning delay when contaminationPrevention is disabled', () => {
        const samples = [makeSampleEntity({ id: 'A', arrivalTime: '09:00', analysisTime: 30 }), makeSampleEntity({ id: 'B', arrivalTime: '09:00', analysisTime: 30 })];
        const techs = [makeTechnicianEntity(), makeTechnicianEntity({ id: 'T2' })];
        const equipments = [makeEquipmentEntity({ capacity: 1, cleaningTime: 30 })];
        const constraints = makeConstraintsEntity({ contaminationPrevention: false });

        const { schedule } = new Scheduler().schedule(samples, techs, equipments, undefined, constraints);
        expect(schedule[1].startTime).toBe(schedule[0].endTime);
    });
});
