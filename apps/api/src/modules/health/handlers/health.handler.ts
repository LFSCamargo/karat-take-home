import type { RequestHandler } from 'express';

export const getHealthHandler: RequestHandler = (_request, response) => {
  response.json({ status: 'ok' });
};
