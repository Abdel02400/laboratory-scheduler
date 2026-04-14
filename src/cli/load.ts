import { parseArgs } from 'node:util';

import { loadLabInput } from '@/core/loader';

const { values } = parseArgs({
    options: {
        file: { type: 'string', short: 'f' },
    },
});

if (!values.file) {
    console.error('Usage: pnpm load --file=<path-to-json>');
    process.exit(1);
}

const { samples, technicians, equipment } = loadLabInput(values.file);

console.info(`Loaded ${samples.length} samples, ${technicians.length} technicians, ${equipment.length} equipment from ${values.file}`);
