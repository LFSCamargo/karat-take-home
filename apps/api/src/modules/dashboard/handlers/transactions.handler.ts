import type { RequestHandler } from 'express';

import { getDb } from '../../../db/client';
import { sendJson } from '../../../http/send-json';
import {
  paginatedTransactionsSchema,
  transactionsQuerySchema,
} from '../contracts/transactions.contract';
import { listTransactions } from '../repositories/transactions.repository';

export const getTransactionsHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const query = transactionsQuerySchema.parse(request.query);

    if (!request.cardholderId) {
      return sendJson(response, paginatedTransactionsSchema, {
        items: [],
        page: query.page,
        pageSize: query.pageSize,
        total: 0,
      });
    }

    const result = await listTransactions(getDb(), request.cardholderId, query);

    return sendJson(response, paginatedTransactionsSchema, result);
  } catch (error) {
    next(error);
  }
};
