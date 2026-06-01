import express, { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import rateLimit from 'express-rate-limit';

import { postStripeWebhookHandler } from '../handlers/stripe-webhook.handler';

export function createStripeWebhookRouter(): ExpressRouter {
  const router = Router();

  router.post(
    '/webhooks/stripe',
    rateLimit({
      windowMs: 60_000,
      limit: 600,
      standardHeaders: true,
      legacyHeaders: false,
    }),
    express.raw({ type: 'application/json' }),
    postStripeWebhookHandler,
  );

  return router;
}
