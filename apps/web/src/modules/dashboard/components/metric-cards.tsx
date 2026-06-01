import { Info } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card';
import { Skeleton } from '@web/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@web/components/ui/tooltip';

import { formatCurrency, formatRelativeFreshness } from '../utils/format';

type MetricCardsProps = {
  isLoading: boolean;
  isError: boolean;
  totalSpend?: number;
  transactionCount?: number;
  averageTransactionAmount?: number;
  latestActivityAt?: string | null;
  currency?: string;
};

export function MetricCards({
  isLoading,
  isError,
  totalSpend = 0,
  transactionCount = 0,
  averageTransactionAmount = 0,
  latestActivityAt = null,
  currency = 'usd',
}: MetricCardsProps) {
  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-6 text-sm text-destructive">
          Metrics could not be loaded. Other sections may still be available.
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Total spend',
      value: formatCurrency(totalSpend, currency),
      hint: 'Approved transactions in the current demo period.',
    },
    {
      label: 'Transactions',
      value: String(transactionCount),
      hint: 'Count of approved card activity.',
    },
    {
      label: 'Average amount',
      value: formatCurrency(averageTransactionAmount, currency),
      hint: 'Average approved transaction size.',
    },
    {
      label: 'Freshness',
      value: formatRelativeFreshness(latestActivityAt),
      hint: 'Based on the most recent authorization timestamp.',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card
          key={metric.label}
          className="border-border/70 bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground">
                <Info className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="top">{metric.hint}</TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {metric.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
