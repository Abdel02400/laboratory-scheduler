import { parseArgs } from 'node:util';

import { loadLabInput } from '@/core/loader';
import { findEquipmentForSample } from '@/core/scheduler/analysisTypeResolver';
import { findCompatibleTechnicians } from '@/core/scheduler/findTechnicians';
import { sortSamples } from '@/core/scheduler/sortSamples';

const { values } = parseArgs({
    options: {
        file: { type: 'string', short: 'f' },
    },
});

if (!values.file) {
    console.error('Usage: pnpm match --file=<path-to-json>');
    process.exit(1);
}

const { samples, technicians, equipment } = loadLabInput(values.file);
const sorted = sortSamples(samples);

for (const sample of sorted) {
    const eq = findEquipmentForSample(sample, equipment);
    if (!eq) {
        console.warn(`[MISS] ${sample.getId()}  "${sample.getAnalysisType()}"  ->  no equipment`);
        continue;
    }

    const techs = findCompatibleTechnicians(sample, eq, technicians);
    if (techs.length === 0) {
        console.warn(`[MISS] ${sample.getId()}  "${sample.getAnalysisType()}"  ->  ${eq.getId()}  /  no technician`);
        continue;
    }

    const techIds = techs.map((t) => t.getId()).join(', ');
    console.info(`[OK]   ${sample.getId()}  "${sample.getAnalysisType()}"  ->  ${eq.getId()}  /  ${techs.length} tech(s): ${techIds}`);
}
