import type { Kysely } from 'kysely';

import type { Database } from '../../../db/schema';
import type { CardholderProfile } from '../contracts/cardholder.contract';
import { formatCardBrand } from '../utils/format-card-brand';
import { toIsoString } from '../utils/dashboard-sql';
import { refreshCardholderProfileIfStale } from '../services/sync-cardholder-profile';

type DatabaseClient = Kysely<Database>;

export async function getCardholderProfile(
  db: DatabaseClient,
  localCardholderId: string,
): Promise<CardholderProfile | null> {
  await refreshCardholderProfileIfStale(db, localCardholderId);

  const cardholder = await db
    .selectFrom('cardholders')
    .selectAll()
    .where('id', '=', localCardholderId)
    .executeTakeFirst();

  if (!cardholder) {
    return null;
  }

  const primaryCard = await db
    .selectFrom('cards')
    .select(['last4', 'brand', 'status'])
    .where('cardholder_id', '=', localCardholderId)
    .orderBy('updated_at', 'desc')
    .executeTakeFirst();

  return {
    id: cardholder.id,
    stripeCardholderId: cardholder.external_user_id,
    displayName: cardholder.display_name,
    email: cardholder.email,
    phoneNumber: cardholder.phone_number,
    status: cardholder.status,
    memberSince: toIsoString(cardholder.created_at),
    primaryCard: primaryCard
      ? {
          last4: primaryCard.last4,
          brand: formatCardBrand(primaryCard.brand),
          status: primaryCard.status,
        }
      : null,
  };
}
