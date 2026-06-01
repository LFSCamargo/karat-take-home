import { beforeEach, describe, expect, it } from 'vitest';

import { getDb } from '../../../../db/client';
import {
  resetDatabase,
  seedCard,
  seedCardholder,
} from '../../../../test/database';
import { getCardholderProfile } from '../cardholder.repository';

describe('cardholder repository integration', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns cached cardholder profile from the database', async () => {
    const cardholder = await seedCardholder(getDb(), {
      externalUserId: 'ich_demo_cardholder',
      displayName: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phoneNumber: '+14155551234',
      status: 'active',
      profileSyncedAt: new Date().toISOString(),
    });

    await seedCard(getDb(), {
      cardholderId: cardholder.id,
      last4: '4242',
      brand: 'Visa',
      status: 'active',
    });

    const profile = await getCardholderProfile(getDb(), cardholder.id);

    expect(profile).toEqual({
      id: cardholder.id,
      stripeCardholderId: 'ich_demo_cardholder',
      displayName: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phoneNumber: '+14155551234',
      status: 'active',
      memberSince: expect.any(String),
      primaryCard: {
        last4: '4242',
        brand: 'Visa',
        status: 'active',
      },
    });
  });
});
