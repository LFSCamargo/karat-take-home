import { type Kysely, type SelectQueryBuilder } from 'kysely';

import type { Database } from '../../../db/schema';
import type {
  PaginatedTransactions,
  TransactionsQuery,
} from '../contracts/transactions.contract';
import { mapTransactionRecord } from '../utils/map-transaction';

type DatabaseClient = Kysely<Database>;
type TransactionQuery = SelectQueryBuilder<
  Database,
  'transactions',
  Record<string, never>
>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

import { activityTimestampExpression } from '../utils/dashboard-sql';

function applyTransactionFilters(
  query: TransactionQuery,
  filters: TransactionsQuery,
): TransactionQuery {
  let filtered = query;

  if (filters.merchant) {
    filtered = filtered.where(
      'transactions.merchant_name',
      'ilike',
      `%${filters.merchant}%`,
    );
  }

  if (filters.merchantCategory.length > 0) {
    filtered = filtered.where(
      'transactions.merchant_category',
      'in',
      filters.merchantCategory,
    );
  }

  if (filters.status.length > 0) {
    filtered = filtered.where('transactions.status', 'in', filters.status);
  }

  if (filters.from) {
    filtered = filtered.where(
      activityTimestampExpression(),
      '>=',
      new Date(filters.from),
    );
  }

  if (filters.to) {
    filtered = filtered.where(
      activityTimestampExpression(),
      '<=',
      new Date(filters.to),
    );
  }

  return filtered;
}

export async function listTransactions(
  db: DatabaseClient,
  cardholderId: string,
  query: TransactionsQuery,
): Promise<PaginatedTransactions> {
  const baseQuery = db
    .selectFrom('transactions')
    .where('transactions.cardholder_id', '=', cardholderId);

  const filteredQuery = applyTransactionFilters(baseQuery, query);

  const countResult = await filteredQuery
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow();

  const rows = await filteredQuery
    .selectAll('transactions')
    .orderBy(activityTimestampExpression(), 'desc')
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize)
    .execute();

  return {
    items: rows.map(mapTransactionRecord),
    page: query.page,
    pageSize: query.pageSize,
    total: Number(countResult.count),
  };
}

export async function getTransactionById(
  db: DatabaseClient,
  cardholderId: string,
  transactionId: string,
) {
  if (!isUuid(transactionId) || !isUuid(cardholderId)) {
    return null;
  }

  const row = await db
    .selectFrom('transactions')
    .selectAll()
    .where('id', '=', transactionId)
    .where('cardholder_id', '=', cardholderId)
    .executeTakeFirst();

  return row ? mapTransactionRecord(row) : null;
}
