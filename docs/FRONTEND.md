# Stripe Card Dashboard Frontend

##### Author: LFSCamargo

## Introduction

This frontend is the cardholder facing dashboard for recent card activity and simple spend insights. The goal is to make the first logged in page feel clear, fast, and trustworthy.

The frontend will use React, Typescript, Vitest, React Router, Tailwind, shadcn, and React Query. React Router owns navigation and route parameters. React Query owns server state, cache freshness, background refetching, and loading states. Tailwind and shadcn give us a clean interface without building every primitive from scratch.

## Potential Solutions

### Selected approach

Build a Vite based React SPA with React Router routes and React Query hooks for all backend reads.

This keeps the app simple for the first version. The backend already exposes dashboard shaped endpoints, so the frontend can stay focused on layout, state display, filtering, and refresh behavior.

### Alternative considered

We could load all dashboard data from one route level loader. That is fine for small pages, but React Query is a better fit here because the metrics, breakdown, and transactions refresh at different moments and can fail independently.

## Assumptions

1. The user is authenticated before opening the dashboard.
2. The backend API provides cardholder scoped responses.
3. The app is a client rendered SPA.
4. The dashboard shows recent data and does not need a full reporting workspace.
5. The frontend can refetch data periodically to show fresh webhook driven updates.

## Constraints / Limitations

1. The frontend does not talk to Stripe directly.
2. The frontend does not store sensitive card data.
3. The first version does not include admin views.
4. The first version does not include complex custom charting beyond the spend breakdown.

## System Design and Architecture

### System diagram or flowchart

NOTE: Check all Sequential Diagrams at https://sequencediagram.org/

```text
title Frontend dashboard architecture

participant Cardholder
participant React Router
participant Dashboard Route
participant React Query Cache
participant Dashboard API Client
participant Backend API
participant Dashboard UI

Cardholder->React Router: Opens /dashboard
React Router->Dashboard Route: Match /dashboard
Dashboard Route->React Query Cache: useMetricsQuery for GET /api/metrics
Dashboard Route->React Query Cache: useSpendBreakdownQuery for GET /api/spend/breakdown
Dashboard Route->React Query Cache: useTransactionsQuery for GET /api/transactions
React Query Cache->Dashboard API Client: Request missing or stale dashboard data
Dashboard API Client->Backend API: Send cardholder scoped requests
Backend API-->Dashboard API Client: Metrics, breakdown, and transactions JSON
Dashboard API Client-->React Query Cache: Store typed responses
React Query Cache-->Dashboard UI: Cached data plus loading state
Dashboard UI-->Cardholder: Metrics, breakdown, and activity feed
```

### Data flow from request to view

NOTE: Check all Sequential Diagrams at https://sequencediagram.org/

```text
title Request to React Query cache to view

participant Cardholder
participant Transactions Route
participant Transaction Query Hook
participant React Query Cache
participant Dashboard API Client
participant Backend API
participant Transaction Table

Cardholder->Transactions Route: Opens /transactions or changes filters
Transactions Route->Transaction Query Hook: Build key from page, category, status, and dates
Transaction Query Hook->React Query Cache: Check cached transactions
React Query Cache-->Transaction Query Hook: Return fresh data when available
Transaction Query Hook->Dashboard API Client: Fetch GET /api/transactions when data is stale
Dashboard API Client->Backend API: Send query params
Backend API-->Dashboard API Client: PaginatedTransactions JSON
Dashboard API Client-->React Query Cache: Store successful response
React Query Cache-->Transaction Query Hook: Notify route subscribers
Transaction Query Hook-->Transaction Table: Provide data, loading, and error state
Transaction Table-->Cardholder: Render updated card activity
```

### User Journey

NOTE: Check all Sequential Diagrams at https://sequencediagram.org/

```text
title Cardholder dashboard journey

participant Cardholder
participant Frontend
participant Dashboard Route
participant Backend API
participant Transactions Route
participant Transaction Detail Route

Cardholder->Frontend: Opens the app after login
Frontend->Dashboard Route: Navigate to /dashboard
Dashboard Route->Backend API: GET /api/metrics
Dashboard Route->Backend API: GET /api/spend/breakdown
Dashboard Route->Backend API: GET /api/transactions
Backend API-->Dashboard Route: Dashboard data
Dashboard Route-->Cardholder: Shows metrics, spend breakdown, and recent activity
Cardholder->Transactions Route: Opens /transactions and changes filters
Transactions Route->Backend API: GET /api/transactions with filters
Backend API-->Transactions Route: Matching paginated transactions
Transactions Route-->Cardholder: Shows filtered activity feed
Cardholder->Transaction Detail Route: Opens /transactions/:transactionId
Transaction Detail Route->Backend API: GET /api/transactions/:id
Backend API-->Transaction Detail Route: Transaction detail
Transaction Detail Route-->Cardholder: Shows merchant, amount, status, and timing
```

### Terminology and components

