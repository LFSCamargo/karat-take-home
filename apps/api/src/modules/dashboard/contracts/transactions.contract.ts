import { z } from 'zod';

import { toStringArray } from '../utils/query-array';

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
  merchant: z.string().trim().optional(),
  merchantCategory: z
    .preprocess(toStringArray, z.array(z.string()))
    .default([]),
  status: z.preprocess(toStringArray, z.array(z.string())).default([]),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
});

export const paginatedTransactionsSchema = z.object({
  items: z.array(transactionSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
export type PaginatedTransactions = z.infer<typeof paginatedTransactionsSchema>;
