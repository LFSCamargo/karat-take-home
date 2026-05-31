import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { errorResponseSchema } from '../modules/dashboard/contracts/dashboard.contract';

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    return next(error);
  }

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
