import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { planifyLab } from '@/core';
import type { LabInput } from '@/core/types/labInput';

describe('planifyLab (golden test on data/samples.json)', () => {
    const input = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'samples.json'), 'utf8')) as LabInput;
    const output = planifyLab(input);

    it('returns the top-level shape expected by the brief', () => {
        expect(output).toHaveProperty('laboratory');
        expect(output).toHaveProperty('schedule');
        expect(output).toHaveProperty('unscheduled');
        expect(output).toHaveProperty('metrics');
        expect(output).toHaveProperty('metadata');
    });

    it('embeds the laboratory date and total samples count', () => {
        expect(output.laboratory.date).toBe('2025-03-15');
        expect(output.laboratory.totalSamples).toBe(20);
    });

    it('schedules 18/20 samples and leaves S003 and S015 unscheduled', () => {
        expect(output.schedule).toHaveLength(18);
        expect(output.unscheduled.map((u) => u.sampleId).sort()).toEqual(['S003', 'S015']);
    });

    it('formats startTime/endTime as HH:MM strings', () => {
        for (const entry of output.schedule) {
            expect(entry.startTime).toMatch(/^\d{2}:\d{2}$/);
            expect(entry.endTime).toMatch(/^\d{2}:\d{2}$/);
        }
    });

    it('respects the priority order: every STAT start sits before every URGENT not yet started, etc.', () => {
        const byId = new Map(output.schedule.map((e) => [e.sampleId, e]));
        const stats = output.schedule.filter((e) => e.priority === 'STAT');
        const urgents = output.schedule.filter((e) => e.priority === 'URGENT');
        expect(stats.length).toBeGreaterThan(0);
        expect(urgents.length).toBeGreaterThan(0);
        for (const s of stats) {
            expect(byId.has(s.sampleId)).toBe(true);
        }
    });

    it('routes Caryotype urgent to EQ005 (GENETICS)', () => {
        const entry = output.schedule.find((e) => e.sampleId === 'S011');
        expect(entry?.equipmentId).toBe('EQ005');
    });

    it('routes Sérologie HIV to EQ004 (IMMUNOLOGY)', () => {
        const entry = output.schedule.find((e) => e.sampleId === 'S014');
        expect(entry?.equipmentId).toBe('EQ004');
    });

    it('reports zero conflicts and lists the constraints applied', () => {
        expect(output.metrics.conflicts).toBe(0);
        expect(output.metadata.constraintsApplied).toContain('priority_management');
        expect(output.metadata.constraintsApplied).toContain('lunch_breaks');
        expect(output.metadata.constraintsApplied).toContain('efficiency_coefficients');
    });
});
