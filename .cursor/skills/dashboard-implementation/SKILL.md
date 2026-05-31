---
name: dashboard-implementation
description: Guides implementation work for the Stripe card dashboard monorepo. Use when scaffolding, editing, or testing the web or api apps, especially when the user mentions dashboard routes, Stripe webhooks, React Query, shadcn, Nx, pnpm, web, or api.
---

# Dashboard Implementation

## Quick Start

Before implementing, read the relevant design doc:

1. For backend work, read `docs/Backend.md`.
2. For frontend work, read `docs/Frontend.md`.
3. For product scope, read `Challenge.md`.

## Monorepo

Use Nx with pnpm.

Expected apps:

1. `apps/web`
2. `apps/api`

Prefer Nx project commands for serve, test, lint, and build.

## Backend Defaults

Use NodeJS, Express, Typescript, PostgreSQL, and Vitest.

Keep Stripe webhook handling idempotent, signed, and fast. Store Stripe events before updating dashboard read models.

Backend code should be module first:

1. Put feature code in `apps/api/src/modules/<module-name>`.
2. Put endpoint functions in `handlers`.
3. Put Express route wiring in `routes`.
4. Put Zod contracts and inferred types in `contracts`.
5. Add module scoped helpers in `utils` when needed.

## Frontend Defaults

Use React, Typescript, Vitest, React Router, Tailwind, shadcn, and React Query.

Keep backend calls in a typed API client, then expose them through React Query hooks.

Frontend code should be module first:

1. Put feature code in `apps/web/src/modules/<module-name>`.
2. Put route components and module route arrays in `routes`.
3. Put fetch clients in `api`.
4. Put React Query hooks in `hooks`.
5. Add module scoped helpers in `utils` when needed.

## Quality Bar

Add focused Vitest coverage for new behavior. Keep loading, empty, error, and rate limit states visible where they affect the user.
