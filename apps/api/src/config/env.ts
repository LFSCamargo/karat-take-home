import { loadEnv } from './load-env.js';

loadEnv();

export const serverEnv = {
  port: Number(process.env.PORT ?? 3333),
  databaseUrl: process.env.DATABASE_URL,
  testDatabaseUrl: process.env.TEST_DATABASE_URL,
  defaultCardholderId: process.env.DEFAULT_CARDHOLDER_ID,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
} as const;
