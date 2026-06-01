import { sql, type Kysely } from 'kysely';

import type { Database } from '../../../db/schema';
import { log } from '../../../http/logger';
import { getStripeClient } from '../../stripe/stripe-client';
import { formatCardBrand } from '../utils/format-card-brand';

const PROFILE_TTL_MS = 60 * 60 * 1000;

type DatabaseClient = Kysely<Database>;

function isStripeConfigured() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return Boolean(secretKey && !secretKey.includes('replace_me'));
}

function profileNeedsSync(profileSyncedAt: Date | string | null | undefined) {
  if (!profileSyncedAt) {
    return true;
  }

  return Date.now() - new Date(profileSyncedAt).getTime() > PROFILE_TTL_MS;
}

export async function syncCardholderProfileFromStripe(
  db: DatabaseClient,
  stripeCardholderId: string,
) {
  if (!isStripeConfigured() || !stripeCardholderId.startsWith('ich_')) {
    return;
  }

  const stripe = getStripeClient();
  const cardholder =
    await stripe.issuing.cardholders.retrieve(stripeCardholderId);

  const localCardholder = await db
    .updateTable('cardholders')
    .set({
      display_name: cardholder.name ?? null,
      email: cardholder.email ?? null,
      phone_number: cardholder.phone_number ?? null,
      status: cardholder.status ?? null,
      profile_synced_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .where('external_user_id', '=', stripeCardholderId)
    .returning(['id'])
    .executeTakeFirst();

  if (!localCardholder) {
    return;
  }

  const listedCards = await stripe.issuing.cards.list({
    cardholder: stripeCardholderId,
    limit: 1,
  });

  const primaryStripeCard = listedCards.data[0];
  if (!primaryStripeCard) {
    return;
  }

  await db
    .insertInto('cards')
    .values({
      cardholder_id: localCardholder.id,
      stripe_card_id: primaryStripeCard.id,
      last4: primaryStripeCard.last4,
      brand: formatCardBrand(primaryStripeCard.brand),
      status: primaryStripeCard.status,
      updated_at: sql`now()`,
    })
    .onConflict((oc) =>
      oc.column('stripe_card_id').doUpdateSet({
        last4: primaryStripeCard.last4,
        brand: formatCardBrand(primaryStripeCard.brand),
        status: primaryStripeCard.status,
        updated_at: sql`now()`,
      }),
    )
    .execute();
}

export async function refreshCardholderProfileIfStale(
  db: DatabaseClient,
  localCardholderId: string,
) {
  const cardholder = await db
    .selectFrom('cardholders')
    .select(['external_user_id', 'profile_synced_at'])
    .where('id', '=', localCardholderId)
    .executeTakeFirst();

  if (!cardholder || !profileNeedsSync(cardholder.profile_synced_at)) {
    return;
  }

  try {
    await syncCardholderProfileFromStripe(db, cardholder.external_user_id);
  } catch (error) {
    log('warn', 'cardholder.profile_sync_failed', {
      stripeCardholderId: cardholder.external_user_id,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}
