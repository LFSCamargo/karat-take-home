# Stripe Card Dashboard Backend

##### Author: LFSCamargo

## Introduction

This backend powers the first version of a cardholder activity and insights dashboard. The service gives cardholders a fresh view of their card spend, a small set of metrics, and a lightweight spend breakdown by merchant category.

The backend will use NodeJS, Express, Typescript, PostgreSQL, and Vitest. Stripe Issuing is the source of truth for card activity, while PostgreSQL stores the dashboard read model so the frontend can load quickly without calling Stripe for every page view.

## Potential Solutions

### Selected approach

Use Stripe webhooks to keep a local PostgreSQL database updated, then expose simple read endpoints for the frontend.

This is the best fit for the first version because the dashboard needs recent data, not a perfect real time stream. Webhooks keep the database fresh, and the frontend can fetch metrics, spend breakdown, and transactions from our own API.

### Alternative considered

The frontend could request data from the backend, and the backend could call Stripe every time. That would be simpler at first, but it would make the dashboard slower, increase Stripe dependency during page load, and make metrics harder to compute consistently.

## Assumptions

1. Cardholders are already authenticated before calling this backend.
2. Every API request includes the authenticated cardholder context from the auth layer.
3. Stripe webhook events include enough data to map authorizations and transactions to cardholders.
4. We only store the data needed for the dashboard, not full card PAN or sensitive payment credentials.
5. The first version supports one primary currency per cardholder.
6. The Stripe webhook endpoint only subscribes to the Issuing event types this dashboard needs.

## Constraints / Limitations

1. This service is not the system of record for card issuing. Stripe remains the source of truth.
2. The dashboard can be slightly delayed if Stripe webhooks arrive late or are retried.
3. This design does not include a full admin portal.
4. This design does not include long term analytics or data warehouse reporting.

## System Design and Architecture

### System diagram or flowchart

NOTE: Check all Sequential Diagrams at https://sequencediagram.org/

```text
title Card dashboard backend flow

participant Cardholder
participant Frontend
participant Backend API
participant PostgreSQL
participant Stripe

Cardholder->Frontend: Opens dashboard
Frontend->Backend API: GET /api/transactions
Backend API->PostgreSQL: Read recent transactions
PostgreSQL-->Backend API: Transactions
Backend API-->Frontend: Activity feed

Frontend->Backend API: GET /api/metrics
Backend API->PostgreSQL: Aggregate spend metrics
PostgreSQL-->Backend API: Totals and counts
Backend API-->Frontend: Dashboard metrics

Frontend->Backend API: GET /api/spend/breakdown
Backend API->PostgreSQL: Group spend by merchant category
PostgreSQL-->Backend API: Category totals
Backend API-->Frontend: Spend breakdown

Stripe->Backend API: POST /webhooks/stripe
Backend API->Backend API: Verify Stripe signature
Backend API->PostgreSQL: Upsert event and card activity
PostgreSQL-->Backend API: Saved
Backend API-->Stripe: 200 OK

Frontend->Backend API: Refresh dashboard
Backend API->PostgreSQL: Read updated data
PostgreSQL-->Backend API: Fresh activity and metrics
Backend API-->Frontend: Updated dashboard
```

### User Journey

NOTE: Check all Sequential Diagrams at https://sequencediagram.org/

```text
title Cardholder sees fresh card activity

participant Cardholder
participant Dashboard
participant Backend
participant Database
participant Stripe

Cardholder->Dashboard: Logs in and opens the first page
Dashboard->Backend: Request activity, metrics, and spend breakdown
Backend->Database: Load cardholder dashboard data
Database-->Backend: Stored transactions and aggregates
Backend-->Dashboard: Dashboard response
Dashboard-->Cardholder: Shows activity feed and insights

Stripe->Backend: Sends issuing transaction or authorization webhook
Backend->Backend: Validate event and normalize payload
Backend->Database: Save event and update dashboard tables
Database-->Backend: Commit complete
Backend-->Stripe: Acknowledge webhook

Cardholder->Dashboard: Refreshes or auto refresh runs
Dashboard->Backend: Request latest dashboard data
Backend->Database: Load updated data
Database-->Backend: Fresh transactions and aggregates
Backend-->Dashboard: Updated response
Dashboard-->Cardholder: Shows new spend activity
```

### Terminology and components

1. Cardholder means the logged in user viewing their own card activity.
2. Transaction means finalized card spend from Stripe Issuing.
3. Authorization means an approved, declined, or pending card authorization from Stripe Issuing.
4. Webhook event means a signed Stripe notification sent to our backend.
5. Dashboard read model means PostgreSQL tables shaped for fast frontend reads.

### Hard and soft dependencies

