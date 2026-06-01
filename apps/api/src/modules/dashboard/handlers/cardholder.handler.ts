import type { RequestHandler } from 'express';

import { getDb } from '../../../db/client';
import { sendJson } from '../../../http/send-json';
import { errorResponseSchema } from '../contracts/error.contract';
import { cardholderProfileSchema } from '../contracts/cardholder.contract';
import { getCardholderProfile } from '../repositories/cardholder.repository';

export const getCardholderHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    if (!request.cardholderId) {
      return sendJson(response.status(404), errorResponseSchema, {
        message: 'Cardholder profile was not found',
      });
    }

    const profile = await getCardholderProfile(getDb(), request.cardholderId);

    if (!profile) {
      return sendJson(response.status(404), errorResponseSchema, {
        message: 'Cardholder profile was not found',
      });
    }

    return sendJson(response, cardholderProfileSchema, profile);
  } catch (error) {
    next(error);
  }
};
