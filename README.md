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
