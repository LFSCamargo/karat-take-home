import type {
  StripeIssuingAuthorization,
  StripeIssuingTransaction,
  StripeMerchantData,
  StripeWebhookEvent,
} from '../contracts/issuing-webhook.types';
import { getStripeClient } from '../stripe-client';

export class StripeSignatureError extends Error {
  constructor(message = 'Invalid Stripe webhook signature') {
    super(message);
    this.name = 'StripeSignatureError';
  }
}

export function verifyStripeEvent(
  payload: Buffer,
  signature: string | string[] | undefined,
): StripeWebhookEvent {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required to verify webhooks');
  }

  if (!signature || Array.isArray(signature)) {
    throw new StripeSignatureError();
  }

  try {
    return getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    ) as StripeWebhookEvent;
  } catch {
    throw new StripeSignatureError();
  }
}

export function signStripeWebhookPayload(payload: string, secret: string) {
  return getStripeClient().webhooks.generateTestHeaderString({
    payload,
    secret,
  });
}

export type {
  StripeIssuingAuthorization,
  StripeIssuingTransaction,
  StripeMerchantData,
  StripeWebhookEvent,
};
