import { publicEnv } from '../../../env';

import { liveDashboardApi } from './live-dashboard-api';
import { mockDashboardApi } from './mock-dashboard-api';

export type {
  CardholderProfile,
  DashboardMetrics,
  MerchantCategoriesResponse,
  MerchantCategoryOption,
  PaginatedTransactions,
  SpendBreakdownItem,
  Transaction,
  TransactionListQuery,
  TransactionsQuery,
  SpendBreakdownQuery,
} from './types';

export const dashboardApi = publicEnv.useMockData
  ? mockDashboardApi
  : liveDashboardApi;
