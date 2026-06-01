import type {
  StripeIssuingAuthorization,
  StripeIssuingTransaction,
  StripeWebhookEvent,
} from '../modules/stripe/contracts/issuing-webhook.types';

export const WEBHOOK_TEST_SECRET = 'whsec_test_secret';

export function buildAuthorizationEvent(
  overrides: Partial<StripeIssuingAuthorization> = {},
  eventOverrides: Partial<Pick<StripeWebhookEvent, 'id' | 'type'>> = {},
): StripeWebhookEvent {
  const authorization: StripeIssuingAuthorization = {
    id: 'iauth_test_001',
    amount: 8450,
    approved: true,
    status: 'pending',
    created: 1_717_132_800,
    card: 'ic_test_card_001',
    cardholder: 'ich_test_cardholder_001',
    currency: 'usd',
    merchant_data: {
      category: 'fast_food_restaurants',
      name: 'Blue Bottle Coffee',
      network_id: '1234567890',
    },
    ...overrides,
  };

  return {
    id: eventOverrides.id ?? 'evt_auth_001',
    type: eventOverrides.type ?? 'issuing_authorization.created',
    data: {
      object: authorization,
    },
  };
}

export function buildTransactionEvent(
  overrides: Partial<StripeIssuingTransaction> = {},
  eventOverrides: Partial<Pick<StripeWebhookEvent, 'id' | 'type'>> = {},
): StripeWebhookEvent {
  const transaction: StripeIssuingTransaction = {
    id: 'ipi_test_001',
    amount: 8450,
    authorization: 'iauth_test_001',
    created: 1_717_136_400,
    card: 'ic_test_card_001',
    cardholder: 'ich_test_cardholder_001',
    currency: 'usd',
    type: 'capture',
    merchant_data: {
      category: 'fast_food_restaurants',
      name: 'Blue Bottle Coffee',
      network_id: '1234567890',
    },
    ...overrides,
  };

  return {
    id: eventOverrides.id ?? 'evt_txn_001',
    type: eventOverrides.type ?? 'issuing_transaction.created',
    data: {
      object: transaction,
    },
  };
}
