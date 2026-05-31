import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';

import { getHealthHandler } from '../handlers/health.handler';

export function createHealthRouter(): ExpressRouter {
  const router = Router();

  router.get('/health', getHealthHandler);

  return router;
}
