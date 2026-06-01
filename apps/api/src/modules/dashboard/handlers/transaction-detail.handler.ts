import type { RequestHandler } from 'express';

import { getDb } from '../../../db/client';
import { sendJson } from '../../../http/send-json';
import { errorResponseSchema } from '../contracts/error.contract';
import { transactionSchema } from '../contracts/transactions.contract';
import { transactionParamsSchema } from '../contracts/transaction-detail.contract';
import { getTransactionById } from '../repositories/transactions.repository';

export const getTransactionDetailHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const params = transactionParamsSchema.parse(request.params);

    if (!request.cardholderId) {
      return sendJson(response.status(404), errorResponseSchema, {
        message: `Transaction ${params.id} was not found`,
      });
    }

    const transaction = await getTransactionById(
      getDb(),
      request.cardholderId,
      params.id,
    );

    if (!transaction) {
      return sendJson(response.status(404), errorResponseSchema, {
        message: `Transaction ${params.id} was not found`,
      });
    }

    return sendJson(response, transactionSchema, transaction);
  } catch (error) {
    next(error);
  }
};
