import type { RequestHandler } from 'express';

import { log } from './logger';

export const requestLoggerMiddleware: RequestHandler = (
  request,
  response,
  next,
) => {
  const startAt = Date.now();

  response.on('finish', () => {
    const durationMs = Date.now() - startAt;

    log('info', 'request.complete', {
      requestId: request.requestId,
      method: request.method,
      path: request.originalUrl,
      status: response.statusCode,
      durationMs,
      cardholderId: request.cardholderId,
    });
  });

  next();
};
