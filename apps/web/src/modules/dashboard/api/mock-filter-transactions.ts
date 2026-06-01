import { mockTransactions } from './mock-data';
import { getMerchantCategories, getStatuses } from './query-params';
import type {
  PaginatedTransactions,
  Transaction,
  TransactionListQuery,
} from './types';

function parseDate(value: string | null): number | null {
  return value ? new Date(value).getTime() : null;
}

function filterByDateRange(
  transactions: Transaction[],
  from?: string,
  to?: string,
): Transaction[] {
  const fromTime = from ? new Date(from).getTime() : null;
  const toTime = to ? new Date(to).getTime() : null;

  return transactions.filter((txn) => {
    const activityTime =
      parseDate(txn.postedAt) ?? parseDate(txn.authorizedAt) ?? null;

    if (activityTime === null) {
      return false;
    }

    if (fromTime !== null && activityTime < fromTime) {
      return false;
    }

    if (toTime !== null && activityTime > toTime) {
      return false;
    }

    return true;
  });
}

export function filterMockTransactions(
  query: TransactionListQuery,
): PaginatedTransactions {
  let filtered = [...mockTransactions].sort((a, b) => {
    const aTime = parseDate(a.authorizedAt) ?? 0;
    const bTime = parseDate(b.authorizedAt) ?? 0;
    return bTime - aTime;
  });

  if (query.merchant) {
    const search = query.merchant.toLowerCase();
    filtered = filtered.filter((txn) =>
      txn.merchantName.toLowerCase().includes(search),
    );
  }

  const categories = getMerchantCategories(query);

  if (categories.length > 0) {
    filtered = filtered.filter((txn) =>
      categories.includes(txn.merchantCategory),
    );
  }

  const statuses = getStatuses(query);

  if (statuses.length > 0) {
    filtered = filtered.filter((txn) => statuses.includes(txn.status));
  }

  filtered = filterByDateRange(filtered, query.from, query.to);

  const total = filtered.length;
  const start = (query.page - 1) * query.pageSize;

  return {
    items: filtered.slice(start, start + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    total,
  };
}
