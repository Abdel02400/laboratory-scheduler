import { Scheduler } from '@/core/scheduler/Scheduler';
import { makeEquipmentEntity, makeSampleEntity, makeTechnicianEntity } from '@tests/helpers/factories';

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

    it('pushes the start past the lunch break when the analysis window would overlap it', () => {
        const samples = [makeSampleEntity({ arrivalTime: '11:45', analysisTime: 45 })];
        const techs = [makeTechnicianEntity({ efficiency: 1.0, startTime: '08:00', endTime: '17:00', lunchBreak: '12:00-13:00' })];
        const equipments = [makeEquipmentEntity()];

        const { schedule } = new Scheduler().schedule(samples, techs, equipments);
        expect(schedule[0].startTime).toBe(13 * 60);
    });

    it('applies the cleaning time between two samples on the same equipment slot', () => {
        const samples = [makeSampleEntity({ id: 'A', arrivalTime: '09:00', analysisTime: 30 }), makeSampleEntity({ id: 'B', arrivalTime: '09:00', analysisTime: 30 })];
        const techs = [makeTechnicianEntity()];
        const equipments = [makeEquipmentEntity({ capacity: 1, cleaningTime: 15 })];

        const { schedule } = new Scheduler().schedule(samples, techs, equipments);
        expect(schedule[1].startTime).toBeGreaterThanOrEqual(schedule[0].endTime + 15);
    });

    it('marks a sample as unscheduled when no compatibleType matches and no fallback equipment exists', () => {
        const samples = [makeSampleEntity({ analysisType: 'Unknown', type: 'TISSUE' })];
        const techs = [makeTechnicianEntity()];
        const equipments = [makeEquipmentEntity({ type: 'BLOOD', compatibleTypes: ['Numération'] })];

        const { schedule, unscheduled } = new Scheduler().schedule(samples, techs, equipments);
        expect(schedule).toEqual([]);
        expect(unscheduled[0]).toMatchObject({ sampleId: 'S001', reason: 'No compatible equipment' });
    });
});
