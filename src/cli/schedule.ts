import { readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import { parseArgs } from 'node:util';

import { planifyLab } from '@/core/planifyLab';
import type { LabInput } from '@/core/types/inputs/labInput';

function main(): void {
    const { values } = parseArgs({
        options: {
            file: { type: 'string', short: 'f' },
            output: { type: 'string', short: 'o' },
        },
    });

    if (!values.file) {
        throw new Error('Usage: pnpm schedule --file=<path-to-json> [--output=<path-to-write>]');
    }

    if (extname(values.file).toLowerCase() !== '.json') {
        throw new Error(`Input file must have a .json extension, got: ${values.file}`);
    }

    let raw: string;
    try {
        raw = readFileSync(values.file, 'utf8');
    } catch (err) {
        throw new Error(`Cannot read input file ${values.file}`, { cause: err });
    }

    let input: unknown;
    try {
        input = JSON.parse(raw);
    } catch (err) {
        throw new Error(`Input file ${values.file} is not valid JSON`, { cause: err });
    }

    // TODO: add a validator that checks the JSON structure (required arrays, field types) before handing it to planifyLab.
    const result = planifyLab(input as LabInput);
    const serialized = JSON.stringify(result, null, 2);

    if (values.output) {
        writeFileSync(values.output, `${serialized}\n`, 'utf8');
        console.info(`Wrote output to ${values.output}`);
    } else {
        console.info(serialized);
    }
}

try {
    main();
} catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
}
