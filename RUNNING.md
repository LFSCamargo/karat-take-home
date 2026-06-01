# Running locally (API + Web + Stripe)

This repo supports two local modes:

- **Mock mode (fast UI demo)**: the web app uses mocked dashboard data.
- **Live mode (end-to-end demo)**: the web app calls the API, the API reads Postgres, and Stripe webhooks update the DB.

## Prerequisites

- Docker Desktop (for Postgres + running the stack via Compose)
- pnpm (if running without Docker)
- Stripe CLI (optional, for webhook forwarding)

## 1) Create your `.env`

```bash
cp .env.example .env
```

## 2) Start the stack with Docker (recommended)

```bash
docker compose up --build
```

- Web: `http://localhost:4200`
- API: `http://localhost:3333`
- Health: `http://localhost:3333/health`

## 3) Choose your mode

### Option A — Mock mode (default)

Keep:

```env
VITE_PUBLIC_USE_MOCK_DATA=true
```

Then open `http://localhost:4200`.

### Option B — Live mode (API auth + Postgres)

Update:

```env
VITE_PUBLIC_USE_MOCK_DATA=false
```

Then restart `docker compose up` so the web container picks it up.

#### Minimal auth (demo)

In live mode, the web app can send:

```
Authorization: Bearer <token>
```

The token can be either:

- a Stripe Issuing cardholder id (`ich_...`), or
- the local DB uuid for a cardholder row

##### Dev shortcut (recommended)

Set your Stripe cardholder id directly:

```env
DEFAULT_CARDHOLDER_ID=ich_1TdN1WKwDPKf4YUiJrREiv0X
```

The API maps `ich_...` to the local `cardholders.id` created by webhooks, then scopes metrics/transactions correctly. No login token needed in local dev.

## 4) Stripe webhooks (optional end-to-end)

### Forward Stripe webhooks to the local API

In a separate terminal:

```bash
stripe login
stripe listen --forward-to http://localhost:3333/webhooks/stripe
```

The `stripe listen` command prints a webhook signing secret like `whsec_...`.
Copy it into your `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

Restart the API container after changing `.env`.

### Generate events (recommended script)

With `STRIPE_SECRET_KEY` set in `.env` and `stripe listen` running:

```bash
pnpm stripe:trigger -- ich_1TdN1WKwDPKf4YUiJrREiv0X
```

Optional fixed amount in cents:

```bash
pnpm stripe:trigger -- ich_1TdN1WKwDPKf4YUiJrREiv0X --amount 2500
```

The script will:

1. Reuse an existing Issuing card for that cardholder (or create a virtual card)
2. Create a test transaction with a **random merchant category** (force capture)
3. Emit webhooks to your local API

With `DEFAULT_CARDHOLDER_ID=ich_...` set, refresh the dashboard after webhooks arrive.

### Other ways to generate events

- **Resend a real event** from your Stripe Dashboard (Developers → Events → “Resend”)
- **Stripe CLI triggers** (may not target your cardholder): `stripe trigger issuing_transaction.created`

After webhooks arrive, refresh the dashboard (or wait for background refetch).

## Notes

- After pulling new API code, run migrations if the dashboard fails with missing-column errors:
  ```bash
  pnpm migrate
  ```
  Docker Compose runs migrations on API startup, but Nx may cache an older migrate result — restart with `docker compose up --build api` or run `pnpm migrate` manually.
- The webhook route (`POST /webhooks/stripe`) is public and uses Stripe signature verification.
- All dashboard reads are under `/api/*` and require auth in live mode.
