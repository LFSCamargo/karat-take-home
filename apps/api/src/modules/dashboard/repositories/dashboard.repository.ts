import { type Kysely } from 'kysely';

import type { Database } from '../../../db/schema';
import type { DashboardMetrics } from '../contracts/metrics.contract';
import type {
  SpendBreakdownItem,
  SpendBreakdownQuery,
} from '../contracts/spend-breakdown.contract';
import {
  activityTimestampExpression,
  APPROVED_TRANSACTION_STATUS,
  centsToAmount,
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

  const approvedMetrics = await db
    .selectFrom('transactions')
    .where('transactions.cardholder_id', '=', cardholderId)
    .where('transactions.status', '=', APPROVED_TRANSACTION_STATUS)
    .select((eb) => [
      eb.fn.sum<number>('transactions.amount').as('total_amount'),
      eb.fn.countAll<number>().as('transaction_count'),
      eb.fn.max('transactions.currency').as('currency'),
    ])
    .executeTakeFirst();

  const latestActivity = await db
    .selectFrom('transactions')
    .where('transactions.cardholder_id', '=', cardholderId)
    .select((eb) =>
      eb.fn.max(activityTimestampExpression()).as('latest_activity_at'),
    )
    .executeTakeFirst();

  const transactionCount = Number(approvedMetrics?.transaction_count ?? 0);
  const totalSpend = centsToAmount(approvedMetrics?.total_amount);

  return {
    totalSpend,
    transactionCount,
    averageTransactionAmount:
      transactionCount > 0 ? totalSpend / transactionCount : 0,
    latestActivityAt: toIsoString(latestActivity?.latest_activity_at ?? null),
    currency: approvedMetrics?.currency ?? 'usd',
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

  let breakdownQuery = db
    .selectFrom('transactions')
    .where('transactions.cardholder_id', '=', cardholderId)
    .where('transactions.status', '=', APPROVED_TRANSACTION_STATUS);

  if (query.from) {
    breakdownQuery = breakdownQuery.where(
      activityTimestampExpression(),
      '>=',
      new Date(query.from),
    );
  }

  if (query.to) {
    breakdownQuery = breakdownQuery.where(
      activityTimestampExpression(),
      '<=',
      new Date(query.to),
    );
  }

  const rows = await breakdownQuery
    .select(['transactions.merchant_category', 'transactions.currency'])
    .select((eb) => eb.fn.sum<number>('transactions.amount').as('total_amount'))
    .groupBy(['transactions.merchant_category', 'transactions.currency'])
    .orderBy('total_amount', 'desc')
    .execute();

  const items = rows.map((row) => ({
    merchantCategory: row.merchant_category,
    amount: centsToAmount(row.total_amount),
    currency: row.currency,
    percentage: 0,
  }));

  const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);

  return items.map((item) => ({
    ...item,
    percentage: grandTotal > 0 ? (item.amount / grandTotal) * 100 : 0,
  }));
}
