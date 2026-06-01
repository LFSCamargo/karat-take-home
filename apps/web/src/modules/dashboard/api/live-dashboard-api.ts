import { requestJson } from './http-client';
import {
  buildSpendBreakdownQuery,
  buildTransactionsQuery,
} from './query-params';
import type {
  CardholderProfile,
  DashboardMetrics,
  MerchantCategoriesResponse,
  PaginatedTransactions,
  SpendBreakdownItem,
  SpendBreakdownQuery,
  Transaction,
  TransactionListQuery,
} from './types';

export const liveDashboardApi = {
  metrics: async (): Promise<DashboardMetrics> => requestJson('/api/metrics'),

  cardholder: async (): Promise<CardholderProfile> =>
    requestJson('/api/cardholder'),

  merchantCategories: async (): Promise<MerchantCategoriesResponse> =>
    requestJson('/api/merchant-categories'),

  spendBreakdown: async (
    query: SpendBreakdownQuery = {},
  ): Promise<SpendBreakdownItem[]> =>
    requestJson(`/api/spend/breakdown${buildSpendBreakdownQuery(query)}`),

  transactions: async (
    query: TransactionListQuery = {
      page: 1,
      pageSize: 20,
    },
  ): Promise<PaginatedTransactions> =>
    requestJson(`/api/transactions?${buildTransactionsQuery(query)}`),

  transaction: async (id: string): Promise<Transaction> =>
    requestJson(`/api/transactions/${id}`),
};
