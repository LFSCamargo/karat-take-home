import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { errorResponseSchema } from '../modules/dashboard/contracts/error.contract';
import { log } from './logger';

export const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  next,
) => {
  if (response.headersSent) {
    return next(error);
  }

  log('error', 'request.error', {
    requestId: request.requestId,
    method: request.method,
    path: request.originalUrl,
    cardholderId: request.cardholderId,
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
  });

  if (error instanceof ZodError) {
    return response.status(400).json(
      errorResponseSchema.parse({
        message: 'Invalid request payload',
      }),
    );
  }

  return response.status(500).json(
    errorResponseSchema.parse({
      message: 'Internal server error',
    }),
  );
};