1. PostgreSQL is a hard dependency for reads and webhook persistence. If it is down, the API should return a service error and Stripe will retry webhook delivery.
2. Stripe webhooks are a hard dependency for freshness. If webhook delivery is delayed, the dashboard still works with the last stored data.
3. Stripe API is a soft dependency for this first version. We can use it for backfill or reconciliation jobs, but normal dashboard reads should not depend on live Stripe calls.

### Algorithm or pseudo code for main components

Webhook handling:

```text
Receive Stripe webhook request
Verify Stripe signature using the raw request body
Reject invalid signatures
Store the Stripe event id with a unique constraint
If the event was already processed, return success
Map the Stripe payload to a cardholder, card, authorization, or transaction
Upsert the normalized records in PostgreSQL
Update metrics and spend category totals inside the same transaction
Return success to Stripe
```

The webhook route should do only the work needed to safely persist the event and update the dashboard read model. Any slower reconciliation work should happen outside the request path so Stripe receives a quick `2xx` response.

Dashboard fetching:

```text
Receive authenticated dashboard request
Apply rate limiting by user and IP
Read only rows owned by the authenticated cardholder
Return transactions, metrics, or category breakdown
Include updated_at so the frontend can show freshness
```

### Service guarantees that you expect

1. Stripe event processing is idempotent by storing `stripe_event_id` with a unique constraint.
2. Database writes for an event happen inside one transaction.
3. If webhook processing fails, Stripe retries and the event can be processed later.
4. Dashboard reads should return the latest committed data.
5. Metrics should be eventually consistent with Stripe activity.
6. Duplicate Stripe events are ignored by event id. If Stripe sends separate events for the same underlying object, the handler uses the Stripe object id and event type to avoid double counting.
7. Event ordering is not assumed. Upserts should use Stripe object ids and the latest known status instead of depending on delivery order.

### Data definition, schema design and persistence requirements

`cardholders`

1. `id`
2. `external_user_id`
3. `display_name`
4. `email`
5. `phone_number`
6. `status`
7. `profile_synced_at`
8. `created_at`
9. `updated_at`

`cards`

1. `id`
2. `cardholder_id`
3. `stripe_card_id`
4. `last4`
5. `brand`
6. `status`
7. `created_at`
8. `updated_at`

`transactions`

1. `id`
2. `cardholder_id`
3. `card_id`
4. `stripe_transaction_id`
5. `amount`
6. `currency`
7. `merchant_name`
8. `merchant_category`
9. `status`
10. `authorized_at`
11. `posted_at`
12. `created_at`
13. `updated_at`

`authorizations`

1. `id`
2. `cardholder_id`
3. `card_id`
4. `stripe_authorization_id`
5. `amount`
6. `currency`
7. `merchant_name`
8. `merchant_category`
9. `status`
10. `created_at`
11. `updated_at`

`stripe_events`

1. `id`
2. `stripe_event_id`
3. `event_type`
4. `processed_at`
5. `created_at`

`spend_category_totals`

1. `id`
2. `cardholder_id`
3. `merchant_category`
4. `amount`
5. `currency`
6. `period_start`
7. `period_end`
8. `updated_at`

## Caching requirements

The first version does not need an external cache. PostgreSQL should be enough if we index by `cardholder_id`, `posted_at`, `merchant_category`, and Stripe ids.

If reads become heavy, we can add short lived in memory caching for metrics and spend breakdown, with a small time to live such as 30 seconds.

## Capacity planning

The first version should handle a modest cardholder base and thousands of events per day. Transactions and authorizations should be retained for at least 13 months so users can review recent spend and the product can support monthly views.

PostgreSQL is enough for this scope. Partitioning by month can be added later if transaction volume grows.

## Performance requirements

1. Dashboard read endpoints should respond in under 300ms for a typical cardholder.
2. Webhook requests should complete in under 2 seconds.
3. API pagination should be required for transactions.
4. Metrics and breakdown queries should use indexed columns or precomputed totals.

## Observability

Observability should help us answer three simple questions: are webhooks arriving, are they being processed correctly, and can cardholders see fresh data.

### Logs

Use structured JSON logs from the Express app.

1. Log every request with request id, route, status code, latency, and authenticated cardholder id when available.
2. Log every Stripe webhook with `stripe_event_id`, `event_type`, processing result, latency, and retry status when available.
3. Log database errors with the internal record id and query name, not raw Stripe payloads.
4. Keep logs free of full card numbers, CVC, secrets, and unnecessary personal data.

### Metrics

Emit application metrics for the backend and webhook pipeline.

1. Request count, error count, and latency by route.
2. Webhook events received, processed, ignored as duplicate, and failed by event type.
3. Webhook processing latency and database transaction latency.
4. Dashboard data freshness, measured as the age of the newest stored transaction per cardholder.
5. Rate limit hits by route.

