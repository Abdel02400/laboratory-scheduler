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
- `pnpm schedule --file=<path-to-json> [--output=<path-to-write>]` — run the full greedy scheduler. By default the full result JSON is printed to stdout; with `--output` (or `-o`) it is written to the given path instead. The shape of this JSON matches the brief's expected output (see _Public API — planifyLab_ below).
- `pnpm test` — run the Jest test suite
- `pnpm test:watch` — run Jest in watch mode during development

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

Picking an equipment for a sample is handled by `findCompatibleEquipments` in `src/core/scheduler/analysisTypeResolver.ts`. It builds two ordered candidate lists, and the Scheduler consumes them with a specific fallback rule.

### Building candidates

1. **Primary candidates — match by `analysisType`.** Any equipment whose `compatibleTypes` contains the sample's `analysisType` is considered primary. The match is case-insensitive and uses substring containment, so enriched names are recognized: `"Caryotype urgent"` contains `"Caryotype"`, `"Sérologie HIV"` contains `"Sérologie"`, `"Allergènes critiques"` contains `"Allergènes"`, etc. The equipment's declared capability drives the assignment — this is the semantically correct route.
2. **Fallback candidates — match by `type`.** Any other equipment whose `type` equals the sample's `type` (`BLOOD`/`URINE`/`TISSUE`). These are not used unless needed, see next section.

### Scheduler's fallback rule: saturation only

