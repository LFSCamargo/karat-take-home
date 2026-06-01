import type { RequestHandler } from 'express';
import { z } from 'zod';

import { getDb } from '../../../db/client';
import { sendJson } from '../../../http/send-json';
import {
  spendBreakdownItemSchema,
  spendBreakdownQuerySchema,
} from '../contracts/spend-breakdown.contract';
import { getSpendBreakdown } from '../repositories/dashboard.repository';

export const getSpendBreakdownHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const query = spendBreakdownQuerySchema.parse(request.query);

    if (!request.cardholderId) {
      return sendJson(response, z.array(spendBreakdownItemSchema), []);
    }

    const breakdown = await getSpendBreakdown(
      getDb(),
      request.cardholderId,
      query,
    );

    return sendJson(response, z.array(spendBreakdownItemSchema), breakdown);
  } catch (error) {
    next(error);
  }
};
