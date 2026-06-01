import type {
  DashboardMetrics,
  PaginatedTransactions,
  SpendBreakdownItem,
  Transaction,
  TransactionsQuery,
} from '@api/modules/dashboard/contracts';

import { mockMetrics, mockSpendBreakdown, mockTransactions } from './mock-data';

export type {
  DashboardMetrics,
  PaginatedTransactions,
  SpendBreakdownItem,
  Transaction,
  TransactionsQuery,
};

export type SpendBreakdownQuery = {
  from?: string;
  to?: string;
};

export type TransactionListQuery = TransactionsQuery & {
  merchantCategories?: string[];
  statuses?: string[];
};

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

function filterTransactions(
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

  const categories =
    query.merchantCategories ??
    (query.merchantCategory ? [query.merchantCategory] : []);

  if (categories.length > 0) {
    filtered = filtered.filter((txn) =>
      categories.includes(txn.merchantCategory),
    );
  }

  const statuses = query.statuses ?? (query.status ? [query.status] : []);

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

export const dashboardApi = {
  metrics: async (): Promise<DashboardMetrics> => mockMetrics,

  spendBreakdown: async (): Promise<SpendBreakdownItem[]> => mockSpendBreakdown,

  transactions: async (
    query: TransactionListQuery = {
      page: 1,
      pageSize: 20,
    },
  ): Promise<PaginatedTransactions> => filterTransactions(query),

  transaction: async (id: string): Promise<Transaction> => {
    const transaction = mockTransactions.find((txn) => txn.id === id);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  },
};
