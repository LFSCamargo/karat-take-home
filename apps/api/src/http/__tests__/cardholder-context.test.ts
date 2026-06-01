import { afterEach, describe, expect, it } from 'vitest';

import {
  clearDefaultCardholderId,
  setDefaultCardholderId,
} from '../../test/cardholder-context';
import { resetDatabase, seedCardholder } from '../../test/database';
import { getDb } from '../../db/client';
import {
  isStripeCardholderId,
  isUuid,
  resolveCardholderDbId,
} from '../cardholder-id';
import { resolveCardholderIdentifier } from '../cardholder-context';

describe('resolveCardholderIdentifier', () => {
  afterEach(() => {
    clearDefaultCardholderId();
  });

  it('uses cardholder id already attached to the request', () => {
    expect(
      resolveCardholderIdentifier({
        cardholderId: '11111111-1111-1111-1111-111111111111',
      }),
    ).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('falls back to DEFAULT_CARDHOLDER_ID when request has no cardholder', () => {
    setDefaultCardholderId('ich_test_cardholder');

    expect(resolveCardholderIdentifier({})).toBe('ich_test_cardholder');
  });

  it('returns undefined when no trusted cardholder context exists', () => {
    expect(resolveCardholderIdentifier({})).toBeUndefined();
  });
});

describe('resolveCardholderDbId', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns uuid identifiers unchanged', async () => {
    expect(
      await resolveCardholderDbId(
        getDb(),
        '11111111-1111-1111-1111-111111111111',
      ),
    ).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('maps Stripe cardholder ids to local cardholder uuid', async () => {
    const cardholder = await seedCardholder(getDb(), {
      externalUserId: 'ich_test_cardholder_001',
    });

    expect(
      await resolveCardholderDbId(getDb(), 'ich_test_cardholder_001'),
    ).toBe(cardholder.id);
  });

  it('returns undefined when Stripe cardholder id is unknown', async () => {
    expect(
      await resolveCardholderDbId(getDb(), 'ich_missing_cardholder'),
    ).toBeUndefined();
  });
});

describe('cardholder id helpers', () => {
  it('detects uuid and Stripe cardholder patterns', () => {
    expect(isUuid('11111111-1111-1111-1111-111111111111')).toBe(true);
    expect(isUuid('ich_test')).toBe(false);
    expect(isStripeCardholderId('ich_test')).toBe(true);
  });
});
