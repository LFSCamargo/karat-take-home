import { z } from 'zod';

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

export type SpendBreakdownQuery = z.infer<typeof spendBreakdownQuerySchema>;
export type SpendBreakdownItem = z.infer<typeof spendBreakdownItemSchema>;
