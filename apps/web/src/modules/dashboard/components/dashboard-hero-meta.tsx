import { Clock, CreditCard, UserRound } from 'lucide-react';

import { Badge } from '@web/components/ui/badge';
import { Skeleton } from '@web/components/ui/skeleton';

import type { CardholderProfile } from '../api/types';
import {
  formatCardholderStatus,
  formatMemberSince,
  formatPrimaryCardLabel,
} from '../utils/cardholder-display';
import { formatRelativeFreshness } from '../utils/format';

type DashboardHeroMetaProps = {
  cardholder?: CardholderProfile;
  isLoading?: boolean;
  latestActivityAt?: string | null;
};

export function DashboardHeroMeta({
  cardholder,
  isLoading = false,
  latestActivityAt = null,
}: DashboardHeroMetaProps) {
  if (isLoading) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
    );
  }

  const cardLabel = formatPrimaryCardLabel(cardholder?.primaryCard);
  const statusLabel = formatCardholderStatus(cardholder?.status);
  const memberSince = formatMemberSince(cardholder?.memberSince);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cardLabel ? (
        <Badge
          className="gap-1.5 rounded-full px-3 py-1 font-normal"
          variant="secondary"
        >
          <CreditCard className="size-3.5" />
          {cardLabel}
        </Badge>
      ) : null}

      {statusLabel ? (
        <Badge
          className="rounded-full px-3 py-1 font-normal capitalize"
          variant={cardholder?.status === 'active' ? 'outline' : 'secondary'}
        >
          {statusLabel}
        </Badge>
      ) : null}

      {memberSince ? (
        <Badge
          className="gap-1.5 rounded-full px-3 py-1 font-normal text-muted-foreground"
          variant="outline"
        >
          <UserRound className="size-3.5" />
          Member since {memberSince}
        </Badge>
      ) : null}

      <Badge
        className="gap-1.5 rounded-full px-3 py-1 font-normal text-muted-foreground"
        variant="outline"
      >
        <Clock className="size-3.5" />
        {formatRelativeFreshness(latestActivityAt ?? null)}
      </Badge>
    </div>
  );
}
