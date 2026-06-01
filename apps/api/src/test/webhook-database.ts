import { getDb } from '../db/client';

export async function getCardholderIdByExternalUserId(externalUserId: string) {
  const cardholder = await getDb()
    .selectFrom('cardholders')
    .select(['id'])
    .where('external_user_id', '=', externalUserId)
    .executeTakeFirstOrThrow();

  return cardholder.id;
}

export async function getTransactionIdByStripeTransactionId(
  stripeTransactionId: string,
) {
  const transaction = await getDb()
    .selectFrom('transactions')
    .select(['id'])
    .where('stripe_transaction_id', '=', stripeTransactionId)
    .executeTakeFirstOrThrow();

  return transaction.id;
}
