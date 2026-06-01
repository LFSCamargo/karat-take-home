import type { RequestHandler } from 'express';

import { getDb } from '../../../db/client';
import { log } from '../../../http/logger';
import { errorResponseSchema } from '../../dashboard/contracts/error.contract';
import { sendJson } from '../../../http/send-json';
import { processStripeWebhookEvent } from '../services/process-webhook-event';
import {
  StripeSignatureError,
  verifyStripeEvent,
} from '../utils/verify-stripe-event';

export const postStripeWebhookHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  const startedAt = Date.now();

  try {
    if (!Buffer.isBuffer(request.body)) {
      return sendJson(response.status(400), errorResponseSchema, {
        message: 'Invalid request payload',
      });
    }

    const event = verifyStripeEvent(
      request.body,
      request.headers['stripe-signature'],
    );

    log('info', 'stripe.webhook.verified', {
      requestId: request.requestId,
      stripeEventId: event.id,
      stripeEventType: event.type,
    });

    const result = await processStripeWebhookEvent(getDb(), event);

    log('info', 'stripe.webhook.processed', {
      requestId: request.requestId,
      stripeEventId: event.id,
      stripeEventType: event.type,
      duplicate: result.duplicate,
      handled: result.handled,
      durationMs: Date.now() - startedAt,
    });

    return response.status(200).json({ received: true });
  } catch (error) {
    if (error instanceof StripeSignatureError) {
      log('warn', 'stripe.webhook.signature_invalid', {
        requestId: request.requestId,
        durationMs: Date.now() - startedAt,
      });
      return sendJson(response.status(400), errorResponseSchema, {
        message: 'Invalid Stripe webhook signature',
      });
    }

    log('error', 'stripe.webhook.failed', {
      requestId: request.requestId,
      durationMs: Date.now() - startedAt,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    next(error);
  }
};
