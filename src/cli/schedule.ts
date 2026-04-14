import { parseArgs } from 'node:util';

import { loadLabInput } from '@/core/loader';
import { MetricsCalculator } from '@/core/metrics/MetricsCalculator';
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
const metrics = new MetricsCalculator().calculate(schedule, samples, technicians, equipment);

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

console.info('\n=== METRICS ===');
console.info(`Total time:                 ${metrics.totalTime} min`);
console.info('Avg waiting time:');
for (const [priority, wait] of Object.entries(metrics.averageWaitingTimeByPriority)) {
    console.info(`  ${priority.padEnd(8)} ${wait.toFixed(1)} min`);
}
console.info('Technician utilization:');
for (const [id, rate] of Object.entries(metrics.technicianUtilization)) {
    console.info(`  ${id.padEnd(8)} ${rate.toFixed(1)} %`);
}
console.info('Equipment utilization:');
for (const [id, rate] of Object.entries(metrics.equipmentUtilization)) {
    console.info(`  ${id.padEnd(8)} ${rate.toFixed(1)} %`);
}
console.info(`Global efficiency:          ${metrics.globalEfficiency.toFixed(1)} %`);
console.info(`Priority respect (STAT):    ${metrics.priorityRespectRate.toFixed(1)} %`);
console.info(`Parallelism rate:           ${metrics.parallelismRate.toFixed(1)} %`);
