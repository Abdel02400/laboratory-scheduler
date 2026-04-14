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

## Design notes

A few deliberate choices made during the project:

- **No runtime validation layer on DTOs (no zod/yup).** The data source is a static, trusted JSON file — not a user form. TypeScript types (`Sample`, `Technician`, `Equipment`) are enough to describe the shape; we don't need to guard against malformed input at runtime.
- **DTO and entity separation.** DTO interfaces live in `src/core/types/` and mirror the input JSON shape. Entity classes in `src/core/entities/` wrap a DTO and will progressively expose domain behavior (getters, methods) as the scheduler needs them.
- **Closed-world enums via const objects.** Enums like `PRIORITY`, `SPECIALTY`, `SERVICES` use the `const object + typeof + keyof` pattern. This gives both value access (e.g. `SERVICES.URGENCES`) and a strict union type in a single source of truth.
- **Branded ID types.** `SampleId`, `TechnicianId`, `EquipmentId` are branded strings to prevent accidental cross-entity ID mixups at the type level.
- **Template literal type for time strings.** `TimeString` enforces the `HH:MM` format (00:00–23:59) at compile time.
- **Generic `Range<Min, Max>` utility.** Age and analysis time are constrained to their valid ranges at the type level via a recursive `Enumerate` helper, so invalid literals fail to compile.

