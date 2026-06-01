import { sql } from 'kysely';

export const APPROVED_TRANSACTION_STATUS = 'approved';

export function activityTimestampExpression() {
  return sql<Date>`coalesce(transactions.posted_at, transactions.authorized_at)`;
}

export function toIsoString(value: Date | string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

export function centsToAmount(
  value: string | number | bigint | null | undefined,
) {
  return Number(value ?? 0) / 100;
}
