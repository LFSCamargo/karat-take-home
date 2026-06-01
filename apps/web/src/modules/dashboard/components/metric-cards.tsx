import { Activity, Clock3, Info, ReceiptText, TrendingUp } from 'lucide-react';

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
      icon: TrendingUp,
      accent: 'from-chart-1/20 to-chart-2/10',
    },
    {
      label: 'Transactions',
      value: String(transactionCount),
      hint: 'Count of approved card activity.',
      icon: ReceiptText,
      accent: 'from-chart-2/20 to-chart-3/10',
    },
    {
      label: 'Average amount',
      value: formatCurrency(averageTransactionAmount, currency),
      hint: 'Average approved transaction size.',
      icon: Activity,
      accent: 'from-chart-3/20 to-chart-4/10',
    },
    {
      label: 'Freshness',
      value: formatRelativeFreshness(latestActivityAt),
      hint: 'Based on the most recent authorization timestamp.',
      icon: Clock3,
      accent: 'from-chart-4/20 to-chart-5/10',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card
            key={metric.label}
            className="group relative overflow-hidden rounded-3xl border-border/70 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5"
          >
            <div
              className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${metric.accent} opacity-70`}
            />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-border/70 bg-background/70 p-2 shadow-sm backdrop-blur-sm">
                  <Icon className="size-4 text-primary" />
                </div>
                <Tooltip>
                  <TooltipTrigger className="text-muted-foreground transition-colors hover:text-foreground">
                    <Info className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent side="top">{metric.hint}</TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent className="relative pt-4">
              <p className="text-2xl font-semibold tracking-tight">
                {metric.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
