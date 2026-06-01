import type { Express } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../../app';
import {
  clearDefaultCardholderId,
  setDefaultCardholderId,
} from '../../../test/cardholder-context';
import { resetDatabase } from '../../../test/database';
import {
  buildAuthorizationEvent,
  buildTransactionEvent,
  WEBHOOK_TEST_SECRET,
} from '../../../test/stripe-webhook-fixtures';
import {
  getCardholderIdByExternalUserId,
  getTransactionIdByStripeTransactionId,
} from '../../../test/webhook-database';
import { postStripeWebhookEvent } from '../../../test/webhook-request';
import { resetStripeClientForTests } from '../stripe-client';

const PRIMARY_CARDHOLDER = 'ich_test_cardholder_001';
const OTHER_CARDHOLDER = 'ich_other_cardholder_001';

describe('stripe webhook to dashboard endpoints integration', () => {
  let app: Express;

  beforeEach(async () => {
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_TEST_SECRET;
    resetStripeClientForTests();
    clearDefaultCardholderId();
    await resetDatabase();
    app = createApp();
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    resetStripeClientForTests();
    clearDefaultCardholderId();
  });

  it('returns empty dashboard endpoints before webhooks and cardholder context', async () => {
    const [metrics, breakdown, transactions] = await Promise.all([
      request(app).get('/api/metrics'),
      request(app).get('/api/spend/breakdown'),
      request(app).get('/api/transactions'),
    ]);

    expect(metrics.status).toBe(401);
    expect(metrics.body).toEqual({ message: 'Unauthorized' });

    expect(breakdown.status).toBe(401);
    expect(breakdown.body).toEqual({ message: 'Unauthorized' });

    expect(transactions.status).toBe(401);
    expect(transactions.body).toEqual({ message: 'Unauthorized' });
  });

  it('updates all dashboard endpoints after issuing transaction webhooks arrive', async () => {
    const firstWebhook = await postStripeWebhookEvent(
      app,
      buildTransactionEvent(),
    );
    expect(firstWebhook.status).toBe(200);

    const cardholderId =
      await getCardholderIdByExternalUserId(PRIMARY_CARDHOLDER);
    setDefaultCardholderId(cardholderId);

    const firstTransactionId =
      await getTransactionIdByStripeTransactionId('ipi_test_001');

    const metricsAfterFirst = await request(app).get('/api/metrics');
    expect(metricsAfterFirst.status).toBe(200);
    expect(metricsAfterFirst.body).toEqual({
      totalSpend: 84.5,
      transactionCount: 1,
      averageTransactionAmount: 84.5,
      latestActivityAt: '2024-05-31T06:20:00.000Z',
      currency: 'usd',
    });

    const breakdownAfterFirst = await request(app).get('/api/spend/breakdown');
    expect(breakdownAfterFirst.status).toBe(200);
    expect(breakdownAfterFirst.body).toEqual([
      {
        merchantCategory: 'fast_food_restaurants',
        amount: 84.5,
        currency: 'usd',
        percentage: 100,
      },
    ]);

    const transactionsAfterFirst = await request(app).get('/api/transactions');
    expect(transactionsAfterFirst.status).toBe(200);
    expect(transactionsAfterFirst.body.total).toBe(1);
    expect(transactionsAfterFirst.body.items).toHaveLength(1);
    expect(transactionsAfterFirst.body.items[0]).toMatchObject({
      id: firstTransactionId,
      amount: 84.5,
      currency: 'usd',
      merchantName: 'Blue Bottle Coffee',
      merchantCategory: 'fast_food_restaurants',
      status: 'approved',
      authorizedAt: '2024-05-31T06:20:00.000Z',
      postedAt: '2024-05-31T06:20:00.000Z',
    });

    const detailAfterFirst = await request(app).get(
      `/api/transactions/${firstTransactionId}`,
    );
    expect(detailAfterFirst.status).toBe(200);
    expect(detailAfterFirst.body).toEqual(transactionsAfterFirst.body.items[0]);

    const secondWebhook = await postStripeWebhookEvent(
      app,
      buildTransactionEvent(
        {
          id: 'ipi_test_002',
          amount: 31_200,
          created: 1_717_132_800,
          merchant_data: {
            category: 'travel',
            name: 'United Airlines',
            network_id: '1234567890',
          },
        },
        { id: 'evt_txn_002' },
      ),
    );
    expect(secondWebhook.status).toBe(200);

    const secondTransactionId =
      await getTransactionIdByStripeTransactionId('ipi_test_002');

    const metricsAfterSecond = await request(app).get('/api/metrics');
    expect(metricsAfterSecond.status).toBe(200);
    expect(metricsAfterSecond.body).toEqual({
      totalSpend: 396.5,
      transactionCount: 2,
      averageTransactionAmount: 198.25,
      latestActivityAt: '2024-05-31T06:20:00.000Z',
      currency: 'usd',
    });

    const breakdownAfterSecond = await request(app).get('/api/spend/breakdown');
    expect(breakdownAfterSecond.status).toBe(200);
    expect(breakdownAfterSecond.body).toHaveLength(2);
    expect(breakdownAfterSecond.body[0]).toMatchObject({
      merchantCategory: 'travel',
      amount: 312,
      currency: 'usd',
    });
    expect(breakdownAfterSecond.body[1]).toMatchObject({
      merchantCategory: 'fast_food_restaurants',
      amount: 84.5,
      currency: 'usd',
    });

    const transactionsAfterSecond = await request(app).get('/api/transactions');
    expect(transactionsAfterSecond.status).toBe(200);
    expect(transactionsAfterSecond.body.total).toBe(2);
    expect(
      transactionsAfterSecond.body.items.map((item: { id: string }) => item.id),
    ).toEqual([firstTransactionId, secondTransactionId]);

    const detailAfterSecond = await request(app).get(
      `/api/transactions/${secondTransactionId}`,
    );
    expect(detailAfterSecond.status).toBe(200);
    expect(detailAfterSecond.body).toMatchObject({
      id: secondTransactionId,
      amount: 312,
      merchantName: 'United Airlines',
      merchantCategory: 'travel',
      status: 'approved',
    });
  });

  it('reflects issuing_transaction.updated webhooks across dashboard endpoints', async () => {
    await postStripeWebhookEvent(app, buildTransactionEvent());

    const cardholderId =
      await getCardholderIdByExternalUserId(PRIMARY_CARDHOLDER);
    setDefaultCardholderId(cardholderId);

    const transactionId =
      await getTransactionIdByStripeTransactionId('ipi_test_001');

    const updateWebhook = await postStripeWebhookEvent(
      app,
      buildTransactionEvent(
        {
          amount: 12_000,
          merchant_data: {
            category: 'software',
            name: 'Updated Merchant',
            network_id: '1234567890',
          },
        },
        {
          id: 'evt_txn_updated',
          type: 'issuing_transaction.updated',
        },
      ),
    );
    expect(updateWebhook.status).toBe(200);

    const metrics = await request(app).get('/api/metrics');
    expect(metrics.body).toMatchObject({
      totalSpend: 120,
      transactionCount: 1,
      averageTransactionAmount: 120,
    });

    const breakdown = await request(app).get('/api/spend/breakdown');
    expect(breakdown.body).toEqual([
      {
        merchantCategory: 'software',
        amount: 120,
        currency: 'usd',
        percentage: 100,
      },
    ]);

    const detail = await request(app).get(`/api/transactions/${transactionId}`);
    expect(detail.body).toMatchObject({
      amount: 120,
      merchantName: 'Updated Merchant',
      merchantCategory: 'software',
    });
  });

  it('does not expose webhook data across cardholder contexts', async () => {
    await postStripeWebhookEvent(app, buildTransactionEvent());
    await postStripeWebhookEvent(
      app,
      buildTransactionEvent(
        {
          id: 'ipi_other_001',
          amount: 9_999,
          card: 'ic_other_card_001',
          cardholder: OTHER_CARDHOLDER,
          merchant_data: {
            category: 'groceries',
            name: 'Other Merchant',
            network_id: '9999999999',
          },
        },
        { id: 'evt_other_txn_001' },
      ),
    );

    const cardholderId =
      await getCardholderIdByExternalUserId(PRIMARY_CARDHOLDER);
    setDefaultCardholderId(cardholderId);

    const metrics = await request(app).get('/api/metrics');
    expect(metrics.body).toMatchObject({
      totalSpend: 84.5,
      transactionCount: 1,
    });

    const transactions = await request(app).get('/api/transactions');
    expect(transactions.body.total).toBe(1);
    expect(transactions.body.items[0].merchantName).toBe('Blue Bottle Coffee');

    const otherTransactionId =
      await getTransactionIdByStripeTransactionId('ipi_other_001');
    const detail = await request(app).get(
      `/api/transactions/${otherTransactionId}`,
    );
    expect(detail.status).toBe(404);
  });

  it('stores authorization webhooks without changing transaction dashboard endpoints', async () => {
    const authorizationWebhook = await postStripeWebhookEvent(
      app,
      buildAuthorizationEvent(),
    );
    expect(authorizationWebhook.status).toBe(200);

    const cardholderId =
      await getCardholderIdByExternalUserId(PRIMARY_CARDHOLDER);
    setDefaultCardholderId(cardholderId);

    const [metrics, breakdown, transactions] = await Promise.all([
      request(app).get('/api/metrics'),
      request(app).get('/api/spend/breakdown'),
      request(app).get('/api/transactions'),
    ]);

    expect(metrics.body).toMatchObject({
      totalSpend: 0,
      transactionCount: 0,
    });
    expect(breakdown.body).toEqual([]);
    expect(transactions.body.total).toBe(0);

    const transactionWebhook = await postStripeWebhookEvent(
      app,
      buildTransactionEvent(),
    );
    expect(transactionWebhook.status).toBe(200);

    const metricsAfterTransaction = await request(app).get('/api/metrics');
    expect(metricsAfterTransaction.body).toMatchObject({
      totalSpend: 84.5,
      transactionCount: 1,
    });

    const transactionsAfterTransaction =
      await request(app).get('/api/transactions');
    expect(transactionsAfterTransaction.body.total).toBe(1);
  });
});