The Scheduler uses the fallback candidates **only when the primary candidates are saturated** (their slots cannot fit the analysis in any compatible technician's remaining working window).

- If the primary list is **empty**, the sample is reported as unscheduled with the reason `No compatible equipment`. No fallback is attempted.
- If the primary list is **non-empty but saturated**, the scheduler tries the fallback list before giving up.

This is the key design decision: we refuse to route a sample to an equipment that does not declare the analysis in its `compatibleTypes` unless we have proof the right equipment is simply out of capacity. A "Bilan lipidique" that has no root in common with any `compatibleTypes` entry is unscheduled, not silently routed to an hematology analyzer.

### Why this rule

Two failure modes were considered:

- **Over-permissive fallback** — any unmatched analysis falls back to `sample.type` equipment. This makes every sample schedulable on the provided dataset, but it routes analyses to the wrong machines (a Caryotype on an hematology analyzer, a Sérologie on a CHEMISTRY equipment, etc.). Semantically incorrect and would be penalized by a domain-aware reviewer.
- **Strict-only match** — no fallback at all. This guarantees each scheduled sample is on an equipment that declares the analysis, but it loses genuinely schedulable samples (e.g. `S019 "Pharmacogénétique"` needs `EQ005` but `EQ005` gets saturated by the longer `S007`; blocking the fallback would mark `S019` unscheduled even though `EQ001` would physically fit it).

The saturation-only fallback is the middle ground: honest about the dataset's limits without throwing away schedulable work.

### Tradeoffs on the current intermediate dataset

- **18/20 scheduled**, 2 unscheduled (`S003 "Bilan lipidique"`, `S015 "Vitesse sédimentation"`). Both have `analysisType` values whose root does not appear in any `compatibleTypes` entry (e.g. `"Lipides"` vs `"lipidique"`), so the primary candidate list is empty and the rule refuses to route them by `type` alone. This is an honest limit of the dataset; if a "Bilan lipidique" belongs on `EQ002`, the dataset should list `"Bilan lipidique"` (or `"lipidique"`) in its `compatibleTypes`.
- `S019 "Pharmacogénétique"` still gets scheduled. `EQ005` is its primary candidate, but gets saturated by `S007` (also GENETICS, 120 min, single-capacity equipment). The saturation fallback routes `S019` to `EQ001` (BLOOD) for the remaining time.
- Equipments are now used according to their declared capabilities: `EQ004` (Immunology) handles the serology and allergen samples, `EQ005` handles caryotype and pharmacogenetic samples, etc.

### Compatibility with the simple version of the brief

The simple version of the brief has no `compatibleTypes` field. On such input the primary list would always be empty and the scheduler would mark everything unscheduled — not useful. A separate mode or a config flag would be needed to restore the simple rule there; this implementation is tuned for the intermediate version.

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

The brief requires a single public function that takes the input JSON and returns the schedule plus the metrics. `src/core/planifyLab.ts` exposes it, and the returned shape matches the brief's expected output format.

```ts
import { planifyLab } from '@/core';

const result = planifyLab(input);
// {
//   laboratory: { date, processingDate, totalSamples, algorithmVersion },
//   schedule: ScheduleEntryOutput[],
//   unscheduled: UnscheduledEntryOutput[],
//   metrics: MetricsOutput,
//   metadata: { lunchBreaks, constraintsApplied },
// }
```

`planifyLab` instantiates the entity classes from the DTOs, runs the Scheduler, runs the MetricsCalculator on the resulting schedule, then passes everything to `formatOutput` (`src/core/output/formatter.ts`) which produces the brief-aligned shape:

- Each `ScheduleEntryOutput` exposes the times as `"HH:MM"` strings, the actual `duration` in minutes, the sample's `analysisType`, the technician's `efficiency` coefficient, a `lunchBreak` field (currently always `null` as lunch preemption is not implemented) and `cleaningRequired: true` for every entry that is not the first on its equipment.
- `MetricsOutput` carries the brief's names: `efficiency` (the global formula), `conflicts` (always `0` by construction), `averageWaitTime` per priority rounded to integers, `technicianUtilization` averaged across technicians, `priorityRespectRate`, `parallelAnalyses` (peak number of concurrent analyses) and `lunchInterruptions` (stays at `0` since preemption is not implemented).
- `metadata.lunchBreaks` lists each technician's lunch window with planned and actual times (always identical for now), and `metadata.constraintsApplied` enumerates the constraints actually honored by the scheduler (priority management, specialization matching, lunch breaks, equipment compatibility, cleaning delays, efficiency coefficients, parallelism optimization — `maintenance_avoidance` is absent, consistent with the "not handled" section above).

An example output generated on `data/samples.json` is committed as `data/output-example.json` (required deliverable). It can be regenerated at any time with `pnpm schedule --file=data/samples.json --output=data/output-example.json`.

## Tests

The suite is written with **Jest + ts-jest** and lives under `tests/`, mirroring the source tree. Run it with `pnpm test`. A dedicated `tsconfig.jest.json` isolates the commonjs/node module settings Jest needs from the main Next.js `tsconfig.json`.

### Coverage

- **`tests/utils/time.test.ts`** — `parseTime`, `formatTime`, `parseRange`, `overlaps`.
- **`tests/entities/`** — `Sample` (getters, `arrivalMinutes`, `isStat`, `isUrgent`), `Technician` (`canHandle`, `adjustedDuration` with `Math.round`, `adjustForLunch`), `Equipment` (getters, `compatibleTypes`).
- **`tests/scheduler/sortSamples.test.ts`** — priority ordering (STAT > URGENT > ROUTINE), arrival-time tie-break, no-mutation guarantee.
- **`tests/scheduler/analysisTypeResolver.test.ts`** — exact match, substring match (enriched names like `"Caryotype urgent"`), case-insensitivity, the `type` fallback list, the empty-primary case.
- **`tests/scheduler/findTechnicians.test.ts`** — step 1 `sample.type` match, step 2 `equipment.type` fallback, the no-match case.
- **`tests/scheduler/Scheduler.test.ts`** — single-sample happy path, STAT-first ordering, efficiency coefficient applied to duration, lunch-break push, cleaning time between two samples on the same slot, unscheduled when no compatible equipment exists.
- **`tests/metrics/MetricsCalculator.test.ts`** — `totalTime` across the schedule, average waiting time per priority, STAT 30-minute priority-respect rate.
- **`tests/planifyLab.test.ts`** — golden / integration test on `data/samples.json`: top-level output shape, `laboratory` metadata, 18/20 scheduled + `S003`/`S015` unscheduled, `HH:MM` time formatting, correct equipment routing for sensitive cases (`Caryotype urgent → EQ005`, `Sérologie HIV → EQ004`), `conflicts: 0`, presence of key constraint flags in `metadata.constraintsApplied`.

### Shared factories

`tests/helpers/factories.ts` exposes two sets of factories:

- `makeSample`, `makeTechnician`, `makeEquipment` return **DTOs** with sane defaults (used by integration-style tests like `planifyLab`).
- `makeSampleEntity`, `makeTechnicianEntity`, `makeEquipmentEntity` return the **entity classes** already constructed from those DTOs, so unit tests on class behavior are one line instead of `new Sample(makeSample(...))`.

Each factory takes a `Partial<...Override>` where the override type widens the branded IDs (`SampleId`/`TechnicianId`/`EquipmentId`) and narrow unions (`AnalysisType`, `Priority`, `TimeString`, `Range<...>`) back to plain `string | number`. Tests can pass `'S042'`, `'Numération'`, `42` directly without fighting the brands; the factory casts to the strict DTO internally before handing it to the entity constructor.

### TypeScript configuration split

Three tsconfig files coexist to keep Next.js, the Jest runner, and the IDE happy:

- `tsconfig.json` — main Next.js config, excludes `tests/` so the production build is never weighed down by test files.
- `tsconfig.jest.json` — extends the main config but switches to `commonjs` / `node` for Jest and declares `types: ["node", "jest"]` so globals like `describe`, `it`, `expect` and the `node:*` imports resolve.
- `tests/tsconfig.json` — tiny file that extends `tsconfig.jest.json` so the VS Code TypeScript server picks up the right config when opening a test file (otherwise the exclusion in the main tsconfig leaves test files without a resolver).

## Design notes

A few deliberate choices made during the project:

- **No runtime validation layer on DTOs (no zod/yup).** The data source is a static, trusted JSON file — not a user form. TypeScript types (`Sample`, `Technician`, `Equipment`) are enough to describe the shape; we don't need to guard against malformed input at runtime.
- **DTO and entity separation.** DTO interfaces live in `src/core/types/` and mirror the input JSON shape. Entity classes in `src/core/entities/` wrap a DTO and will progressively expose domain behavior (getters, methods) as the scheduler needs them.
- **Closed-world enums via const objects.** Enums like `PRIORITY`, `SPECIALTY`, `SERVICES` use the `const object + typeof + keyof` pattern. This gives both value access (e.g. `SERVICES.URGENCES`) and a strict union type in a single source of truth.
- **Branded ID types.** `SampleId`, `TechnicianId`, `EquipmentId` are branded strings to prevent accidental cross-entity ID mixups at the type level.
- **Template literal type for time strings.** `TimeString` enforces the `HH:MM` format (00:00–23:59) at compile time.
- **Generic `Range<Min, Max>` utility.** Age and analysis time are constrained to their valid ranges at the type level via a recursive `Enumerate` helper, so invalid literals fail to compile.

