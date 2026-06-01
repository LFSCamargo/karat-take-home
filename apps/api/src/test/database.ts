import { sql, type Insertable, type Kysely } from 'kysely';

import { destroyDb, getDb } from '../db/client';
import type { Database } from '../db/schema';

type DatabaseClient = Kysely<Database>;

export async function resetDatabase() {
  await destroyDb();

  const db = getDb();

  await sql`
    truncate table
      transactions,
      authorizations,
      spend_category_totals,
      stripe_events,
      cards,
      cardholders
    restart identity cascade
  `.execute(db);
}

export type SeedCardholderInput = {
  externalUserId?: string;
};

export type SeedCardInput = {
  cardholderId: string;
  stripeCardId?: string;
  last4?: string;
  status?: string;
};

export type SeedTransactionInput = {
  cardholderId: string;
  cardId: string;
  stripeTransactionId?: string;
  amount: number;
  currency?: string;
  merchantName: string;
  merchantCategory: string;
  status: string;
  authorizedAt?: Date | string | null;
  postedAt?: Date | string | null;
};

export async function seedCardholder(
  db: DatabaseClient,
  input: SeedCardholderInput = {},
) {
  return db
    .insertInto('cardholders')
    .values({
      external_user_id: input.externalUserId ?? 'test-user',
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function seedCard(db: DatabaseClient, input: SeedCardInput) {
  return db
    .insertInto('cards')
    .values({
      cardholder_id: input.cardholderId,
      stripe_card_id: input.stripeCardId ?? `card_${crypto.randomUUID()}`,
      last4: input.last4 ?? '4242',
      status: input.status ?? 'active',
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function seedTransaction(
  db: DatabaseClient,
  input: SeedTransactionInput,
) {
  const values: Insertable<Database['transactions']> = {
    cardholder_id: input.cardholderId,
    card_id: input.cardId,
    stripe_transaction_id:
      input.stripeTransactionId ?? `txn_${crypto.randomUUID()}`,
    amount: input.amount,
    currency: input.currency ?? 'usd',
    merchant_name: input.merchantName,
    merchant_category: input.merchantCategory,
    status: input.status,
    authorized_at: input.authorizedAt ?? null,
    posted_at: input.postedAt ?? null,
  };

  return db
    .insertInto('transactions')
    .values(values)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function seedDashboardFixtures() {
  const db = getDb();
  const cardholder = await seedCardholder(db, {
    externalUserId: 'integration-user',
  });
  const card = await seedCard(db, { cardholderId: cardholder.id });

  const blueBottle = await seedTransaction(db, {
    cardholderId: cardholder.id,
    cardId: card.id,
    amount: 8450,
    merchantName: 'Blue Bottle Coffee',
    merchantCategory: 'restaurants',
    status: 'approved',
    authorizedAt: '2026-05-31T08:00:00.000Z',
    postedAt: '2026-05-31T09:00:00.000Z',
  });

  const united = await seedTransaction(db, {
    cardholderId: cardholder.id,
    cardId: card.id,
    amount: 31200,
    merchantName: 'United Airlines',
    merchantCategory: 'travel',
    status: 'approved',
    authorizedAt: '2026-05-30T14:00:00.000Z',
    postedAt: '2026-05-30T16:00:00.000Z',
  });

  const marriott = await seedTransaction(db, {
    cardholderId: cardholder.id,
    cardId: card.id,
    amount: 54000,
    merchantName: 'Marriott Hotels',
    merchantCategory: 'travel',
    status: 'pending',
    authorizedAt: '2026-05-29T15:00:00.000Z',
    postedAt: null,
  });

  const apple = await seedTransaction(db, {
    cardholderId: cardholder.id,
    cardId: card.id,
    amount: 89900,
    merchantName: 'Apple Store',
    merchantCategory: 'software',
    status: 'declined',
    authorizedAt: '2026-05-28T11:00:00.000Z',
    postedAt: null,
  });

  const otherCardholder = await seedCardholder(db, {
    externalUserId: 'other-user',
  });
  const otherCard = await seedCard(db, { cardholderId: otherCardholder.id });

  await seedTransaction(db, {
    cardholderId: otherCardholder.id,
    cardId: otherCard.id,
    amount: 9999,
    merchantName: 'Other Merchant',
    merchantCategory: 'groceries',
    status: 'approved',
    authorizedAt: '2026-05-31T10:00:00.000Z',
    postedAt: '2026-05-31T11:00:00.000Z',
  });

  return {
    cardholder,
    card,
    transactions: {
      blueBottle,
      united,
      marriott,
      apple,
    },
  };
}