1. Route means a React Router screen that owns URL state and page layout.
2. Query hook means a small wrapper around React Query for one backend endpoint.
3. API client means the typed fetch layer used by query hooks.
4. View component means a reusable presentational component.
5. Server state means data owned by the backend and cached by React Query.

### Frontend layers

1. `routes` contains React Router route components.
2. `api` contains typed fetch functions for backend endpoints.
3. `queries` contains React Query hooks and query keys.
4. `components` contains page sections and reusable UI.
5. `components/ui` contains shadcn generated primitives.
6. `lib` contains formatting helpers, date helpers, and shared utilities.

### Hard and soft dependencies

1. Backend API is a hard dependency for real dashboard data.
2. React Query is a hard dependency for fetching, caching, retries, and refresh state.
3. React Router is a hard dependency for navigation and URL parameters.
4. shadcn and Tailwind are soft dependencies at runtime because they shape the UI but do not own business logic.

### Algorithm or pseudo code for main components

Dashboard page:

```text
Read current route
Start metrics query
Start spend breakdown query
Start transactions query
Render skeletons while first data loads
Render cards, chart, and activity table after data arrives
Show inline error states if one query fails
Refetch in the background to keep webhook driven data fresh
```

Transactions page:

```text
Read search params for page, category, status, and date range
Build a stable React Query key from those params
Fetch paginated transactions
Render filters and table
Update the URL when filters change
Keep previous data visible while the next page loads
```

### Service guarantees that you expect

1. Dashboard views should not show data from another cardholder.
2. Query keys must include all filter and route parameters.
3. Loading, empty, and error states should be visible and human friendly.
4. Background refetching should update the view without forcing a full page reload.
5. The UI should remain useful if metrics load but transactions fail, or the reverse.

### Data definition and frontend types

`DashboardMetrics`

1. `totalSpend`
2. `transactionCount`
3. `averageTransactionAmount`
4. `latestActivityAt`
5. `currency`

`SpendBreakdownItem`

1. `merchantCategory`
2. `amount`
3. `currency`
4. `percentage`

`Transaction`

1. `id`
2. `amount`
3. `currency`
4. `merchantName`
5. `merchantCategory`
6. `status`
7. `authorizedAt`
8. `postedAt`

`PaginatedTransactions`

1. `items`
2. `page`
3. `pageSize`
4. `total`

## Routes

### `/`

Redirects authenticated users to `/dashboard`. If auth is not ready, it shows a simple loading screen.

### `/dashboard`

Main cardholder landing page. It shows metrics, spend breakdown, recent transactions, freshness text, and a quick link to the full activity feed.

Queries used:

1. `metricsQuery`
2. `spendBreakdownQuery`
3. `recentTransactionsQuery`

Backend endpoints used:

1. `GET /api/metrics`
2. `GET /api/spend/breakdown`
3. `GET /api/transactions`

### `/transactions`

Full activity feed. It supports pagination, merchant search, category filter, status filter, and date range filter using URL search params.

Queries used:

1. `transactionsQuery`

Backend endpoint used:

1. `GET /api/transactions`

### `/transactions/:transactionId`

Transaction detail page. It shows merchant name, amount, status, category, authorization time, posted time, and any available card metadata.

Queries used:

1. `transactionDetailQuery`

Backend endpoint used:

1. `GET /api/transactions/:id`

### `/settings`

Small placeholder route for dashboard preferences such as refresh interval and display currency. It is not required for the first live demo, but it gives the app a natural place for future user preferences.

## shadcn Components

Use these shadcn components for the first version.

1. `Card` for metric cards and page sections.
2. `Table` for the transaction feed.
3. `Badge` for transaction status and merchant category.
4. `Skeleton` for loading states.
5. `Tabs` for switching between overview sections if the screen gets tight.
6. `Button` for refresh, pagination, and filter actions.
7. `Separator` for light visual grouping.
8. `Input` for merchant search.
9. `Select` for category and status filters.
10. `Calendar` for date range selection.
11. `DropdownMenu` for row actions and compact controls.
12. `Sheet` for transaction detail on smaller screens.
13. `Tooltip` for explaining metrics and freshness.
14. `Sonner` for small success or error notifications.
15. `Chart` for the spend breakdown visualization.
16. `Pagination` for the transaction list.

Install command verified through the shadcn MCP registry helper:

```text
npx shadcn@latest add @shadcn/card @shadcn/table @shadcn/badge @shadcn/skeleton @shadcn/tabs @shadcn/button @shadcn/separator @shadcn/input @shadcn/calendar @shadcn/dropdown-menu @shadcn/select @shadcn/sheet @shadcn/tooltip @shadcn/sonner @shadcn/chart @shadcn/pagination
```

## React Query Plan

Use one query key factory so keys stay consistent.

1. `dashboardKeys.metrics()`
2. `dashboardKeys.spendBreakdown(filters)`
3. `dashboardKeys.transactions(filters)`
4. `dashboardKeys.transaction(id)`

