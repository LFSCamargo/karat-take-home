import { z } from 'zod';

export const dashboardMetricsSchema = z.object({
  totalSpend: z.number(),
  transactionCount: z.number().int(),
  averageTransactionAmount: z.number(),
  latestActivityAt: z.string().datetime().nullable(),
  currency: z.string(),
});

export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
