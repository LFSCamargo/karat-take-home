import { Badge } from '@web/components/ui/badge';
import { cn } from '@web/lib/utils';

const statusStyles: Record<string, string> = {
  approved: 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10',
  pending: 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/10',
  declined: 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/10',
};

export function TransactionStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        'capitalize',
        statusStyles[status] ?? 'bg-secondary text-secondary-foreground',
        className,
      )}
      variant="secondary"
    >
      {status}
    </Badge>
  );
}

export function CategoryBadge({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <Badge className={cn('capitalize', className)} variant="outline">
      {category.replaceAll('_', ' ')}
    </Badge>
  );
}
