import type { RequestHandler } from 'express';

import { errorResponseSchema } from '../../dashboard/contracts/dashboard.contract';
import { sendJson } from '../../../http/send-json';

export const postStripeWebhookHandler: RequestHandler = (
  _request,
  response,
) => {
  return sendJson(response.status(501), errorResponseSchema, {
    message: 'Stripe webhook handling is not implemented yet',
  });
};
