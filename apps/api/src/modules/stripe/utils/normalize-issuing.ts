import type {
  StripeIssuingAuthorization,
  StripeIssuingTransaction,
  StripeMerchantData,
} from '../contracts/issuing-webhook.types';

export function getStripeResourceId(
  value: string | { id: string } | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  return typeof value === 'string' ? value : value.id;
}

export function stripeTimestampToIso(
  value: number | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

export function normalizeMerchantName(
  merchantData: StripeMerchantData,
): string {
  return (
    merchantData.name?.trim() || merchantData.network_id || 'Unknown merchant'
  );
}

export function normalizeMerchantCategory(
  merchantData: StripeMerchantData,
): string {
  return merchantData.category || 'uncategorized';
}

export function mapAuthorizationStatus(
  authorization: StripeIssuingAuthorization,
): string {
  if (!authorization.approved) {
    return 'declined';
  }

  if (authorization.status === 'pending') {
    return 'pending';
  }

  return 'approved';
}

export function mapTransactionStatus(
  transaction: StripeIssuingTransaction,
): string {
  if (transaction.type === 'refund') {
    return 'approved';
  }

  if (transaction.type === 'capture') {
    return 'approved';
  }

  return transaction.type;
}

export function normalizeAuthorizationAmount(amount: number): number {
  return Math.abs(amount);
}

export function normalizeTransactionAmount(amount: number): number {
  return Math.abs(amount);
}
