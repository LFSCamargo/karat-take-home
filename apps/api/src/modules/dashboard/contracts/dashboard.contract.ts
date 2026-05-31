import { z } from 'zod';

export const dashboardMetricsSchema = z.object({
  totalSpend: z.number(),
  transactionCount: z.number().int(),
  averageTransactionAmount: z.number(),
  latestActivityAt: z.string().datetime().nullable(),
  currency: z.string(),
});

export const spendBreakdownQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const spendBreakdownItemSchema = z.object({
  merchantCategory: z.string(),
  amount: z.number(),
  currency: z.string(),
  percentage: z.number(),
});

export const transactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  merchantName: z.string(),
  merchantCategory: z.string(),
  status: z.string(),
  authorizedAt: z.string().datetime().nullable(),
  postedAt: z.string().datetime().nullable(),
});

export const transactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  merchant: z.string().optional(),
  merchantCategory: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const transactionParamsSchema = z.object({
  id: z.string().min(1),
});

export const paginatedTransactionsSchema = z.object({
  items: z.array(transactionSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const errorResponseSchema = z.object({
  message: z.string(),
});

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
export type SpendBreakdownQuery = z.infer<typeof spendBreakdownQuerySchema>;
export type SpendBreakdownItem = z.infer<typeof spendBreakdownItemSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
export type TransactionParams = z.infer<typeof transactionParamsSchema>;
export type PaginatedTransactions = z.infer<typeof paginatedTransactionsSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
