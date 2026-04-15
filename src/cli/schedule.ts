import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import { planifyLab } from '@/core';
import type { LabInput } from '@/core/types/labInput';

const { values } = parseArgs({
    options: {
        file: { type: 'string', short: 'f' },
        output: { type: 'string', short: 'o' },
    },
});

if (!values.file) {
    console.error('Usage: pnpm schedule --file=<path-to-json> [--output=<path-to-write>]');
    process.exit(1);
}

const input = JSON.parse(readFileSync(values.file, 'utf8')) as LabInput;
const output = planifyLab(input);
const serialized = JSON.stringify(output, null, 2);

if (values.output) {
    writeFileSync(values.output, `${serialized}\n`, 'utf8');
    console.info(`Wrote schedule to ${values.output}`);
} else {
    console.info(serialized);
}
