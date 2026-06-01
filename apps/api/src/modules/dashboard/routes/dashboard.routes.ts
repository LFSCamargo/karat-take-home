import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

import { cardholderContextMiddleware } from '../../../http/cardholder-context';
import { getMetricsHandler } from '../handlers/metrics.handler';
import { getSpendBreakdownHandler } from '../handlers/spend-breakdown.handler';
import { getTransactionDetailHandler } from '../handlers/transaction-detail.handler';
import { getTransactionsHandler } from '../handlers/transactions.handler';

export function createDashboardRouter(): ExpressRouter {
  const router = Router();

  router.use(cardholderContextMiddleware);

  router.get('/metrics', getMetricsHandler);
  router.get('/spend/breakdown', getSpendBreakdownHandler);
  router.get('/transactions', getTransactionsHandler);
  router.get('/transactions/:id', getTransactionDetailHandler);

  return router;
}
