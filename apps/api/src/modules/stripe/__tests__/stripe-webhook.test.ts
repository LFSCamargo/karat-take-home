import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../../app';
import { getMetrics } from '../../dashboard/repositories/dashboard.repository';
import { countStripeEvents } from '../repositories/issuing-sync.repository';
import { resetStripeClientForTests } from '../stripe-client';
import { resetDatabase } from '../../../test/database';
import {
  buildAuthorizationEvent,
  buildTransactionEvent,
  WEBHOOK_TEST_SECRET,
} from '../../../test/stripe-webhook-fixtures';
import {
  postStripeWebhook,
  postStripeWebhookEvent,
} from '../../../test/webhook-request';

describe('stripe webhook route', () => {
  beforeEach(async () => {
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_TEST_SECRET;
    resetStripeClientForTests();
    await resetDatabase();
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    resetStripeClientForTests();
  });

  it('rejects invalid webhook signatures', async () => {
    const payload = JSON.stringify(buildAuthorizationEvent());

    const response = await postStripeWebhook(
      createApp(),
      payload,
      'invalid-signature',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Invalid Stripe webhook signature',
    });
  });

  it('stores issuing authorizations from signed webhooks', async () => {
    const response = await postStripeWebhookEvent(
      createApp(),
      buildAuthorizationEvent(),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ received: true });

    const { getDb } = await import('../../../db/client');
    const db = getDb();

    const authorization = await db
      .selectFrom('authorizations')
      .selectAll()
      .where('stripe_authorization_id', '=', 'iauth_test_001')
      .executeTakeFirst();

    expect(authorization).toMatchObject({
      amount: '8450',
      currency: 'usd',
      merchant_name: 'Blue Bottle Coffee',
      merchant_category: 'fast_food_restaurants',
      status: 'pending',
    });
    expect(await countStripeEvents(db)).toBe(1);
  });

  it('ignores duplicate stripe events', async () => {
    await postStripeWebhookEvent(createApp(), buildAuthorizationEvent());
    const secondResponse = await postStripeWebhookEvent(
      createApp(),
      buildAuthorizationEvent(),
    );

    expect(secondResponse.status).toBe(200);

    const { getDb } = await import('../../../db/client');
    const db = getDb();

    const authorizations = await db
      .selectFrom('authorizations')
      .selectAll()
      .execute();

    expect(authorizations).toHaveLength(1);
    expect(await countStripeEvents(db)).toBe(1);
  });

  it('stores issuing transactions and updates dashboard metrics', async () => {
    const response = await postStripeWebhookEvent(
      createApp(),
      buildTransactionEvent(),
    );

    expect(response.status).toBe(200);

    const { getDb } = await import('../../../db/client');
    const db = getDb();

    const cardholder = await db
      .selectFrom('cardholders')
      .selectAll()
      .where('external_user_id', '=', 'ich_test_cardholder_001')
      .executeTakeFirstOrThrow();

    const transaction = await db
      .selectFrom('transactions')
      .selectAll()
      .where('stripe_transaction_id', '=', 'ipi_test_001')
      .executeTakeFirst();

    expect(transaction).toMatchObject({
      cardholder_id: cardholder.id,
      amount: '8450',
      currency: 'usd',
      merchant_name: 'Blue Bottle Coffee',
      merchant_category: 'fast_food_restaurants',
      status: 'approved',
    });

    const metrics = await getMetrics(db, cardholder.id);

    expect(metrics).toMatchObject({
      totalSpend: 84.5,
      transactionCount: 1,
      averageTransactionAmount: 84.5,
      currency: 'usd',
    });
  });

  it('upserts updated issuing authorizations by stripe object id', async () => {
    await postStripeWebhookEvent(createApp(), buildAuthorizationEvent());

    const updatedEvent = buildAuthorizationEvent({
      status: 'closed',
      approved: true,
    });
    updatedEvent.id = 'evt_auth_002';
    updatedEvent.type = 'issuing_authorization.updated';

    const response = await postStripeWebhookEvent(createApp(), updatedEvent);

    expect(response.status).toBe(200);

    const { getDb } = await import('../../../db/client');
    const db = getDb();

    const authorization = await db
      .selectFrom('authorizations')
      .selectAll()
      .where('stripe_authorization_id', '=', 'iauth_test_001')
      .executeTakeFirst();

    expect(authorization?.status).toBe('approved');
    expect(await countStripeEvents(db)).toBe(2);
  });
});
