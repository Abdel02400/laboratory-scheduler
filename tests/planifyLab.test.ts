import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { planifyLab } from '@/core/planifyLab';
import type { LabInput } from '@/core/types/inputs/labInput';

describe('planifyLab (golden test on data/samples.json)', () => {
    const input = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'samples.json'), 'utf8')) as LabInput;
    const output = planifyLab(input);

    it('returns the top-level shape expected by the brief', () => {
        expect(output).toHaveProperty('laboratory');
        expect(output).toHaveProperty('schedule');
        expect(output).toHaveProperty('metrics');
        expect(output).toHaveProperty('metadata');
    });

    it('embeds the laboratory date and total samples count', () => {
        expect(output.laboratory?.date).toBe('2025-03-15');
        expect(output.laboratory?.totalSamples).toBe(20);
    });

    it('formats startTime/endTime as HH:MM strings', () => {
        for (const entry of output.schedule) {
            expect(entry.startTime).toMatch(/^\d{2}:\d{2}$/);
            expect(entry.endTime).toMatch(/^\d{2}:\d{2}$/);
        }
    });

    it('reports zero conflicts and lists the constraints applied', () => {
        expect(output.metrics.conflicts).toBe(0);
        expect(output.metadata?.constraintsApplied).toContain('priority_management');
    });

    it('processes a non-trivial number of samples', () => {
        expect(output.schedule.length).toBeGreaterThan(0);
    });
});
