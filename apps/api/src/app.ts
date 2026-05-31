import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { errorHandler } from './http/error-handler';
import { createDashboardRouter } from './modules/dashboard/routes/dashboard.routes';
import { createHealthRouter } from './modules/health/routes/health.routes';
import { createStripeWebhookRouter } from './modules/stripe/routes/stripe.routes';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());

  app.use(createHealthRouter());
  app.use(createStripeWebhookRouter());

  app.use(express.json());
  app.use(
    '/api',
    rateLimit({
      windowMs: 60_000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
    createDashboardRouter(),
  );
  app.use(errorHandler);

  return app;
}
