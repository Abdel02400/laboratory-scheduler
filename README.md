# Laboratory Scheduler

![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10.2.0-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.8.2-F7B93E?logo=prettier&logoColor=black)
![pnpm](https://img.shields.io/badge/pnpm-8.6.5-F69220?logo=pnpm&logoColor=white)

A scheduling system for a medical laboratory: samples distributed across technicians and equipment, respecting priorities and constraints. Supports both the **simple** and **intermediate** versions of the brief (the code reacts to the presence/absence of optional fields, with no version flag).

> **Note on Next.js.** A Next.js stack is scaffolded because the original plan included a front-end UI on top of the scheduler. Time ran out before the UI could be built, so only the core scheduler + CLI are functional today. The `dev`/`build`/`start` scripts remain available for a future UI pass.

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 8

## Installation

```bash
git clone <repo-url>
cd laboratory-scheduler
pnpm install
```

## Scripts

Only scripts that matter for this project today:

- `pnpm schedule --file=<input.json> [--output=<output.json>]` — run the scheduler on an input JSON and print or write the result. This is the entry point for the brief.
- `pnpm test` — run the Jest test suite (58 tests / 14 suites).
- `pnpm test:watch` — Jest watch mode.
- `pnpm lint` — ESLint on the whole project.
- `pnpm format` / `pnpm format:check` — Prettier.

Reserved for the future front-end (not used today): `pnpm dev`, `pnpm build`, `pnpm start`.

Example:

```bash
pnpm schedule --file=data/samples.json --output=data/output.json
```

## Scope choices

This implementation deliberately sticks to a **data-driven greedy scheduler**. The choices below were made explicitly and are not gaps:

- **Sort-then-place greedy, not time-simulated.** Samples are sorted globally by priority (STAT > URGENT > ROUTINE, arrival time as tie-break), then placed one by one first-fit. The intermediate brief explicitly asks for "parallélisme opportuniste, pas optimisation globale" and rules out backtracking, reorganization after allocation, metaheuristics, etc.
- **Interval-based resources (STAT priority reservation).** The `ResourceTracker` stores sorted **busy intervals** per technician and per equipment slot. Because STAT samples are placed first in the loop, they effectively reserve their timeline slot at `arrivalTime`. Subsequent URGENT/ROUTINE placements call a **joint-fit finder** that searches for the earliest gap that accommodates the analysis around existing reservations — so a long URGENT can still run **before** a later-arriving STAT if the gap is wide enough. A STAT is therefore never blocked by a lower-priority analysis without the cost of runtime preemption.
- **No preemption of a running analysis.** STAT priority is enforced via the reservation mechanism above, not by interrupting an in-flight analysis. A STAT can, however, interrupt a pending lunch break (it bumps `lunchInterruptions` when the STAT window overlaps the technician's lunch).
- **No pause-and-resume across lunch.** An analysis that would straddle a lunch window is shifted to start after the lunch (unless the sample is STAT, which is allowed to run through). Analyses are atomic once started.
- **Data-driven compatibility only.** Routing decisions are taken strictly from fields present in the input (`type`, `compatibleTypes`, `specialty`, `efficiency`, etc.). No hardcoded domain dictionary — if the input does not declare a `compatibleTypes` entry linking an `analysisType` to an equipment, the code will not invent it.
- **Constraint flags are honored, not translated.** `contaminationPrevention: false` disables cleaning delays; `parallelProcessing: false` collapses every equipment to a single slot.

## Sample ↔ Equipment matching

`src/core/scheduler/findCompatibleEquipments.ts` filters equipments for a given sample using a single rule with a fallback:

1. **If the sample has an `analysisType` AND the equipment declares `compatibleTypes`:** case-insensitive substring match between `sample.analysisType` and any entry of `equipment.compatibleTypes`. Enriched names are recognized (`"Caryotype urgent"` matches `"Caryotype"`, `"Sérologie HIV"` matches `"Sérologie"`, etc.).
2. **Fallback — exact type match:** `equipment.type === sample.type`. This fires when either (a) the sample has no `analysisType` (simple version of the brief), or (b) the equipment has no `compatibleTypes` declared (partially-specified input).

If no equipment passes either check, the sample is reported `unscheduled` with the reason `No compatible equipment`.

### Why a saturation fallback is no longer needed

Earlier iterations included a `type`-fallback that fired when `compatibleTypes`-matched equipments were saturated. That introduced the risk of routing analyses to semantically wrong machines. The current rule is stricter and purely input-driven: we trust the input's declarations. If a sample cannot be scheduled because its target equipment is busy, it stays unscheduled — that is a legitimate signal about the dataset's capacity.

## Sample ↔ Technician matching

`src/core/scheduler/findCompatibleTechnicians.ts` filters technicians for a given equipment:

- A technician matches if their `specialty` array contains `equipment.type`, **or** if their specialty is `GENERAL` (which acts as a wildcard — the simple brief states "GENERAL peut faire tous les types, mais moins efficace").
- The resulting list is ordered so that **direct-match specialists come first**, then `GENERAL` fallbacks. For BLOOD equipment, a BLOOD-specialist technician is preferred over a GENERAL one, even if both match. Within the direct-match group, technicians with fewer specialties are preferred (the classic "use specialists first, save generalists for harder cases" heuristic).
- The "moins efficace" aspect of GENERAL is expressed at the input level via the optional `efficiency` coefficient — the intermediate version can lower a GENERAL tech's coefficient; the code does not hardcode a penalty.

### Cross-vocabulary (not implemented)

The full intermediate dataset has asymmetric vocabularies: `sample.type` ∈ {BLOOD, URINE, TISSUE} while `technician.specialty` ∈ {BLOOD, CHEMISTRY, MICROBIOLOGY, IMMUNOLOGY, GENETICS, …}. Only BLOOD overlaps. The dataset bridges this via `compatibleTypes` on equipment (which maps long-form analysis names to equipment types). No mapping is hardcoded in the scheduler.

## Scheduling algorithm

`src/core/scheduler/Scheduler.ts` orchestrates three helpers (`sortSamples`, `findCompatibleEquipments`, `findCompatibleTechnicians`) and delegates resource tracking to `ResourceTracker`.

### Steps

1. Sort samples by priority, then by arrival time.
2. For each sample, gather candidate equipments via `findCompatibleEquipments`.
3. For each candidate equipment, gather compatible technicians (specialists first), then try each (tech, slot) pair via a **joint-fit finder**:
    - `minStart = max(sample.arrivalTime, technician.startTime, laboratory.openingHours.start)`.
    - `duration = Math.round(sample.analysisTime / technician.efficiency)` if efficiency is defined, else `sample.analysisTime`.
    - Starting from `candidate = minStart`, iteratively push `candidate` forward past any overlapping obstacle until it stabilizes: any busy interval on the tech, any busy interval on the slot, the tech's `lunchBreak` (only for non-STAT), and the equipment's `maintenanceWindow`. STAT samples are allowed to run through the lunch — `lunchInterruptions` is incremented when that happens.
    - Reject if `candidate + duration` exceeds `technician.endTime` or `laboratory.openingHours.end`.
    - Across all slots of the equipment, keep the assignment with the earliest resulting `candidate`.
4. Reserve `[start, end]` on the tech's interval list and `[start, end + cleaningTime]` on the chosen slot (cleaning skipped if `contaminationPrevention === false`).
5. If no (equipment, technician, slot) combination fits, mark the sample unscheduled.

### Parallelism

`ResourceTracker` allocates `capacity` parallel slots per equipment (default 1 if `capacity` is undefined). With `constraints.parallelProcessing: false`, every equipment collapses to a single slot regardless of its declared capacity.

## Output format

The output follows the brief's expected shape. Every field besides `schedule` and `metrics` is emitted only when meaningful:

```jsonc
{
    "laboratory": {
        /* only if input.laboratory is set */
    },
    "schedule": [
        /* sorted by actual startTime */
    ],
    "unscheduled": [
        /* only if non-empty */
    ],
    "metrics": {
        /* always present */
    },
    "metadata": {
        "lunchBreaks": [
            /* only if at least one technician has a lunchBreak */
        ],
        "constraintsApplied": [
            /* only labels that were actually applied */
        ],
    },
}
```

`constraintsApplied` is built dynamically from what the scheduler effectively applied on this input:

| Label                      | When it appears                                             |
| -------------------------- | ----------------------------------------------------------- |
| `priority_management`      | Always                                                      |
| `specialization_matching`  | Always                                                      |
| `equipment_compatibility`  | Always                                                      |
| `parallelism_optimization` | Only if at least one equipment has `capacity > 1`           |
| `lunch_breaks`             | Only if at least one technician declares `lunchBreak`       |
| `maintenance_avoidance`    | Only if at least one equipment declares `maintenanceWindow` |
| `cleaning_delays`          | Only if at least one equipment declares `cleaningTime`      |
| `efficiency_coefficients`  | Only if at least one technician declares `efficiency`       |

## Public API — `planifyLab`

```ts
import { planifyLab } from '@/core/planifyLab';

const result = planifyLab(input);
```

`planifyLab` instantiates entity classes from the DTOs, runs the `Scheduler`, computes metrics via `MetricsCalculator`, and finally formats the result through `formatOutput`.

## Example datasets

The `data/` folder contains the official brief datasets:

- `data/samples.json` — the full intermediate dataset (20 samples / 8 technicians / 5 equipment). Regenerate output with `pnpm schedule --file=data/samples.json --output=data/output.json`.
- `data/simple-1.json` / `simple-2.json` / `simple-3.json` — the 3 pedagogical examples of the simple brief.
- `data/intermediate-1.json` / `intermediate-2.json` / `intermediate-3.json` — the 3 pedagogical examples of the intermediate brief (with caveats, see below).

### Notes on the intermediate pedagogical examples

The 3 intermediate examples exercise behaviors that go beyond the scope chosen here. Expect divergences on:

- **Example 1**: `compatibleTypes` is missing on the equipment → the routing falls back to `type` match, which routes both samples to EQ001 instead of splitting them between EQ001 and EQ002. The expected split cannot be reproduced without enriching the input.
- **Example 2**: the expected output places URGENT S002 before STAT S003 because S002 starts before S003 arrives. Our sort-then-place greedy places STAT first globally. This is the time-simulated vs sort-then-place difference.
- **Example 3**: requires TISSUE → MICROBIOLOGY cross-vocabulary mapping (not data-driven in the input) and analysis pause/resume across lunch (not implemented).

These are intentional limits aligned with the scope choices above.

## Tests

Jest + ts-jest, 58 tests across 14 suites. Structure mirrors `src/core/`:

- `tests/entities/` — `Sample`, `Technician`, `Equipment`, `Laboratory`, `Constraints` getters.
- `tests/scheduler/` — `sortSamples`, `findCompatibleEquipments`, `findCompatibleTechnicians`, `ResourceTracker`, `Scheduler`.
- `tests/metrics/` — `MetricsCalculator`.
- `tests/output/` — `formatter`.
- `tests/utils/` — `time` helpers.
- `tests/planifyLab.test.ts` — end-to-end integration against `data/samples.json`.

`tests/helpers/factories.ts` exposes loose-override factories that widen branded IDs and narrow unions back to plain `string | number`, so tests can pass `'S042'` directly without casts.

## Design notes

- **No runtime DTO validation.** The input is a trusted static JSON. TypeScript types are enough; no zod/yup layer.
- **DTO ↔ entity separation.** DTOs in `src/core/types/` mirror the input JSON; entity classes in `src/core/entities/` expose `get x()` accessors over `private readonly _x` fields.
- **Closed-world enums via `const object + typeof + keyof`.** Single source of truth for values and types.
- **Branded ID types.** `SampleId`, `TechnicianId`, `EquipmentId` prevent accidental ID mixups at compile time.

## Possible improvements

Things worth doing next, in rough priority order:

- **Front-end UI.** The Next.js stack was scaffolded for a UI that would visualize the schedule (Gantt-style) and let a user experiment with inputs. Time ran out; the UI is the natural next step.
- **Code refactor pass.** The codebase evolved incrementally through the brief's simple → intermediate progression. A cleanup pass could tighten naming, extract a few helpers (e.g. the lunch/maintenance adjust logic), and remove the legacy dual keys (`speciality` vs `specialty`).
- **Unify the technician specialty key.** Currently both `speciality` (simple) and `specialty` (intermediate) are accepted. One canonical key with a normalization at load time would be cleaner.
- **Align `analysisType` and `compatibleTypes` vocabularies.** Long form (`"Numération complète"`) vs short form (`"Numération"`) forces substring matching. A single shared vocabulary would remove the fallback.
- **Align constraint flag names.** Input uses `contaminationPrevention` / `parallelProcessing`, output uses `cleaning_delays` / `parallelism_optimization`. One shared vocabulary on both sides would remove the translation.
- **Input validator.** A runtime validator (zod or similar) at the CLI boundary would catch malformed JSON before the scheduler runs. Intentionally skipped for now (trusted static input).
- **Time-simulated scheduling (optional).** Reproducing the intermediate brief's pedagogical example 2 would require a time-simulated algorithm instead of sort-then-place. Out of scope for this submission.
- **Pause / resume across lunch (optional).** Allowing an analysis to pause at lunch start and resume after would match intermediate example 3. Requires modeling analyses as interruptible jobs.
- **STAT preemption of a running analysis (optional).** Currently STAT only interrupts lunches; the interval reservation guarantees it is never blocked by a non-STAT analysis, but it does not cut a running analysis in flight. Listed as "Version Avancée" in the brief.
