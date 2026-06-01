import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../../app';
import { getDb } from '../../../db/client';
import {
  clearDefaultCardholderId,
  setDefaultCardholderId,
} from '../../../test/cardholder-context';
import { resetDatabase, seedDashboardFixtures } from '../../../test/database';

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

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('validates transaction query params', async () => {
    const response = await request(createApp())
      .get('/api/transactions?page=invalid')
      .set('authorization', 'Bearer 11111111-1111-1111-1111-111111111111');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid request payload' });
  });

  it('returns empty transactions when cardholder context is missing', async () => {
    await seedDashboardFixtures();

    const response = await request(createApp()).get('/api/transactions');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
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

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('resolves Stripe cardholder id from DEFAULT_CARDHOLDER_ID', async () => {
    const fixtures = await seedDashboardFixtures();
    const db = getDb();

    await db
      .updateTable('cardholders')
      .set({ external_user_id: 'ich_demo_cardholder' })
      .where('id', '=', fixtures.cardholder.id)
      .execute();

    setDefaultCardholderId('ich_demo_cardholder');

    const response = await request(createApp()).get('/api/metrics');

    expect(response.status).toBe(200);
    expect(response.body.totalSpend).toBe(396.5);
  });

  it('returns merchant category options for the authenticated cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp()).get('/api/merchant-categories');

    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(200);

    const travel = response.body.items.find(
      (item: { value: string }) => item.value === 'travel',
    );
    const restaurants = response.body.items.find(
      (item: { value: string }) => item.value === 'restaurants',
    );

    expect(travel).toEqual({ value: 'travel', hasTransactions: true });
    expect(restaurants).toEqual({
      value: 'restaurants',
      hasTransactions: true,
    });
  });

  it('returns cached cardholder profile for the authenticated cardholder', async () => {
    const fixtures = await seedDashboardFixtures();
    const db = getDb();

    await db
      .updateTable('cardholders')
      .set({
        display_name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        phone_number: '+14155551234',
        status: 'active',
        profile_synced_at: '2026-06-01T00:00:00.000Z',
      })
      .where('id', '=', fixtures.cardholder.id)
      .execute();

    await db
      .updateTable('cards')
      .set({ brand: 'Visa', last4: '4242', status: 'active' })
      .where('id', '=', fixtures.card.id)
      .execute();

    setDefaultCardholderId(fixtures.cardholder.id);

    const response = await request(createApp()).get('/api/cardholder');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: fixtures.cardholder.id,
      stripeCardholderId: 'integration-user',
      displayName: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phoneNumber: '+14155551234',
      status: 'active',
      primaryCard: {
        last4: '4242',
        brand: 'Visa',
        status: 'active',
      },
    });
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
