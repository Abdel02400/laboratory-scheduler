import { parseArgs } from 'node:util';

import { loadLabInput } from '@/core/loader';
import { Scheduler } from '@/core/scheduler/Scheduler';
import { formatTime } from '@/core/utils/time';

const { values } = parseArgs({
    options: {
        file: { type: 'string', short: 'f' },
    },
});

if (!values.file) {
    console.error('Usage: pnpm schedule --file=<path-to-json>');
    process.exit(1);
}

const { samples, technicians, equipment } = loadLabInput(values.file);
const { schedule, unscheduled } = new Scheduler().schedule(samples, technicians, equipment);

console.info('=== SCHEDULE ===');
for (const entry of schedule) {
    console.info(`${entry.sampleId}  ${entry.priority.padEnd(8)} ${formatTime(entry.startTime)}-${formatTime(entry.endTime)}  tech=${entry.technicianId}  eq=${entry.equipmentId}`);
}

if (unscheduled.length > 0) {
    console.info(`\n=== UNSCHEDULED (${unscheduled.length}) ===`);
    for (const u of unscheduled) {
        console.warn(`${u.sampleId}  ${u.reason}`);
    }
}

console.info(`\n${schedule.length} scheduled, ${unscheduled.length} unscheduled`);
