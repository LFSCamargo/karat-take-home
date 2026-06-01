# Karat Take Home

A cardholder activity and insights dashboard built on **Stripe Issuing**. It shows recent card spend, lightweight metrics, and a spend breakdown by merchant category, and keeps data reasonably fresh as Stripe webhook activity arrives.

The design intent and product scope come from [`Challenge.md`](./Challenge.md). Deeper design docs live in [`docs/BACKEND.md`](./docs/BACKEND.md) and [`docs/FRONTEND.md`](./docs/FRONTEND.md).

## Architecture

Stripe is treated as the source of truth, but the app keeps a **read model in Postgres** that is updated by **Stripe webhooks**. The frontend reads from the API instead of calling Stripe on every page view.

```
Stripe Issuing ──webhook──▶ API (/webhooks/stripe) ──▶ Postgres (read model)
                                                          │
Frontend (React Query) ──GET /api/*──▶ API (reads Postgres)
```

This keeps reads fast and consistent, and the dashboard stays useful even if Stripe is briefly unavailable. The trade-off is **eventual consistency**: data is fresh within the webhook delivery delay.

## Monorepo layout

Nx monorepo managed with pnpm:

- `apps/web` — React + Vite frontend (React Router, React Query, Tailwind, shadcn/ui).
- `apps/api` — Node + Express backend (Kysely + Postgres, Zod contracts).

Both apps are feature-first under `src/modules`.

## Tech stack

- **Frontend:** React, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS, shadcn/ui, Recharts, next-themes (light/dark/system).
- **Backend:** Node, Express, TypeScript, PostgreSQL, Kysely, Zod, Stripe SDK.
- **Tooling:** Nx, pnpm, Vitest, ESLint, Prettier, Docker Compose.

## Prerequisites

- Node 20+
- pnpm 8.15+
- Docker Desktop (for Postgres + running the full stack)
- Stripe CLI (optional, for forwarding webhooks)

## Quick start (Docker)

```bash
cp .env.example .env
pnpm docker:up
```

- Web: http://localhost:4200
- API: http://localhost:3333
- Health: http://localhost:3333/health

Migrations run automatically on API startup.

## Local development (without Docker)

Start Postgres (via Docker or your own), then:

```bash
pnpm install
pnpm migrate        # apply database migrations
pnpm dev            # run web + api together
```

Or run each app individually:

```bash
pnpm dev:web
pnpm dev:api
```

## Modes: mock vs live

The frontend can run against mocked data or the live API:

- **Mock mode:** `VITE_PUBLIC_USE_MOCK_DATA=true` — UI demo, no backend needed.
- **Live mode:** `VITE_PUBLIC_USE_MOCK_DATA=false` — reads from the API + Postgres.

In live mode, requests are scoped to a cardholder. For local dev you can set `DEFAULT_CARDHOLDER_ID=ich_...` (your Stripe Issuing cardholder id) to skip wiring a login flow; the API maps it to the local cardholder row created by webhooks.

See [`RUNNING.md`](./RUNNING.md) for the full local + Stripe webhook walkthrough.

## Common scripts

```bash
pnpm dev            # run web + api
pnpm build          # build all projects
pnpm test           # run all tests
pnpm lint           # lint all projects
pnpm format         # apply Prettier
pnpm format:check   # verify formatting
pnpm migrate        # run DB migrations
pnpm migrate:down   # roll back last migration
pnpm docker:up      # build + run the full stack
pnpm docker:down    # stop the stack
pnpm stripe:trigger -- ich_XXXX   # trigger a test Issuing transaction
```

Scope checks to a single app with Nx when iterating:

```bash
pnpm nx lint api
pnpm nx test api
pnpm nx lint web
pnpm nx test web
```

## Testing

- **API** (`apps/api`): Vitest with integration tests against a `app_db_test` Postgres database. Postgres must be running (`docker compose up -d db`); the test DB is migrated automatically by the Vitest global setup.
- **Web** (`apps/web`): Vitest + Testing Library for hooks, utils, and route behavior.

## Key features

- Activity feed, metrics, and merchant-category spend breakdown.
- Idempotent, signature-verified Stripe webhook ingestion.
- Cardholder-scoped API responses.
- Cardholder profile fetched from Stripe and cached in Postgres.
- Light/dark/system theme with no flash on load.
- Structured request and webhook logging.

## Documentation

- [`Challenge.md`](./Challenge.md) — product scenario and scope.
- [`docs/BACKEND.md`](./docs/BACKEND.md) — API endpoints, data model, webhooks, tests.
- [`docs/FRONTEND.md`](./docs/FRONTEND.md) — routes, UI flows, React Query usage, styling.
- [`RUNNING.md`](./RUNNING.md) — local + Stripe end-to-end setup.
