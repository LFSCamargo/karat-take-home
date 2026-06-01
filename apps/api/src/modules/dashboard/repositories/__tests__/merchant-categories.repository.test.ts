import { beforeEach, describe, expect, it } from 'vitest';

import {
  resetDatabase,
  seedDashboardFixtures,
} from '../../../../test/database';
import { listMerchantCategoryOptions } from '../merchant-categories.repository';
import { getDb } from '../../../../db/client';

describe('merchant categories repository integration', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns all Stripe merchant categories with usage flags', async () => {
    const fixtures = await seedDashboardFixtures();

    const items = await listMerchantCategoryOptions(
      getDb(),
      fixtures.cardholder.id,
    );

    expect(items.length).toBeGreaterThan(200);
    expect(
      items.some((item) => item.value === 'travel' && item.hasTransactions),
    ).toBe(true);
    expect(
      items.some(
        (item) => item.value === 'restaurants' && item.hasTransactions,
      ),
    ).toBe(true);
    expect(
      items.find((item) => item.value === 'fast_food_restaurants')
        ?.hasTransactions,
    ).toBe(false);
  });

  it('returns Stripe categories without usage when cardholder context is missing', async () => {
    await seedDashboardFixtures();

    const items = await listMerchantCategoryOptions(getDb(), undefined);

    expect(items.length).toBeGreaterThan(200);
    expect(items.every((item) => item.hasTransactions === false)).toBe(true);
  });
});
