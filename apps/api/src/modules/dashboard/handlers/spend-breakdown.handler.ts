import type { RequestHandler } from 'express';
import { z } from 'zod';

import { sendJson } from '../../../http/send-json';
import {
  spendBreakdownItemSchema,
  spendBreakdownQuerySchema,
} from '../contracts/spend-breakdown.contract';

export const getSpendBreakdownHandler: RequestHandler = (request, response) => {
  spendBreakdownQuerySchema.parse(request.query);

  return sendJson(response, z.array(spendBreakdownItemSchema), []);
};
