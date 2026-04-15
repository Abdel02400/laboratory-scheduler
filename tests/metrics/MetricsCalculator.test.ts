import { MetricsCalculator } from '@/core/metrics/MetricsCalculator';
import { toEquipmentId, toSampleId, toTechnicianId } from '@/core/types/primitives/ids';
import type { ScheduleEntry } from '@/core/types/schedule';
import { makeEquipmentEntity, makeSampleEntity, makeTechnicianEntity } from '@tests/helpers/factories';

function entry(overrides: Partial<ScheduleEntry>): ScheduleEntry {
    return {
        sampleId: toSampleId('s1'),
        technicianId: toTechnicianId('t1'),
        equipmentId: toEquipmentId('e1'),
        startTime: 0,
        endTime: 0,
        priority: 'STAT',
        ...overrides,
    };
}

describe('MetricsCalculator', () => {
    it('computes totalTime from first start to last end', () => {
        const schedule = [entry({ sampleId: toSampleId('s1'), startTime: 480, endTime: 540 }), entry({ sampleId: toSampleId('s2'), priority: 'URGENT', startTime: 600, endTime: 660 })];
        const samples = [makeSampleEntity({ id: 's1', arrivalTime: '08:00' }), makeSampleEntity({ id: 's2', arrivalTime: '10:00' })];
        const techs = [makeTechnicianEntity({ id: 't1' })];
        const equipments = [makeEquipmentEntity({ id: 'e1' })];

        const metrics = new MetricsCalculator().calculate(schedule, samples, techs, equipments, 0);
        expect(metrics.totalTime).toBe(180);
    });

    it('computes average waiting time per priority', () => {
        const schedule = [entry({ sampleId: toSampleId('s1'), startTime: 510, endTime: 540 })];
        const samples = [makeSampleEntity({ id: 's1', arrivalTime: '08:00', priority: 'STAT' })];
        const techs = [makeTechnicianEntity({ id: 't1' })];
        const equipments = [makeEquipmentEntity({ id: 'e1' })];

        const metrics = new MetricsCalculator().calculate(schedule, samples, techs, equipments, 0);
        expect(metrics.averageWaitTime.STAT).toBe(30);
    });

    it('computes priorityRespectRate as the percentage of STAT samples starting within 30 min of arrival', () => {
        const schedule = [entry({ sampleId: toSampleId('s1'), startTime: 495, endTime: 525 }), entry({ sampleId: toSampleId('s2'), startTime: 600, endTime: 630 })];
        const samples = [makeSampleEntity({ id: 's1', arrivalTime: '08:00', priority: 'STAT' }), makeSampleEntity({ id: 's2', arrivalTime: '09:00', priority: 'STAT' })];
        const techs = [makeTechnicianEntity({ id: 't1' })];
        const equipments = [makeEquipmentEntity({ id: 'e1' })];

        const metrics = new MetricsCalculator().calculate(schedule, samples, techs, equipments, 0);
        expect(metrics.priorityRespectRate).toBe(50);
    });

    it('propagates lunchInterruptions and reports zero conflicts', () => {
        const metrics = new MetricsCalculator().calculate([], [], [], [], 3);
        expect(metrics.lunchInterruptions).toBe(3);
        expect(metrics.conflicts).toBe(0);
    });
});
