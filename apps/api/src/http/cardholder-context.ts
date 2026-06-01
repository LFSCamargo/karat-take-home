/* eslint-disable @typescript-eslint/no-namespace */
import type { RequestHandler } from 'express';

import { getDb } from '../db/client';
import { resolveCardholderDbId } from './cardholder-id';

declare global {
  namespace Express {
    interface Request {
      cardholderId?: string;
    }
  }
}

export function resolveCardholderIdentifier(request: {
  cardholderId?: string;
}): string | undefined {
  if (request.cardholderId) {
    return request.cardholderId;
  }

  return process.env.DEFAULT_CARDHOLDER_ID;
}

export const cardholderContextMiddleware: RequestHandler = async (
  request,
  _response,
  next,
) => {
  try {
    const identifier = resolveCardholderIdentifier(request);
    if (!identifier) {
      return next();
    }

    const cardholderId = await resolveCardholderDbId(getDb(), identifier);
    if (cardholderId) {
      request.cardholderId = cardholderId;
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
