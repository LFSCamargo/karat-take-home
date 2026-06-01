import { sql, type Kysely } from 'kysely';

import type { Database } from '../../../db/schema';
import type { DashboardMetrics } from '../contracts/metrics.contract';
import type {
  SpendBreakdownItem,
  SpendBreakdownQuery,
} from '../contracts/spend-breakdown.contract';
import {
  activityTimestampExpression,
  APPROVED_TRANSACTION_STATUS,
  toIsoString,
} from '../utils/dashboard-sql';

type DatabaseClient = Kysely<Database>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

function emptyMetrics(): DashboardMetrics {
  return {
    totalSpend: 0,
    transactionCount: 0,
    averageTransactionAmount: 0,
    latestActivityAt: null,
    currency: 'usd',
  };
}

export async function getMetrics(
  db: DatabaseClient,
  cardholderId: string,
): Promise<DashboardMetrics> {
  if (!isUuid(cardholderId)) {
    return emptyMetrics();
  }

  const metrics = await db
    .selectFrom('transactions')
    .where('transactions.cardholder_id', '=', cardholderId)
    .select([
      sql<number>`coalesce(sum(transactions.amount) filter (where transactions.status = ${APPROVED_TRANSACTION_STATUS}), 0)::numeric / 100`.as(
        'total_spend',
      ),
      sql<number>`count(*) filter (where transactions.status = ${APPROVED_TRANSACTION_STATUS})`.as(
        'transaction_count',
      ),
      sql<number>`coalesce(avg(transactions.amount) filter (where transactions.status = ${APPROVED_TRANSACTION_STATUS}), 0)::numeric / 100`.as(
        'average_transaction_amount',
      ),
      sql<string>`max(transactions.currency) filter (where transactions.status = ${APPROVED_TRANSACTION_STATUS})`.as(
        'currency',
      ),
      sql<Date | null>`max(${activityTimestampExpression()})`.as(
        'latest_activity_at',
      ),
    ])
    .executeTakeFirst();

  return {
    totalSpend: Number(metrics?.total_spend ?? 0),
    transactionCount: Number(metrics?.transaction_count ?? 0),
    averageTransactionAmount: Number(metrics?.average_transaction_amount ?? 0),
    latestActivityAt: toIsoString(metrics?.latest_activity_at ?? null),
    currency: metrics?.currency ?? 'usd',
  };
}

export async function getSpendBreakdown(
  db: DatabaseClient,
  cardholderId: string,
  query: SpendBreakdownQuery,
): Promise<SpendBreakdownItem[]> {
  if (!isUuid(cardholderId)) {
    return [];
  }

  const rows = await sql<{
    merchant_category: string;
    currency: string;
    amount: string;
    percentage: string;
  }>`
    with category_totals as (
      select
        merchant_category,
        currency,
        sum(amount) as total_amount_cents
      from transactions
      where cardholder_id = ${cardholderId}
        and status = ${APPROVED_TRANSACTION_STATUS}
        ${
          query.from
            ? sql`and coalesce(posted_at, authorized_at) >= ${new Date(query.from)}`
            : sql``
        }
        ${
          query.to
            ? sql`and coalesce(posted_at, authorized_at) <= ${new Date(query.to)}`
            : sql``
        }
      group by merchant_category, currency
    )
    select
      merchant_category,
      currency,
      total_amount_cents::numeric / 100 as amount,
      case
        when sum(total_amount_cents) over () = 0 then 0
        else (total_amount_cents::numeric / sum(total_amount_cents) over ()) * 100
      end as percentage
    from category_totals
    order by total_amount_cents desc
  `.execute(db);

  return rows.rows.map((row) => ({
    merchantCategory: row.merchant_category,
    amount: Number(row.amount),
    currency: row.currency,
    percentage: Number(row.percentage),
  }));
}
