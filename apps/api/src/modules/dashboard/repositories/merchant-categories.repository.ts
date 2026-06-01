import type { Kysely } from 'kysely';

import type { Database } from '../../../db/schema';
import { isUuid } from '../../../http/cardholder-id';
import { STRIPE_MERCHANT_CATEGORIES } from '../../stripe/constants/stripe-merchant-categories';
import type { MerchantCategoryOption } from '../contracts/merchant-categories.contract';

type DatabaseClient = Kysely<Database>;

export async function listMerchantCategoryOptions(
  db: DatabaseClient,
  cardholderId: string | undefined,
): Promise<MerchantCategoryOption[]> {
  const usedCategories = new Set<string>();

  if (cardholderId && isUuid(cardholderId)) {
    const rows = await db
      .selectFrom('transactions')
      .select('merchant_category')
      .distinct()
      .where('cardholder_id', '=', cardholderId)
      .execute();

    for (const row of rows) {
      usedCategories.add(row.merchant_category);
    }
  }

  const allCategories = new Set<string>([
    ...STRIPE_MERCHANT_CATEGORIES,
    ...usedCategories,
  ]);

  return [...allCategories]
    .sort((left, right) => {
      const leftUsed = usedCategories.has(left);
      const rightUsed = usedCategories.has(right);

      if (leftUsed !== rightUsed) {
        return leftUsed ? -1 : 1;
      }

      return left.localeCompare(right);
    })
    .map((value) => ({
      value,
      hasTransactions: usedCategories.has(value),
    }));
}
