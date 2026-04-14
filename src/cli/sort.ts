import { parseArgs } from 'node:util';

import { loadLabInput } from '@/core/loader';
import { sortSamples } from '@/core/scheduler/sortSamples';

const { values } = parseArgs({
    options: {
        file: { type: 'string', short: 'f' },
    },
});

if (!values.file) {
    console.error('Usage: pnpm sort --file=<path-to-json>');
    process.exit(1);
}

const { samples } = loadLabInput(values.file);
const sorted = sortSamples(samples);

for (const sample of sorted) {
    console.info(`${sample.getId().padEnd(5)} ${sample.getPriority().padEnd(8)} ${sample.getArrivalTime()}  "${sample.getAnalysisType()}"`);
}
