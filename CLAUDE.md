@AGENTS.md

# Project

Next.js (App Router, TypeScript, Tailwind) web app. Package manager: npm.

## Stack

- Framework: Next.js 16 (App Router), React 19
- Styling: Tailwind CSS v4
- Unit tests: Vitest + React Testing Library (`src/**/*.test.tsx`)
- E2E tests: Playwright (`e2e/*.spec.ts`)
- CI: GitHub Actions (`.github/workflows/ci.yml`) — lint, unit tests, build, e2e on every push/PR
- Deploy: Vercel (connected to GitHub repo — auto-deploy `main`, preview per PR)
- Database: not provisioned yet — plan is Postgres via Neon/Vercel Postgres + Prisma once schema needs are known

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run test` — unit tests (Vitest)
- `npm run test:e2e` — e2e tests (Playwright)
- `npm run lint` — ESLint

## Conventions

- Keep commits small and scoped to one change.
- Every new feature/route should get at least one unit or e2e test before merging.
