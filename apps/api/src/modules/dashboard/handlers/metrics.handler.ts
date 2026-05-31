import type { RequestHandler } from 'express';

import { sendJson } from '../../../http/send-json';
import { dashboardMetricsSchema } from '../contracts/dashboard.contract';

export const getMetricsHandler: RequestHandler = (_request, response) => {
  return sendJson(response, dashboardMetricsSchema, {
    totalSpend: 0,
    transactionCount: 0,
    averageTransactionAmount: 0,
    latestActivityAt: null,
    currency: 'usd',
  });
};
