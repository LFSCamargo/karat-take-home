import type { Kysely, Transaction } from 'kysely';

import type { Database } from '../../../db/schema';
import type {
  StripeIssuingAuthorization,
  StripeIssuingTransaction,
  StripeWebhookEvent,
} from '../contracts/issuing-webhook.types';
import {
  isStripeEventProcessed,
  markStripeEventProcessed,
  upsertAuthorizationFromStripe,
  upsertTransactionFromStripe,
} from '../repositories/issuing-sync.repository';

type DbTransaction = Transaction<Database>;

const AUTHORIZATION_EVENTS = new Set([
  'issuing_authorization.created',
  'issuing_authorization.updated',
]);

const TRANSACTION_EVENTS = new Set([
  'issuing_transaction.created',
  'issuing_transaction.updated',
]);

async function handleStripeEventPayload(
  trx: DbTransaction,
  event: StripeWebhookEvent,
) {
  if (AUTHORIZATION_EVENTS.has(event.type)) {
    await upsertAuthorizationFromStripe(
      trx,
      event.data.object as StripeIssuingAuthorization,
    );
    return;
  }

  if (TRANSACTION_EVENTS.has(event.type)) {
    await upsertTransactionFromStripe(
      trx,
      event.data.object as StripeIssuingTransaction,
    );
  }
}

export async function processStripeWebhookEvent(
  db: Kysely<Database>,
  event: StripeWebhookEvent,
) {
  let duplicate = false;
  let handled = false;

  await db.transaction().execute(async (trx) => {
    if (await isStripeEventProcessed(trx, event.id)) {
      duplicate = true;
      return;
    }

    await handleStripeEventPayload(trx, event);
    handled = true;
    await markStripeEventProcessed(trx, event.id, event.type);
  });

  return { duplicate, handled };
}