### Alerts

Start with a small alert set.

1. Webhook failure rate is above an agreed threshold for 5 minutes.
2. No Stripe webhook events have been processed for an unusual amount of time during active hours.
3. Dashboard data freshness is older than the accepted window.
4. API error rate or latency is above the service target.
5. PostgreSQL connection failures are increasing.

### Tracing

Use request ids across Express middleware, route handlers, database calls, and webhook processing logs. This lets us follow one dashboard request or one Stripe event from entry to persistence.

## Security

1. Validate every Stripe webhook signature before reading the event payload.
2. Use HTTPS only.
3. Apply rate limiting to public API routes and webhook routes.
4. Scope all dashboard reads by authenticated cardholder.
5. Do not store full card numbers, CVC, or sensitive payment credentials.
6. Keep Stripe secrets in environment variables.
7. Log Stripe event ids and internal ids, not raw sensitive payloads.
8. Use the official Stripe library for signature verification.
9. Preserve the raw request body for `/webhooks/stripe`, because changing the body before verification can make valid Stripe signatures fail.
10. Use separate webhook signing secrets for local, test, and production environments.

## Rate limiting

Use an Express rate limiting middleware backed by memory for local development and PostgreSQL or Redis for deployed environments.

1. Dashboard API routes: 100 requests per user per minute.
2. Webhook route: higher IP based limit, such as 600 requests per minute, because Stripe may retry events in bursts.
3. Authentication context should be preferred for user limits. IP should be used as a fallback.
4. Rate limit responses should use HTTP `429`.

## Multi region story

The first version can run in one region near the PostgreSQL database. Multi region support is not required yet because webhook ordering and transactional writes are simpler in one primary region.

For a later version, the backend can run in multiple regions while keeping one primary database writer.

## Environment

Both apps read from a single root `.env` file. Copy `.env.example` to `.env` at the repo root.

Backend variables:

1. `PORT` — API listen port, default `3333`.
2. `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` — used to build database URLs when `DATABASE_URL` is not set.
3. `DATABASE_URL` — PostgreSQL connection for the app database (`app_db`).
4. `TEST_DATABASE_URL` — PostgreSQL connection for Vitest (`app_db_test`).
5. `DEFAULT_CARDHOLDER_ID` — local development cardholder context only.
6. `STRIPE_SECRET_KEY` — Stripe SDK secret key.
7. `STRIPE_WEBHOOK_SECRET` — webhook signing secret from Stripe CLI or Dashboard.

The API loads `.env` on startup through `apps/api/src/config/env.ts`.

### Docker Compose

Run the database, API, and web app together:

```bash
cp .env.example .env
docker compose up --build
```

Or use `pnpm docker:up`.

Services:

1. `db` — PostgreSQL with `app_db` and `app_db_test` from `db/init.sql`.
2. `api` — runs migrations, then `nodemon --legacy-watch` with `tsx` on port `3333`.
3. `web` — runs `pnpm nx dev web` on port `4200` with Vite polling and HMR configured for Docker bind mounts.

Both `api` and `web` use the root `.env` via `env_file`. Compose sets `DOCKER_DEV=true` so file watching uses polling (reliable on macOS Docker Desktop). Keep `VITE_PUBLIC_API_URL=http://localhost:3333` so the browser reaches the published API port.

## API Endpoints

### `POST /webhooks/stripe`

Receives Stripe Issuing webhook events. The route verifies the Stripe signature using the raw request body, stores the event id, updates transactions or authorizations, and returns `200 OK` after the event is safely stored.

Requirements:

1. Use the raw request body for signature verification. JSON parsing happens only after Stripe validates the payload.
2. Read the signing secret from `STRIPE_WEBHOOK_SECRET`.
3. Reject invalid signatures with HTTP `400`.
4. Apply webhook rate limiting at 600 requests per minute.

Supported event types:

1. `issuing_authorization.created`
2. `issuing_authorization.updated`
3. `issuing_transaction.created`
4. `issuing_transaction.updated`

Processing rules:

1. Store `stripe_event_id` in `stripe_events` with a unique constraint.
2. Ignore duplicate Stripe events after they are marked processed.
3. Upsert authorizations by `stripe_authorization_id`.
4. Upsert transactions by `stripe_transaction_id`.
5. Create cardholders from Stripe cardholder ids using `external_user_id`.
6. Create cards from Stripe card ids using `stripe_card_id`.
7. Perform all writes for one event inside a single PostgreSQL transaction.
8. Unknown event types are acknowledged without changing dashboard tables.

Environment variables:

1. `STRIPE_WEBHOOK_SECRET`
2. `STRIPE_SECRET_KEY` for Stripe SDK initialization and test signature generation