Freshness settings should be simple.

1. Metrics and spend breakdown can be stale after 30 seconds.
2. Recent transactions can be stale after 15 seconds.
3. Full transaction pages can keep previous data during pagination.
4. Detail pages can refetch when the browser window regains focus.

## Styling

Tailwind handles layout, spacing, responsive behavior, and small visual states. shadcn handles accessible primitives and consistent component styling.

The layout should be calm and readable:

1. Summary cards at the top.
2. Spend breakdown beside or below the summary, depending on screen size.
3. Activity feed as the main lower section.
4. Clear empty states when there is no spend yet.

## Observability

Frontend observability should stay lightweight.

1. Track route level errors through React Router error boundaries.
2. Log failed API requests with route name, query key, status code, and request id when available.
3. Show user friendly error states instead of blank screens.
4. Measure page load time for `/dashboard`.
5. Measure query error rate and query latency in the API client.

## Performance requirements

1. The dashboard should show useful loading skeletons immediately.
2. Data fetching should run in parallel on `/dashboard`.
3. The transaction table should paginate instead of rendering everything.
4. Expensive formatting should be kept in small helpers.
5. The app should avoid unnecessary global state.

## Security

1. Do not store Stripe secrets in the frontend.
2. Do not call Stripe directly from the browser.
3. Treat all backend responses as cardholder scoped.
4. Avoid logging raw transaction payloads in the browser.
5. Keep authentication tokens in the existing secure auth mechanism.

## API Endpoints Used

### `GET /api/metrics`

Used by `/dashboard` to render summary cards.

React Query hook:

1. `useMetricsQuery`

Expected response fields:

1. `totalSpend`
2. `transactionCount`
3. `averageTransactionAmount`
4. `latestActivityAt`
5. `currency`

View usage:

1. Metric cards show spend, count, average amount, and freshness.
2. Tooltip explains when the backend last saw card activity.

### `GET /api/spend/breakdown`

Used by `/dashboard` to render category spend.

React Query hook:

1. `useSpendBreakdownQuery`

Supported query params:

1. `from`
2. `to`

Expected response fields:

1. `merchantCategory`
2. `amount`
3. `currency`
4. `percentage`

View usage:

1. Chart shows category totals.
2. Category list shows the amount and percentage for each merchant category.

### `GET /api/transactions`

Used by `/dashboard` for recent activity and by `/transactions` for the full paginated feed.

React Query hooks:

1. `useRecentTransactionsQuery`
2. `useTransactionsQuery`

Supported query params:

1. `page`
2. `pageSize`
3. `merchant`
4. `merchantCategory`
5. `status`
6. `from`
7. `to`

Expected response fields:

1. `items`
2. `page`
3. `pageSize`
4. `total`

Each item includes:

1. `id`
2. `amount`
3. `currency`
4. `merchantName`
5. `merchantCategory`
6. `status`
7. `authorizedAt`
8. `postedAt`

View usage:

1. Dashboard shows the newest few transactions.
2. Transactions page shows the full paginated table.

### `GET /api/transactions/:id`

Used by `/transactions/:transactionId` and by the mobile detail sheet.

React Query hook:

1. `useTransactionDetailQuery`

Route parameter:

1. `transactionId`

Expected response fields:

1. `id`
2. `amount`
3. `currency`
4. `merchantName`
5. `merchantCategory`
6. `status`
7. `authorizedAt`
8. `postedAt`

View usage:

1. Detail page shows one transaction if it belongs to the authenticated cardholder.
2. Sheet shows the same detail on smaller screens.

## Rollout Plan

1. Create the Vite React Typescript app.
2. Configure React Router routes.
3. Configure Tailwind and shadcn.
4. Add React Query provider and API client.
5. Build dashboard page with mocked API responses.
6. Connect to backend endpoints.
7. Add Vitest coverage for query hooks and route rendering.
8. Polish loading, empty, and error states.

## Test Plan

Use Vitest with React Testing Library.

1. Dashboard renders metrics, breakdown, and recent activity from mocked API responses.
2. Dashboard shows skeletons while queries are loading.
3. Dashboard shows partial error states when one query fails.
4. Transactions page writes filters to URL search params.
5. Transactions page keeps previous data during pagination.
6. Transaction detail route loads by `transactionId`.
7. Query keys include filters and ids.
8. Empty states are shown when there is no activity.

## Appendix

1. Challenge: `Challenge.md`
2. Backend design: `docs/Backend.md`
3. React Router SPA docs: https://reactrouter.com/7.15.1/how-to/spa
4. React Router Backend for Frontend docs: https://reactrouter.com/7.15.1/explanation/backend-for-frontend
5. React Query docs: https://tanstack.com/query
6. shadcn Vite docs: https://ui.shadcn.com/docs/installation/vite
7. Sequence diagram tool: https://sequencediagram.org/
