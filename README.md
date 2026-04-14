# Laboratory Scheduler

![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10.2.0-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.8.2-F7B93E?logo=prettier&logoColor=black)
![pnpm](https://img.shields.io/badge/pnpm-8.6.5-F69220?logo=pnpm&logoColor=white)

A scheduling system for a medical laboratory: 20 samples distributed across 8 technicians and 5 pieces of equipment, respecting priorities and constraints.

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 8

## Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd laboratory-scheduler
pnpm install
```

## Getting Started

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `pnpm dev` — start the Next.js dev server
- `pnpm build` — build for production
- `pnpm start` — run the production build
- `pnpm lint` — run ESLint on the whole project
- `pnpm format` — format all files with Prettier
- `pnpm format:check` — check formatting without writing
- `pnpm load --file=<path-to-json>` — load a lab input JSON file and instantiate the entities (prints a summary)
- `pnpm resolve --file=<path-to-json>` — resolve each sample to a compatible equipment (prints the mapping)
- `pnpm sort --file=<path-to-json>` — sort samples by priority then arrival time (prints the sorted list)
- `pnpm match --file=<path-to-json>` — combine sort + equipment resolver + technician matching (prints each sample's candidates)
- `pnpm schedule --file=<path-to-json>` — run the full greedy scheduler and print the resulting schedule

### Loading a lab input

The loader reads a JSON file describing the laboratory state (samples, technicians, equipment, constraints) and instantiates the corresponding entity classes.

```bash
pnpm load --file=data/samples.json
# or
pnpm load -f data/samples.json
```

Expected output:

```
Loaded 20 samples, 8 technicians, 5 equipment from data/samples.json
```

## Sample ↔ Equipment matching

Picking an equipment for a sample is handled by `findEquipmentForSample` in `src/core/scheduler/analysisTypeResolver.ts`. It applies a **two-step strategy**, which is the most important design decision of the project so far.

### The two steps

1. **Exact match on `analysisType`.** If any equipment declares the sample's `analysisType` verbatim in its `compatibleTypes` array, that equipment is selected. This is the preferred route — it reflects the equipment's explicit capabilities as described in the dataset.
2. **Fallback on `type`.** If no equipment claims the analysis explicitly, the resolver falls back to matching `sample.type === equipment.type` (e.g. a `BLOOD` sample goes on a `BLOOD` equipment). The first equipment of the right type is picked.
3. **Unscheduled.** If neither step finds a match, the sample is reported as having no compatible equipment.

### Why this order

The intermediate brief adds `compatibleTypes` on top of the existing `type` field. Exact-matching `analysisType` against `compatibleTypes` respects the brief's intent when the dataset is precise, but many samples in this dataset have enriched analysis names (`"Numération complète"`, `"Caryotype urgent"`, `"Sérologie HIV"`, etc.) that do not appear verbatim in any `compatibleTypes` list. A strict-only strategy would leave half of the samples unscheduled, which is not what the brief is trying to test.

### Compatibility with the simple version of the brief

The simple version of the brief uses a different data shape where equipment has no `compatibleTypes` and the three sample types (`BLOOD`, `URINE`, `TISSUE`) align 1:1 with the three equipment types. The step 2 fallback (`sample.type === equipment.type`) is exactly the rule described in the simple brief, so the same resolver works for both datasets without branching.

### Tradeoffs on the current intermediate dataset

- All 20 samples get matched (no unscheduled).
- BLOOD samples whose `analysisType` is not in any `compatibleTypes` all route to `EQ001` (the only `BLOOD` equipment), which becomes a bottleneck.
- `EQ004` (Immunology) ends up unused because no sample has `type: "IMMUNOLOGY"` — immunology-flavored analyses like `"Sérologie HIV"` have `type: "BLOOD"`, so they fall back to `EQ001` instead of going to `EQ004`.
- This is accepted for now and will be revisited once the scheduler exposes actual throughput metrics.

## Sample ↔ Technician matching

Picking a technician for a sample is done by `findCompatibleTechnicians` in `src/core/scheduler/findTechnicians.ts`. It mirrors the two-step approach used for equipments.

### The two steps

1. **Direct match on `sample.type`.** Technicians whose `specialty` array contains the sample's biological type are preferred. For example, a sample with `type: "BLOOD"` goes to any technician with `"BLOOD"` in their specialties.
2. **Fallback on `equipment.type`.** If no technician has the sample's type in their specialties, the resolver falls back to the type of the equipment that was already picked for this sample. A `URINE` sample gets routed to its `MICROBIOLOGY` equipment, and any technician with `"MICROBIOLOGY"` in their specialties becomes eligible.

### Why this fallback matters on the intermediate dataset

The intermediate dataset is asymmetric between samples and technicians:

- `sample.type` is one of `BLOOD`, `URINE`, `TISSUE` (biological origin of the specimen).
- `technician.specialty` is one of `BLOOD`, `CHEMISTRY`, `MICROBIOLOGY`, `IMMUNOLOGY`, `GENETICS` (analytical expertise).

Only `BLOOD` is shared between the two vocabularies. A `URINE` or `TISSUE` sample has **no technician with a matching specialty in step 1**. Without the fallback, 3 samples (S009 URINE, S010 TISSUE, S020 TISSUE) would be unscheduled. The fallback on `equipment.type` bridges the two vocabularies: the equipment resolver already mapped the sample to a `MICROBIOLOGY` equipment, so we pick a technician with `"MICROBIOLOGY"` in their specialties (TECH002, TECH005, TECH008).

### Compatibility with the simple version of the brief

In the simple version, `technician.specialty` and `sample.type` share the same vocabulary (`BLOOD`, `URINE`, `TISSUE`, plus `GENERAL` which means "anything"). Step 1 is enough there, and the fallback never fires. The resolver therefore works on both datasets without branching.

## Scheduling algorithm

`src/core/scheduler/Scheduler.ts` is a greedy scheduler. It orchestrates three helpers (`sortSamples`, `findCompatibleEquipments`, `findCompatibleTechnicians`) and delegates resource tracking to `ResourceTracker`.

### Algorithm

1. Sort samples by priority (`STAT > URGENT > ROUTINE`), then by arrival time.
2. For each sample, gather candidate equipments (exact match first, `type` fallback second — see _Sample ↔ Equipment matching_).
3. For each candidate equipment, gather compatible technicians, sort them by the rule below, then try to assign one:
   - `earliest = max(sample.arrivalTime, technician.nextFreeTime, equipment.nextFreeSlot, technician.startTime)`
   - `duration = Math.round(sample.analysisTime / technician.efficiency)` — the brief's rounding rule, encapsulated in `Technician.adjustedDuration`.
   - `start = technician.adjustForLunch(earliest, duration)` — if the analysis window overlaps the technician's lunch break, the start is pushed to the end of the lunch.
   - `end = start + duration`
   - If `end` exceeds `technician.endTime`, try the next technician. If no technician fits on this equipment, try the next candidate equipment.
4. If no combination of equipment and technician fits, the sample is reported as unscheduled with the reason.

### Technician ordering: specialists first

Within the list of technicians compatible with a given sample, the Scheduler sorts by the number of specialties the technician has (ascending), then by their next-free time as a tie-breaker. A technician with a single specialty (e.g. TECH005 with only `MICROBIOLOGY`) is picked before a technician with three specialties (e.g. TECH007 with `CHEMISTRY`, `BLOOD`, `IMMUNOLOGY`).

The reasoning is classic greedy heuristic: **use specialists when they are applicable, save generalists for the harder cases**. If a sample can be handled by both a specialist and a generalist, taking the specialist leaves the generalist available for a later sample that only the generalist could handle. On the intermediate dataset, this simple rule is what lets the scheduler reach 20/20 even with lunch breaks applied — without it, the two long GENETICS ROUTINE samples (S007 120 min, S019 90 min) would both compete for `TECH007` and one would fall off the end of the day.

### What is intentionally not handled

- **Equipment maintenance windows.** `maintenanceWindow` is loaded but not consulted. In the current dataset every window falls outside the lab opening hours (07:00–19:00), so ignoring them changes nothing on this input.
- **STAT preemption.** STAT samples are prioritized by the sort but do not interrupt a running analysis — the brief's intermediate version explicitly accepts this ("greedy sans backtracking").

## Metrics

`src/core/metrics/MetricsCalculator.ts` computes the six metrics required by the brief from a `ScheduleEntry[]` plus the original samples, technicians and equipments.

| Metric | Formula |
|---|---|
| `totalTime` | `max(endTime) − min(startTime)` across the schedule, in minutes. |
| `averageWaitingTimeByPriority` | Per priority, the average of `startTime − arrivalTime`. |
| `technicianUtilization` | Per technician, `sum(assigned durations) / totalTime × 100`. |
| `equipmentUtilization` | Per equipment, `sum(assigned durations) / (capacity × totalTime) × 100` — the capacity factor accounts for parallel slots. |
| `globalEfficiency` | Brief's official formula: `(Σ occupation_resource / number_of_resources / totalTime) × 100` where resources = technicians ∪ equipments. |
| `priorityRespectRate` | Percentage of STAT samples whose start happened within 30 minutes of arrival (the brief's soft constraint). |
| `parallelismRate` | Percentage of minutes during which more than one analysis is running simultaneously. |

## Public API — `planifyLab`

The brief requires a single public function that takes the input JSON and returns the schedule plus the metrics. `src/core/planifyLab.ts` exposes it:

```ts
import { planifyLab } from '@/core';

const result = planifyLab(input);
// { schedule: ScheduleEntry[], unscheduled: UnscheduledEntry[], metrics: Metrics }
```

`planifyLab` instantiates the entity classes from the DTOs, runs the Scheduler, then runs the MetricsCalculator on the resulting schedule.

## Design notes

A few deliberate choices made during the project:

- **No runtime validation layer on DTOs (no zod/yup).** The data source is a static, trusted JSON file — not a user form. TypeScript types (`Sample`, `Technician`, `Equipment`) are enough to describe the shape; we don't need to guard against malformed input at runtime.
- **DTO and entity separation.** DTO interfaces live in `src/core/types/` and mirror the input JSON shape. Entity classes in `src/core/entities/` wrap a DTO and will progressively expose domain behavior (getters, methods) as the scheduler needs them.
- **Closed-world enums via const objects.** Enums like `PRIORITY`, `SPECIALTY`, `SERVICES` use the `const object + typeof + keyof` pattern. This gives both value access (e.g. `SERVICES.URGENCES`) and a strict union type in a single source of truth.
- **Branded ID types.** `SampleId`, `TechnicianId`, `EquipmentId` are branded strings to prevent accidental cross-entity ID mixups at the type level.
- **Template literal type for time strings.** `TimeString` enforces the `HH:MM` format (00:00–23:59) at compile time.
- **Generic `Range<Min, Max>` utility.** Age and analysis time are constrained to their valid ranges at the type level via a recursive `Enumerate` helper, so invalid literals fail to compile.

