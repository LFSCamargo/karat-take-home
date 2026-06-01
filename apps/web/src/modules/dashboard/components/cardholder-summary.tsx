import { Skeleton } from '@web/components/ui/skeleton';

import { useCardholderQuery } from '../hooks/dashboard-queries';
import {
  buildInitials,
  formatPrimaryCardLabel,
} from '../utils/cardholder-display';

export function CardholderSummary() {
  const cardholderQuery = useCardholderQuery();

  if (cardholderQuery.isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden space-y-2 text-right sm:block">
          <Skeleton className="ml-auto h-4 w-28" />
          <Skeleton className="ml-auto h-3 w-20" />
        </div>
        <Skeleton className="size-10 rounded-full" />
      </div>
    );
  }

  const profile = cardholderQuery.data;
  const displayName = profile?.displayName ?? 'Cardholder';
  const cardLabel =
    formatPrimaryCardLabel(profile?.primaryCard) ?? 'No card on file';

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-xs text-muted-foreground">{cardLabel}</p>
      </div>
      <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
        {buildInitials(displayName)}
      </div>
    </div>
  );
}

export function CardholderFooterSummary() {
  const cardholderQuery = useCardholderQuery();

  if (cardholderQuery.isLoading) {
    return <Skeleton className="h-4 w-40" />;
  }

  return <p>Signed in as {cardholderQuery.data?.email ?? 'cardholder'}</p>;
}
