/* eslint-disable @typescript-eslint/no-namespace */
import type { RequestHandler } from 'express';

declare global {
  namespace Express {
    interface Request {
      cardholderId?: string;
    }
  }
}

export function resolveCardholderId(request: {
  cardholderId?: string;
}): string | undefined {
  if (request.cardholderId) {
    return request.cardholderId;
  }

  return process.env.DEFAULT_CARDHOLDER_ID;
}

export const cardholderContextMiddleware: RequestHandler = (
  request,
  _response,
  next,
) => {
  const cardholderId = resolveCardholderId(request);

  if (cardholderId) {
    request.cardholderId = cardholderId;
  }

  next();
};