### `GET /api/metrics`

Returns total spend, transaction count, average transaction amount, and latest activity timestamp for the authenticated cardholder.

Aggregation rules:

1. `totalSpend`, `transactionCount`, and `averageTransactionAmount` include only transactions with status `approved`.
2. Aggregates are computed in PostgreSQL using filtered `sum`, `count`, and `avg` expressions.
3. Amounts are stored in cents in PostgreSQL and converted to decimal currency units in SQL before returning the API response.
4. `latestActivityAt` uses the most recent `coalesce(posted_at, authorized_at)` across all transactions for the cardholder, regardless of status.
5. `currency` comes from the cardholder's approved transactions. The first version assumes one primary currency per cardholder.

### `GET /api/cardholder`

Returns the authenticated cardholder profile for the app shell.

Behavior:

1. Reads cached profile fields from `cardholders` and the most recently updated card from `cards`.
2. When `profile_synced_at` is missing or older than one hour, refreshes profile data from Stripe Issuing using `external_user_id` (`ich_...`).
3. Stores refreshed fields in PostgreSQL (`display_name`, `email`, `phone_number`, `status`, card `last4`, card `brand`).
4. Returns `404` when cardholder context is missing or the local cardholder row does not exist.

Response fields:

1. `id`
2. `stripeCardholderId`
3. `displayName`
4. `email`
5. `phoneNumber`
6. `status`
7. `memberSince`
8. `primaryCard.last4`
9. `primaryCard.brand`
10. `primaryCard.status`

### `GET /api/spend/breakdown`

Returns spend grouped by merchant category for the authenticated cardholder. The endpoint accepts optional `from` and `to` query parameters.

Aggregation rules:

1. Only transactions with status `approved` are included.
2. Optional `from` and `to` filter on `coalesce(posted_at, authorized_at)`.
3. Category totals, percentages, and sorting are computed in PostgreSQL using grouped sums and window functions.
4. Each item includes `amount`, `currency`, and `percentage` of the filtered total spend.
5. Amounts are stored in cents in PostgreSQL and converted to decimal currency units in SQL before returning the API response.

### `GET /api/transactions`

Returns paginated card activity for the authenticated cardholder.

Supported query params:

1. `page` — page number, default `1`.
2. `pageSize` — page size, default `20`, max `100`.
3. `merchant` — optional case-insensitive partial match on merchant name.
4. `merchantCategory` — optional repeatable param for one or more merchant categories. Example: `?merchantCategory=restaurants&merchantCategory=travel`.
5. `status` — optional repeatable param for one or more transaction statuses. Example: `?status=approved&status=pending`.
6. `from` — optional ISO timestamp lower bound on activity time.
7. `to` — optional ISO timestamp upper bound on activity time.

### `GET /api/transactions/:id`

Returns one transaction when it belongs to the authenticated cardholder.

Path params:

1. `id` — transaction uuid.

Behavior:

1. Cardholder context is resolved server-side. Clients must not pass a cardholder id in headers or query params.
2. Returns `404` when the transaction does not exist, does not belong to the authenticated cardholder, or the id is invalid.
3. Uses the same transaction response shape as items in `GET /api/transactions`.

## Rollout Plan

1. Create database tables and indexes.
2. Build webhook ingestion with Stripe signature validation and idempotency.
3. Build read endpoints for transactions, metrics, and spend breakdown.
4. Add Vitest coverage for webhook processing and API reads.
5. Test with Stripe sandbox events.
6. Enable the dashboard for internal testing.
7. Release to the first cardholder group.

## Test Plan

Use Vitest for unit and integration coverage.

1. Webhook signature validation accepts valid requests and rejects invalid requests.
2. Duplicate Stripe events do not create duplicate transactions.
3. Transaction events update the activity feed.
4. Authorization events update the stored authorization state.
5. Metrics are recalculated correctly after new spend arrives.
6. Spend breakdown groups totals by merchant category.
7. API routes only return data for the authenticated cardholder.
8. Rate limiting returns `429` when limits are exceeded.
9. Webhook tests use the same raw body behavior required by Stripe signature verification.
10. Local integration testing uses the Stripe CLI to listen for sandbox events and trigger webhook deliveries.

## Appendix

1. Challenge: `Challenge.md`
2. Stripe Issuing Cards: https://stripe.com/docs/api/issuing/cards
3. Stripe Issuing Authorizations: https://stripe.com/docs/api/issuing/authorizations
4. Stripe Issuing Transactions: https://stripe.com/docs/api/issuing/transactions
5. Stripe Webhooks: https://stripe.com/docs/webhooks
6. Stripe CLI: https://stripe.com/docs/stripe-cli
7. Sequence diagram tool: https://sequencediagram.org/
