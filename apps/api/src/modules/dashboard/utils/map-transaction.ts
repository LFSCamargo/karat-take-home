import type { TransactionRecord } from '../../../db/schema';
import type { Transaction } from '../contracts/transactions.contract';

function toIsoString(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

export function mapTransactionRecord(record: TransactionRecord): Transaction {
  return {
    id: record.id,
    amount: Number(record.amount) / 100,
    currency: record.currency,
    merchantName: record.merchant_name,
    merchantCategory: record.merchant_category,
    status: record.status,
    authorizedAt: toIsoString(record.authorized_at),
    postedAt: toIsoString(record.posted_at),
  };
}
