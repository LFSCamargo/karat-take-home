import { z } from 'zod';

export const merchantCategoryOptionSchema = z.object({
  value: z.string(),
  hasTransactions: z.boolean(),
});

export const merchantCategoriesResponseSchema = z.object({
  items: z.array(merchantCategoryOptionSchema),
});

export type MerchantCategoryOption = z.infer<
  typeof merchantCategoryOptionSchema
>;
export type MerchantCategoriesResponse = z.infer<
  typeof merchantCategoriesResponseSchema
>;
