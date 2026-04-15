import { MetricsCalculator } from '@/core/metrics/MetricsCalculator';
import type { ScheduleEntry } from '@/core/types/schedule';
import { makeEquipmentEntity, makeSampleEntity, makeTechnicianEntity } from '@tests/helpers/factories';

describe('MetricsCalculator', () => {
    it('computes totalTime from first start to last end', () => {
        const schedule: ScheduleEntry[] = [
            { sampleId: 's1', technicianId: 't1', equipmentId: 'e1', startTime: 480, endTime: 540, priority: 'STAT' },
            { sampleId: 's2', technicianId: 't1', equipmentId: 'e1', startTime: 600, endTime: 660, priority: 'URGENT' },
        ] as ScheduleEntry[];
        const samples = [makeSampleEntity({ id: 's1', arrivalTime: '08:00' }), makeSampleEntity({ id: 's2', arrivalTime: '10:00' })];
        const techs = [makeTechnicianEntity({ id: 't1' })];
        const equipments = [makeEquipmentEntity({ id: 'e1' })];

        const metrics = new MetricsCalculator().calculate(schedule, samples, techs, equipments);
        expect(metrics.totalTime).toBe(180);
    });

    it('computes average waiting time per priority', () => {
        const schedule: ScheduleEntry[] = [{ sampleId: 's1', technicianId: 't1', equipmentId: 'e1', startTime: 510, endTime: 540, priority: 'STAT' }] as ScheduleEntry[];
        const samples = [makeSampleEntity({ id: 's1', arrivalTime: '08:00', priority: 'STAT' })];
        const techs = [makeTechnicianEntity({ id: 't1' })];
        const equipments = [makeEquipmentEntity({ id: 'e1' })];

        const metrics = new MetricsCalculator().calculate(schedule, samples, techs, equipments);
        expect(metrics.averageWaitingTimeByPriority.STAT).toBe(30);
    });

    it('computes priorityRespectRate as the percentage of STAT samples starting within 30 min of arrival', () => {
        const schedule: ScheduleEntry[] = [
            { sampleId: 's1', technicianId: 't1', equipmentId: 'e1', startTime: 495, endTime: 525, priority: 'STAT' },
            { sampleId: 's2', technicianId: 't1', equipmentId: 'e1', startTime: 600, endTime: 630, priority: 'STAT' },
        ] as ScheduleEntry[];
        const samples = [makeSampleEntity({ id: 's1', arrivalTime: '08:00', priority: 'STAT' }), makeSampleEntity({ id: 's2', arrivalTime: '09:00', priority: 'STAT' })];
        const techs = [makeTechnicianEntity({ id: 't1' })];
        const equipments = [makeEquipmentEntity({ id: 'e1' })];

        const metrics = new MetricsCalculator().calculate(schedule, samples, techs, equipments);
        expect(metrics.priorityRespectRate).toBe(50);
    });
});
