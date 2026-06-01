import { beforeEach, describe, expect, it } from 'vitest';

import {
  resetDatabase,
  seedDashboardFixtures,
} from '../../../../test/database';
import {
  getTransactionById,
  listTransactions,
} from '../transactions.repository';

describe('transactions repository integration', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('lists transactions for a cardholder ordered by latest activity', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const result = await listTransactions(getDb(), fixtures.cardholder.id, {
      page: 1,
      pageSize: 10,
      merchantCategory: [],
      status: [],
    });

    expect(result.total).toBe(4);
    expect(result.items.map((item) => item.merchantName)).toEqual([
      'Blue Bottle Coffee',
      'United Airlines',
      'Marriott Hotels',
      'Apple Store',
    ]);
  });

  it('filters by merchant name, categories, statuses, and date range', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const result = await listTransactions(getDb(), fixtures.cardholder.id, {
      page: 1,
      pageSize: 10,
      merchant: 'marriott',
      merchantCategory: ['travel'],
      status: ['pending'],
      from: '2026-05-29T00:00:00.000Z',
      to: '2026-05-30T23:59:59.999Z',
    });

    expect(result.total).toBe(1);
    expect(result.items[0]?.merchantName).toBe('Marriott Hotels');
  });

  it('paginates transaction results', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const pageOne = await listTransactions(getDb(), fixtures.cardholder.id, {
      page: 1,
      pageSize: 2,
      merchantCategory: [],
      status: [],
    });
    const pageTwo = await listTransactions(getDb(), fixtures.cardholder.id, {
      page: 2,
      pageSize: 2,
      merchantCategory: [],
      status: [],
    });

    expect(pageOne.total).toBe(4);
    expect(pageOne.items).toHaveLength(2);
    expect(pageTwo.items).toHaveLength(2);
    expect(pageOne.items[0]?.id).not.toBe(pageTwo.items[0]?.id);
  });

  it('returns one transaction scoped to the cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const transaction = await getTransactionById(
      getDb(),
      fixtures.cardholder.id,
      fixtures.transactions.united.id,
    );

    expect(transaction).toEqual({
      id: fixtures.transactions.united.id,
      amount: 312,
      currency: 'usd',
      merchantName: 'United Airlines',
      merchantCategory: 'travel',
      status: 'approved',
      authorizedAt: '2026-05-30T14:00:00.000Z',
      postedAt: '2026-05-30T16:00:00.000Z',
    });
  });

  it('returns null for invalid transaction ids without querying postgres', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const transaction = await getTransactionById(
      getDb(),
      fixtures.cardholder.id,
      'does-not-exist',
    );

    expect(transaction).toBeNull();
  });

  it('returns null when the transaction belongs to another cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    const { getDb } = await import('../../../../db/client');

    const transaction = await getTransactionById(
      getDb(),
      '00000000-0000-0000-0000-000000000099',
      fixtures.transactions.blueBottle.id,
    );

    expect(transaction).toBeNull();
  });
});
