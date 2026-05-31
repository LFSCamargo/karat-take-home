import express, { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

import { postStripeWebhookHandler } from '../handlers/stripe-webhook.handler';

export function createStripeWebhookRouter(): ExpressRouter {
  const router = Router();

  router.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    postStripeWebhookHandler,
  );

  return router;
}
