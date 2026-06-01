/* eslint-disable @typescript-eslint/no-namespace */
import type { RequestHandler } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestContextMiddleware: RequestHandler = (
  request,
  _response,
  next,
) => {
  request.requestId ??= crypto.randomUUID();
  next();
};
