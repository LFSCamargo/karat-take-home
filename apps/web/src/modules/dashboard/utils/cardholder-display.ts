import type { CardholderProfile } from '../api/types';

export function buildInitials(displayName: string | null | undefined) {
  if (!displayName) {
    return '?';
  }

  return displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

export function getFirstName(displayName: string | null | undefined) {
  if (!displayName) {
    return 'there';
  }

  return displayName.split(' ')[0] ?? displayName;
}

export function formatPrimaryCardLabel(
  primaryCard: CardholderProfile['primaryCard'] | undefined,
) {
  if (!primaryCard) {
    return null;
  }

  return `${primaryCard.brand} ···· ${primaryCard.last4}`;
}

export function formatCardholderStatus(status: string | null | undefined) {
  if (!status) {
    return null;
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatMemberSince(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
