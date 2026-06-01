import { useQuery } from '@tanstack/react-query';

import type {
  SpendBreakdownQuery,
  TransactionListQuery,
} from '../api/api-client';
import { dashboardApi } from '../api/api-client';

export const dashboardKeys = {
  metrics: () => ['dashboard', 'metrics'] as const,
  cardholder: () => ['dashboard', 'cardholder'] as const,
  merchantCategories: () => ['dashboard', 'merchant-categories'] as const,
  spendBreakdown: (filters: SpendBreakdownQuery = {}) =>
    ['dashboard', 'spend-breakdown', filters] as const,
  transactions: (filters: TransactionListQuery = { page: 1, pageSize: 20 }) =>
    ['dashboard', 'transactions', filters] as const,
  transaction: (id: string) => ['dashboard', 'transactions', id] as const,
};

export function useMetricsQuery() {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: dashboardApi.metrics,
    staleTime: 30_000,
  });
}

export function useCardholderQuery() {
  return useQuery({
    queryKey: dashboardKeys.cardholder(),
    queryFn: dashboardApi.cardholder,
    staleTime: 60_000,
  });
}

export function useMerchantCategoriesQuery() {
  return useQuery({
    queryKey: dashboardKeys.merchantCategories(),
    queryFn: dashboardApi.merchantCategories,
    staleTime: 60_000,
  });
}

export function useSpendBreakdownQuery(filters: SpendBreakdownQuery = {}) {
  return useQuery({
    queryKey: dashboardKeys.spendBreakdown(filters),
    queryFn: () => dashboardApi.spendBreakdown(),
    staleTime: 30_000,
  });
}

export function useRecentTransactionsQuery() {
  return useQuery({
    queryKey: dashboardKeys.transactions({ page: 1, pageSize: 5 }),
    queryFn: () => dashboardApi.transactions({ page: 1, pageSize: 5 }),
    staleTime: 15_000,
  });
}

export function useTransactionsQuery(filters: TransactionListQuery) {
  return useQuery({
    queryKey: dashboardKeys.transactions(filters),
    queryFn: () => dashboardApi.transactions(filters),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}

export function useTransactionDetailQuery(id: string) {
  return useQuery({
    queryKey: dashboardKeys.transaction(id),
    queryFn: () => dashboardApi.transaction(id),
    enabled: Boolean(id),
    refetchOnWindowFocus: true,
  });
}
