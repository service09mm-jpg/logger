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
- Database: Postgres via Neon (provisioned through the Vercel Storage integration) + Prisma 7 ORM

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build (no DB access)
- `npm run vercel-build` — used by Vercel: `prisma generate && prisma migrate deploy && next build`
- `npm run test` — unit tests (Vitest)
- `npm run test:e2e` — e2e tests (Playwright)
- `npm run lint` — ESLint
- `npx prisma migrate dev --config prisma7.config.ts` — create a new migration (needs real DB access, see note below)

## Database / Prisma notes

- Prisma 7 moved the connection URL out of `schema.prisma` into `prisma7.config.ts` (that exact filename —
  Prisma 7 looks for `prisma7.config.ts`, not `prisma.config.ts`). It loads secrets from `.env.local` itself.
- `PrismaClient` needs a driver adapter now (no more implicit connection from `schema.prisma`). We use
  `@prisma/adapter-neon` (`src/lib/prisma.ts`) — the Neon serverless driver over WebSocket/HTTP, which fits
  Vercel's serverless functions better than a raw TCP pool anyway.
- **This sandboxed dev container cannot reach the Neon database at all**: raw TCP (port 5432, what
  `prisma migrate dev`/`db push` need) is not supported through the egress proxy here, and Neon's HTTP API
  host (`api.*.neon.tech`) is not on this session's egress allowlist either. Do not retry either path from
  here — it's a deliberate org policy, not a transient failure.
- Consequence: **migrations are authored here but applied by Vercel's build**, which has normal network
  access. To add a schema change: edit `prisma/schema.prisma`, then generate the SQL with
  `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script --config <config> -o <out>.sql`
  (Prisma 7 renamed `--to-schema-datamodel` to `--to-schema`), save it under
  `prisma/migrations/<timestamp>_<name>/migration.sql`, commit it. The next Vercel deploy runs
  `vercel-build`, which applies it via `prisma migrate deploy`.
- `--from-migrations` replays the existing migrations to work out the "before" state, and for that it needs a
  **shadow database** — but a local throwaway one, not Neon. `npx prisma dev -d -n <name>` starts a Postgres
  inside this container and prints its URL; point a temporary config at it
  (`datasource: { url, shadowDatabaseUrl }` from env vars — `prisma7.config.ts` itself stays untouched) and pass
  that config to the command above. Stop it afterwards with `npx prisma dev stop <name>` and delete the temp
  config. Re-running the same command after saving the migration must print "This is an empty migration" —
  that is the check that migrations and `schema.prisma` agree.
- If a schema change is needed immediately (not on next deploy), the user can paste the migration SQL into
  Neon's web SQL editor (Vercel Storage tab → the DB → SQL editor) — ask them, don't try to reach it from here.

## Conventions

- Keep commits small and scoped to one change.
- Every new feature/route should get at least one unit or e2e test before merging.
- Never use `npm install --legacy-peer-deps` as a default habit: it silently skips installing *required*
  peer dependencies too (bit us twice — lost `@testing-library/dom` and `vite`, both hard requirements of
  packages we use). Only reach for it to work around a specific known npm/arborist bug, and immediately
  verify with `npm run lint && npm run test && npm run test:e2e && npm run build` afterward — don't assume
  the tree is still consistent.
