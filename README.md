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
3. For each candidate equipment, gather compatible technicians and try to assign one:
   - `start = max(sample.arrivalTime, technician.nextFreeTime, equipment.nextFreeSlot, technician.startTime)`
   - `end = start + sample.analysisTime`
   - If `end` exceeds `technician.endTime`, try the next technician. If no technician fits on this equipment, try the next candidate equipment.
4. If no combination of equipment and technician fits, the sample is reported as unscheduled with the reason.

### What is intentionally not handled yet

- **Technician lunch breaks.** The `lunchBreak` field is loaded but not consulted. Technicians are considered available during their whole working window.
- **Equipment maintenance windows.** `maintenanceWindow` is loaded but not consulted. Equipments are available from the start of the day.
- **Efficiency coefficient.** `technician.efficiency` is loaded but analysis durations are not adjusted yet. The brief asks for `Math.round(duration / efficiency)`; this will be added as a later step.
- **STAT preemption.** STAT samples are prioritized by the sort but do not interrupt a running analysis.

These are the planned next steps and will be added incrementally.

## Design notes

A few deliberate choices made during the project:

- **No runtime validation layer on DTOs (no zod/yup).** The data source is a static, trusted JSON file — not a user form. TypeScript types (`Sample`, `Technician`, `Equipment`) are enough to describe the shape; we don't need to guard against malformed input at runtime.
- **DTO and entity separation.** DTO interfaces live in `src/core/types/` and mirror the input JSON shape. Entity classes in `src/core/entities/` wrap a DTO and will progressively expose domain behavior (getters, methods) as the scheduler needs them.
- **Closed-world enums via const objects.** Enums like `PRIORITY`, `SPECIALTY`, `SERVICES` use the `const object + typeof + keyof` pattern. This gives both value access (e.g. `SERVICES.URGENCES`) and a strict union type in a single source of truth.
- **Branded ID types.** `SampleId`, `TechnicianId`, `EquipmentId` are branded strings to prevent accidental cross-entity ID mixups at the type level.
- **Template literal type for time strings.** `TimeString` enforces the `HH:MM` format (00:00–23:59) at compile time.
- **Generic `Range<Min, Max>` utility.** Age and analysis time are constrained to their valid ranges at the type level via a recursive `Enumerate` helper, so invalid literals fail to compile.

