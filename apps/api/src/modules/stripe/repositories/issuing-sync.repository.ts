import { sql, type Kysely, type Transaction } from 'kysely';

import type { Database } from '../../../db/schema';
import type {
  StripeIssuingAuthorization,
  StripeIssuingTransaction,
} from '../contracts/issuing-webhook.types';
import {
  getStripeResourceId,
  mapAuthorizationStatus,
  mapTransactionStatus,
  normalizeAuthorizationAmount,
  normalizeMerchantCategory,
  normalizeMerchantName,
  normalizeTransactionAmount,
  stripeTimestampToIso,
} from '../utils/normalize-issuing';

type DatabaseClient = Kysely<Database>;
type DbTransaction = Transaction<Database>;

async function ensureCardholder(
  trx: DbTransaction,
  stripeCardholderId: string,
) {
  await trx
    .insertInto('cardholders')
    .values({
      external_user_id: stripeCardholderId,
    })
    .onConflict((oc) => oc.column('external_user_id').doNothing())
    .execute();

  return trx
    .selectFrom('cardholders')
    .selectAll()
    .where('external_user_id', '=', stripeCardholderId)
    .executeTakeFirstOrThrow();
}

async function ensureCard(
  trx: DbTransaction,
  cardholderId: string,
  stripeCardId: string,
) {
  await trx
    .insertInto('cards')
    .values({
      cardholder_id: cardholderId,
      stripe_card_id: stripeCardId,
      last4: '0000',
      status: 'active',
    })
    .onConflict((oc) =>
      oc.column('stripe_card_id').doUpdateSet({
        cardholder_id: cardholderId,
        updated_at: sql`now()`,
      }),
    )
    .execute();

  return trx
    .selectFrom('cards')
    .selectAll()
    .where('stripe_card_id', '=', stripeCardId)
    .executeTakeFirstOrThrow();
}

export async function upsertAuthorizationFromStripe(
  trx: DbTransaction,
  authorization: StripeIssuingAuthorization,
) {
  const stripeCardholderId = getStripeResourceId(authorization.cardholder);
  const stripeCardId = getStripeResourceId(authorization.card);

  if (!stripeCardholderId || !stripeCardId) {
    throw new Error('Stripe authorization is missing cardholder or card');
  }

  const cardholder = await ensureCardholder(trx, stripeCardholderId);
  const card = await ensureCard(trx, cardholder.id, stripeCardId);

  await trx
    .insertInto('authorizations')
    .values({
      cardholder_id: cardholder.id,
      card_id: card.id,
      stripe_authorization_id: authorization.id,
      amount: normalizeAuthorizationAmount(authorization.amount),
      currency: authorization.currency,
      merchant_name: normalizeMerchantName(authorization.merchant_data),
      merchant_category: normalizeMerchantCategory(authorization.merchant_data),
      status: mapAuthorizationStatus(authorization),
      updated_at: sql`now()`,
    })
    .onConflict((oc) =>
      oc.column('stripe_authorization_id').doUpdateSet({
        amount: normalizeAuthorizationAmount(authorization.amount),
        currency: authorization.currency,
        merchant_name: normalizeMerchantName(authorization.merchant_data),
        merchant_category: normalizeMerchantCategory(
          authorization.merchant_data,
        ),
        status: mapAuthorizationStatus(authorization),
        updated_at: sql`now()`,
      }),
    )
    .execute();
}

export async function upsertTransactionFromStripe(
  trx: DbTransaction,
  transaction: StripeIssuingTransaction,
) {
  const stripeCardholderId = getStripeResourceId(transaction.cardholder);
  const stripeCardId = getStripeResourceId(transaction.card);

  if (!stripeCardholderId || !stripeCardId) {
    throw new Error('Stripe transaction is missing cardholder or card');
  }

  const cardholder = await ensureCardholder(trx, stripeCardholderId);
  const card = await ensureCard(trx, cardholder.id, stripeCardId);
  const authorizedAt =
    stripeTimestampToIso(transaction.created) ?? new Date().toISOString();

  await trx
    .insertInto('transactions')
    .values({
      cardholder_id: cardholder.id,
      card_id: card.id,
      stripe_transaction_id: transaction.id,
      amount: normalizeTransactionAmount(transaction.amount),
      currency: transaction.currency,
      merchant_name: normalizeMerchantName(transaction.merchant_data),
      merchant_category: normalizeMerchantCategory(transaction.merchant_data),
      status: mapTransactionStatus(transaction),
      authorized_at: authorizedAt,
      posted_at: stripeTimestampToIso(transaction.created),
      updated_at: sql`now()`,
    })
    .onConflict((oc) =>
      oc.column('stripe_transaction_id').doUpdateSet({
        amount: normalizeTransactionAmount(transaction.amount),
        currency: transaction.currency,
        merchant_name: normalizeMerchantName(transaction.merchant_data),
        merchant_category: normalizeMerchantCategory(transaction.merchant_data),
        status: mapTransactionStatus(transaction),
        authorized_at: authorizedAt,
        posted_at: stripeTimestampToIso(transaction.created),
        updated_at: sql`now()`,
      }),
    )
    .execute();
}

export async function isStripeEventProcessed(
  trx: DbTransaction,
  stripeEventId: string,
) {
  const existing = await trx
    .selectFrom('stripe_events')
    .select(['processed_at'])
    .where('stripe_event_id', '=', stripeEventId)
    .executeTakeFirst();

  return Boolean(existing?.processed_at);
}

export async function markStripeEventProcessed(
  trx: DbTransaction,
  stripeEventId: string,
  eventType: string,
) {
  await trx
    .insertInto('stripe_events')
    .values({
      stripe_event_id: stripeEventId,
      event_type: eventType,
      processed_at: sql`now()`,
    })
    .onConflict((oc) =>
      oc.column('stripe_event_id').doUpdateSet({
        event_type: eventType,
        processed_at: sql`now()`,
      }),
    )
    .execute();
}

export async function countStripeEvents(db: DatabaseClient) {
  const result = await db
    .selectFrom('stripe_events')
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow();

  return Number(result.count);
}
