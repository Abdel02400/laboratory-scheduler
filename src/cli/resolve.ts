import { parseArgs } from 'node:util';

import { loadLabInput } from '@/core/loader';
import { findEquipmentForSample } from '@/core/scheduler/analysisTypeResolver';

const { values } = parseArgs({
    options: {
        file: { type: 'string', short: 'f' },
    },
});

if (!values.file) {
    console.error('Usage: pnpm resolve --file=<path-to-json>');
    process.exit(1);
}

const { samples, equipment } = loadLabInput(values.file);

let matched = 0;
let unmatched = 0;

for (const sample of samples) {
    const found = findEquipmentForSample(sample, equipment);

    if (found) {
        matched += 1;
        console.info(`[OK]   ${sample.getId()}  "${sample.getAnalysisType()}" (${sample.getType()})  ->  ${found.getId()} (${found.getName()}, type=${found.getType()})`);
    } else {
        unmatched += 1;
        console.warn(`[MISS] ${sample.getId()}  "${sample.getAnalysisType()}" (${sample.getType()})  ->  no compatible equipment`);
    }
}

console.info(`\n${matched} matched, ${unmatched} unmatched`);
