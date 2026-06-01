import type { RequestHandler } from 'express';

import { getDb } from '../../../db/client';
import { sendJson } from '../../../http/send-json';
import { dashboardMetricsSchema } from '../contracts/metrics.contract';
import { getMetrics } from '../repositories/dashboard.repository';

export const getMetricsHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    if (!request.cardholderId) {
      return sendJson(response, dashboardMetricsSchema, {
        totalSpend: 0,
        transactionCount: 0,
        averageTransactionAmount: 0,
        latestActivityAt: null,
        currency: 'usd',
      });
    }

    const metrics = await getMetrics(getDb(), request.cardholderId);

    return sendJson(response, dashboardMetricsSchema, metrics);
  } catch (error) {
    next(error);
  }
};
