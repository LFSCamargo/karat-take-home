import { describe, expect, it } from 'vitest';

import type { StripeIssuingAuthorization } from '../../contracts/issuing-webhook.types';
import { buildAuthorizationEvent } from '../../../../test/stripe-webhook-fixtures';
import {
  mapAuthorizationStatus,
  mapTransactionStatus,
  normalizeMerchantCategory,
  normalizeMerchantName,
} from '../normalize-issuing';

describe('normalize issuing payloads', () => {
  it('maps authorization statuses', () => {
    const pending = buildAuthorizationEvent({
      approved: true,
      status: 'pending',
    }).data.object as StripeIssuingAuthorization;

    const declined = buildAuthorizationEvent({
      approved: false,
      status: 'pending',
    }).data.object as StripeIssuingAuthorization;

    const closed = buildAuthorizationEvent({
      approved: true,
      status: 'closed',
    }).data.object as StripeIssuingAuthorization;

    expect(mapAuthorizationStatus(pending)).toBe('pending');
    expect(mapAuthorizationStatus(declined)).toBe('declined');
    expect(mapAuthorizationStatus(closed)).toBe('approved');
  });

  it('maps capture transactions to approved', () => {
    expect(mapTransactionStatus({ type: 'capture' } as never)).toBe('approved');
  });

  it('normalizes merchant fields', () => {
    const authorization = buildAuthorizationEvent().data
      .object as StripeIssuingAuthorization;

    expect(normalizeMerchantName(authorization.merchant_data)).toBe(
      'Blue Bottle Coffee',
    );
    expect(normalizeMerchantCategory(authorization.merchant_data)).toBe(
      'fast_food_restaurants',
    );
  });
});
