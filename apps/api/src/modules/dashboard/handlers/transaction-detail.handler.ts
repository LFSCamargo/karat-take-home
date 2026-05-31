import type { RequestHandler } from 'express';

import { sendJson } from '../../../http/send-json';
import {
  errorResponseSchema,
  transactionParamsSchema,
} from '../contracts/dashboard.contract';

export const getTransactionDetailHandler: RequestHandler = (
  request,
  response,
) => {
  const params = transactionParamsSchema.parse(request.params);

  return sendJson(response.status(404), errorResponseSchema, {
    message: `Transaction ${params.id} was not found`,
  });
};
