import { filterMockTransactions } from './mock-filter-transactions';
import {
  fakeUser,
  merchantCategories,
  mockMetrics,
  mockSpendBreakdown,
  mockTransactions,
} from './mock-data';
import type {
  CardholderProfile,
  DashboardMetrics,
  MerchantCategoriesResponse,
  PaginatedTransactions,
  SpendBreakdownItem,
  Transaction,
  TransactionListQuery,
} from './types';

export const mockDashboardApi = {
  metrics: async (): Promise<DashboardMetrics> => mockMetrics,

  cardholder: async (): Promise<CardholderProfile> => ({
    id: '00000000-0000-0000-0000-000000000001',
    stripeCardholderId: 'ich_mock_cardholder',
    displayName: fakeUser.name,
    email: fakeUser.email,
    phoneNumber: null,
    status: 'active',
    memberSince: `${fakeUser.memberSince}T00:00:00.000Z`,
    primaryCard: {
      last4: fakeUser.cardLast4,
      brand: fakeUser.cardBrand,
      status: 'active',
    },
  }),

  merchantCategories: async (): Promise<MerchantCategoriesResponse> => ({
    items: merchantCategories.map((value) => ({
      value,
      hasTransactions: true,
    })),
  }),

  spendBreakdown: async (): Promise<SpendBreakdownItem[]> => mockSpendBreakdown,

  transactions: async (
    query: TransactionListQuery = {
      page: 1,
      pageSize: 20,
    },
  ): Promise<PaginatedTransactions> => filterMockTransactions(query),

  transaction: async (id: string): Promise<Transaction> => {
    const transaction = mockTransactions.find((txn) => txn.id === id);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  },
};
