import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../app';
import {
  clearDefaultCardholderId,
  setDefaultCardholderId,
} from '../test/cardholder-context';
import { resetDatabase, seedDashboardFixtures } from '../test/database';

describe('dashboard routes', () => {
  beforeEach(async () => {
    clearDefaultCardholderId();
    await resetDatabase();
  });

  afterEach(() => {
    clearDefaultCardholderId();
  });

  it('returns empty metrics when cardholder context is missing', async () => {
    await seedDashboardFixtures();

    const response = await request(createApp()).get('/api/metrics');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalSpend: 0,
      transactionCount: 0,
      averageTransactionAmount: 0,
      latestActivityAt: null,
      currency: 'usd',
    });
  });

  it('validates transaction query params', async () => {
    const response = await request(createApp()).get(
      '/api/transactions?page=invalid',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid request payload' });
  });

  it('returns empty transactions when cardholder context is missing', async () => {
    await seedDashboardFixtures();

    const response = await request(createApp()).get('/api/transactions');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
    });
  });

  it('ignores x-cardholder-id request headers', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp())
      .get('/api/metrics')
      .set('x-cardholder-id', '00000000-0000-0000-0000-000000000099');

    expect(response.status).toBe(200);
    expect(response.body.totalSpend).toBe(396.5);
  });
});

describe('dashboard metrics and spend routes integration', () => {
  beforeEach(async () => {
    clearDefaultCardholderId();
    await resetDatabase();
  });

  afterEach(() => {
    clearDefaultCardholderId();
  });

  it('returns metrics for the authenticated cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp()).get('/api/metrics');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      totalSpend: 396.5,
      transactionCount: 2,
      averageTransactionAmount: 198.25,
      latestActivityAt: '2026-05-31T09:00:00.000Z',
      currency: 'usd',
    });
  });

  it('returns spend breakdown grouped by merchant category', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp()).get('/api/spend/breakdown');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      merchantCategory: 'travel',
      amount: 312,
      currency: 'usd',
    });
    expect(response.body[1]).toMatchObject({
      merchantCategory: 'restaurants',
      amount: 84.5,
      currency: 'usd',
    });
  });

  it('filters spend breakdown by date range', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp())
      .get('/api/spend/breakdown')
      .query({
        from: '2026-05-30T00:00:00.000Z',
        to: '2026-05-30T23:59:59.999Z',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        merchantCategory: 'travel',
        amount: 312,
        currency: 'usd',
        percentage: 100,
      },
    ]);
  });

  it('returns empty spend breakdown when cardholder context is missing', async () => {
    await seedDashboardFixtures();

    const response = await request(createApp()).get('/api/spend/breakdown');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe('dashboard transaction routes integration', () => {
  beforeEach(async () => {
    clearDefaultCardholderId();
    await resetDatabase();
  });

  afterEach(() => {
    clearDefaultCardholderId();
  });

  it('returns paginated transactions for the authenticated cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp()).get('/api/transactions').query({
      page: 1,
      pageSize: 8,
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(4);
    expect(response.body.items).toHaveLength(4);
    expect(response.body.items[0].merchantName).toBe('Blue Bottle Coffee');
  });

  it('filters transactions by merchant, category, status, and date range', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp())
      .get('/api/transactions')
      .query({
        page: 1,
        pageSize: 8,
        merchant: 'United',
        merchantCategory: ['travel'],
        status: ['approved'],
        from: '2026-05-30T00:00:00.000Z',
        to: '2026-05-31T23:59:59.999Z',
      });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].merchantName).toBe('United Airlines');
  });

  it('does not return transactions from another cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp()).get('/api/transactions');

    expect(response.status).toBe(200);
    expect(
      response.body.items.every(
        (item: { merchantName: string }) =>
          item.merchantName !== 'Other Merchant',
      ),
    ).toBe(true);
  });

  it('returns 404 when transaction detail is missing', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp()).get(
      '/api/transactions/550e8400-e29b-41d4-a716-446655440000',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Transaction 550e8400-e29b-41d4-a716-446655440000 was not found',
    });
  });

  it('returns one transaction for the authenticated cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp()).get(
      `/api/transactions/${fixtures.transactions.blueBottle.id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: fixtures.transactions.blueBottle.id,
      amount: 84.5,
      currency: 'usd',
      merchantName: 'Blue Bottle Coffee',
      merchantCategory: 'restaurants',
      status: 'approved',
      authorizedAt: '2026-05-31T08:00:00.000Z',
      postedAt: '2026-05-31T09:00:00.000Z',
    });
  });

  it('returns 404 when transaction belongs to another cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId('00000000-0000-0000-0000-000000000099');

    const response = await request(createApp()).get(
      `/api/transactions/${fixtures.transactions.blueBottle.id}`,
    );

    expect(response.status).toBe(404);
  });
});
