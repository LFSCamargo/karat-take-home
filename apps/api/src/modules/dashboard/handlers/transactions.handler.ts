import type { RequestHandler } from 'express';

import { sendJson } from '../../../http/send-json';
import {
  paginatedTransactionsSchema,
  transactionsQuerySchema,
} from '../contracts/dashboard.contract';

export const getTransactionsHandler: RequestHandler = (request, response) => {
  const query = transactionsQuerySchema.parse(request.query);

  return sendJson(response, paginatedTransactionsSchema, {
    items: [],
    page: query.page,
    pageSize: query.pageSize,
    total: 0,
  });
};
