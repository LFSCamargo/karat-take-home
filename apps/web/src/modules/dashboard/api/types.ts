export type {
  CardholderProfile,
  DashboardMetrics,
  MerchantCategoriesResponse,
  MerchantCategoryOption,
  PaginatedTransactions,
  SpendBreakdownItem,
  Transaction,
  TransactionsQuery,
} from '@api/modules/dashboard/contracts';

export type SpendBreakdownQuery = {
  from?: string;
  to?: string;
};

export type TransactionListQuery = {
  page: number;
  pageSize: number;
  merchant?: string;
  merchantCategory?: string | string[];
  merchantCategories?: string[];
  status?: string | string[];
  statuses?: string[];
  from?: string;
  to?: string;
};
