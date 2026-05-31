import { dashboardEndpoints } from '@api/modules/dashboard/contracts/endpoints';
import type {
  DashboardMetrics,
  PaginatedTransactions,
  SpendBreakdownItem,
  Transaction,
} from '@api/modules/dashboard/contracts/dashboard.contract';

export type {
  DashboardMetrics,
  PaginatedTransactions,
  SpendBreakdownItem,
  Transaction,
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const dashboardApi = {
  metrics: () => getJson<DashboardMetrics>(dashboardEndpoints.metrics),
  spendBreakdown: () =>
    getJson<SpendBreakdownItem[]>(dashboardEndpoints.spendBreakdown),
  transactions: () =>
    getJson<PaginatedTransactions>(dashboardEndpoints.transactions),
  transaction: (id: string) =>
    getJson<Transaction>(dashboardEndpoints.transaction(id)),
};
