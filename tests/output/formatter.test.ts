import { formatOutput } from '@/core/output/formatter';
import { toEquipmentId, toSampleId, toTechnicianId } from '@/core/types/primitives/ids';
import type { Metrics } from '@/core/types/metrics';
import type { ScheduleEntry, UnscheduledEntry } from '@/core/types/schedule';
import { makeEquipmentEntity, makeLaboratoryEntity, makeSampleEntity, makeTechnicianEntity } from '@tests/helpers/factories';

const baseMetrics: Metrics = {
    totalTime: 120,
    efficiency: 50,
    conflicts: 0,
    averageWaitTime: { STAT: 0, URGENT: 0, ROUTINE: 0 },
    technicianUtilization: 50,
    priorityRespectRate: 100,
    parallelAnalyses: 1,
    lunchInterruptions: 0,
};

describe('formatOutput', () => {
    it('formats a schedule entry with HH:MM times and cleaningRequired flag', () => {
        const schedule: ScheduleEntry[] = [
            { sampleId: toSampleId('s1'), technicianId: toTechnicianId('t1'), equipmentId: toEquipmentId('e1'), startTime: 540, endTime: 570, priority: 'STAT' },
            { sampleId: toSampleId('s2'), technicianId: toTechnicianId('t1'), equipmentId: toEquipmentId('e1'), startTime: 585, endTime: 615, priority: 'URGENT' },
        ];
        const samples = [makeSampleEntity({ id: 's1' }), makeSampleEntity({ id: 's2' })];
        const techs = [makeTechnicianEntity({ id: 't1', efficiency: 1.0 })];
        const equipments = [makeEquipmentEntity({ id: 'e1' })];

        const output = formatOutput(schedule, [], baseMetrics, samples, techs, equipments);
        expect(output.schedule[0].startTime).toBe('09:00');
        expect(output.schedule[0].endTime).toBe('09:30');
        expect(output.schedule[0].duration).toBe(30);
        expect(output.schedule[0].cleaningRequired).toBe(false);
        expect(output.schedule[1].cleaningRequired).toBe(true);
    });

    it('omits the unscheduled key when the list is empty', () => {
        const output = formatOutput([], [], baseMetrics, [], [], []);
        expect(output.unscheduled).toBeUndefined();
    });

    it('emits unscheduled entries when present', () => {
        const unscheduled: UnscheduledEntry[] = [{ sampleId: toSampleId('s9'), reason: 'No compatible equipment' }];
        const output = formatOutput([], unscheduled, baseMetrics, [], [], []);
        expect(output.unscheduled).toEqual([{ sampleId: 's9', reason: 'No compatible equipment' }]);
    });

    it('includes laboratory header when a laboratory is provided', () => {
        const lab = makeLaboratoryEntity({ date: '2025-03-15' });
        const samples = [makeSampleEntity({ id: 's1' })];
        const output = formatOutput([], [], baseMetrics, samples, [], [], lab);
        expect(output.laboratory?.date).toBe('2025-03-15');
        expect(output.laboratory?.totalSamples).toBe(1);
    });

    it('builds metadata with constraintsApplied when relevant fields are present', () => {
        const techs = [makeTechnicianEntity({ efficiency: 1.1, lunchBreak: '12:00-13:00' })];
        const equipments = [makeEquipmentEntity({ maintenanceWindow: '06:00-07:00', cleaningTime: 10, compatibleTypes: ['Numération'] })];
        const output = formatOutput([], [], baseMetrics, [], techs, equipments);
        expect(output.metadata?.constraintsApplied).toContain('priority_management');
        expect(output.metadata?.constraintsApplied).toContain('lunch_breaks');
        expect(output.metadata?.constraintsApplied).toContain('efficiency_coefficients');
        expect(output.metadata?.constraintsApplied).toContain('maintenance_avoidance');
        expect(output.metadata?.constraintsApplied).toContain('cleaning_delays');
    });
});
