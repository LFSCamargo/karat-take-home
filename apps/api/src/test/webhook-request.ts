import request from 'supertest';
import type { Express } from 'express';

import type { StripeWebhookEvent } from '../modules/stripe/contracts/issuing-webhook.types';
import { signStripeWebhookPayload } from '../modules/stripe/utils/verify-stripe-event';
import { WEBHOOK_TEST_SECRET } from './stripe-webhook-fixtures';

export function postStripeWebhook(
  app: Express,
  payload: string,
  signature?: string,
) {
  return request(app)
    .post('/webhooks/stripe')
    .set('content-type', 'application/json')
    .set(
      'stripe-signature',
      signature ?? signStripeWebhookPayload(payload, WEBHOOK_TEST_SECRET),
    )
    .send(payload);
}

export function postStripeWebhookEvent(
  app: Express,
  event: StripeWebhookEvent,
  signature?: string,
) {
  return postStripeWebhook(app, JSON.stringify(event), signature);
}
