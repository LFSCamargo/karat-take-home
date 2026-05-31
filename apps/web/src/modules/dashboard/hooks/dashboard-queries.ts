import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '../api/api-client';

export const dashboardKeys = {
  metrics: () => ['dashboard', 'metrics'] as const,
  spendBreakdown: () => ['dashboard', 'spend-breakdown'] as const,
  transactions: () => ['dashboard', 'transactions'] as const,
  transaction: (id: string) => ['dashboard', 'transactions', id] as const,
};

export function useMetricsQuery() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: dashboardApi.metrics,
    staleTime: 30_000,
  });
}

export function useSpendBreakdownQuery() {
  return useQuery({
    queryKey: dashboardKeys.spendBreakdown(),
    queryFn: dashboardApi.spendBreakdown,
    staleTime: 30_000,
  });
}

export function useTransactionsQuery() {
  return useQuery({
    queryKey: dashboardKeys.transactions(),
    queryFn: dashboardApi.transactions,
    staleTime: 15_000,
  });
}

export function useTransactionDetailQuery(id: string) {
  return useQuery({
    queryKey: dashboardKeys.transaction(id),
    queryFn: () => dashboardApi.transaction(id),
  });
}
