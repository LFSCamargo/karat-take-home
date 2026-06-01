import { z } from 'zod';

export const transactionParamsSchema = z.object({
  id: z.string().min(1),
});

export type TransactionParams = z.infer<typeof transactionParamsSchema>;
