import type { RequestHandler } from 'express';

import { getDb } from '../../../db/client';
import { sendJson } from '../../../http/send-json';
import { merchantCategoriesResponseSchema } from '../contracts/merchant-categories.contract';
import { listMerchantCategoryOptions } from '../repositories/merchant-categories.repository';

export const getMerchantCategoriesHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const items = await listMerchantCategoryOptions(
      getDb(),
      request.cardholderId,
    );

    return sendJson(response, merchantCategoriesResponseSchema, { items });
  } catch (error) {
    next(error);
  }
};
