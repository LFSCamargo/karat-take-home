import { beforeEach, describe, expect, it } from 'vitest';

import {
  resetDatabase,
  seedDashboardFixtures,
} from '../../../../test/database';
import { getMetrics, getSpendBreakdown } from '../dashboard.repository';

describe('dashboard repository integration', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('calculates metrics from approved transactions for a cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const metrics = await getMetrics(getDb(), fixtures.cardholder.id);

    expect(metrics).toEqual({
      totalSpend: 396.5,
      transactionCount: 2,
      averageTransactionAmount: 198.25,
      latestActivityAt: '2026-05-31T09:00:00.000Z',
      currency: 'usd',
    });
  });

  it('returns empty metrics for an invalid cardholder id', async () => {
    const { getDb } = await import('../../../../db/client');

    const metrics = await getMetrics(getDb(), 'not-a-uuid');

    expect(metrics).toEqual({
      totalSpend: 0,
      transactionCount: 0,
      averageTransactionAmount: 0,
      latestActivityAt: null,
      currency: 'usd',
    });
  });

  it('groups approved spend by merchant category with percentages', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const breakdown = await getSpendBreakdown(
      getDb(),
      fixtures.cardholder.id,
      {},
    );

    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]).toEqual({
      merchantCategory: 'travel',
      amount: 312,
      currency: 'usd',
      percentage: (312 / 396.5) * 100,
    });
    expect(breakdown[1]).toMatchObject({
      merchantCategory: 'restaurants',
      amount: 84.5,
      currency: 'usd',
    });
    expect(breakdown[1]?.percentage).toBeCloseTo((84.5 / 396.5) * 100, 10);
  });

  it('filters spend breakdown by activity date range', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const breakdown = await getSpendBreakdown(getDb(), fixtures.cardholder.id, {
      from: '2026-05-30T00:00:00.000Z',
      to: '2026-05-30T23:59:59.999Z',
    });

    expect(breakdown).toEqual([
      {
        merchantCategory: 'travel',
        amount: 312,
        currency: 'usd',
        percentage: 100,
      },
    ]);
  });

  it('does not include another cardholder spend in metrics or breakdown', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const metrics = await getMetrics(
      getDb(),
      '00000000-0000-0000-0000-000000000099',
    );
    const breakdown = await getSpendBreakdown(
      getDb(),
      '00000000-0000-0000-0000-000000000099',
      {},
    );

    expect(metrics.transactionCount).toBe(0);
    expect(breakdown).toEqual([]);
    expect(fixtures.cardholder.id).not.toBe(
      '00000000-0000-0000-0000-000000000099',
    );
  });
});
