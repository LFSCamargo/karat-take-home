import { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@web/components/ui/chart';
import { Skeleton } from '@web/components/ui/skeleton';

import type { SpendBreakdownItem } from '../api/api-client';
import { buildSpendBreakdownChartConfig } from '../utils/chart-colors';
import {
  formatCategoryLabel,
  formatCurrency,
  formatPercentage,
} from '../utils/format';

type SpendBreakdownChartProps = {
  isLoading: boolean;
  isError: boolean;
  items?: SpendBreakdownItem[];
};

export function SpendBreakdownChart({
  isLoading,
  isError,
  items = [],
}: SpendBreakdownChartProps) {
  const chartConfig = useMemo(
    () => buildSpendBreakdownChartConfig(items),
    [items],
  );

  return (
    <Card className="overflow-hidden rounded-3xl border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-secondary/50 to-transparent pb-5">
        <CardTitle>Spend breakdown</CardTitle>
        <CardDescription>
          Category totals for approved card activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="mx-auto h-[260px] w-full max-w-sm rounded-full" />
        ) : null}

        {!isLoading && isError ? (
          <p className="text-sm text-destructive">
            Spend breakdown could not be loaded.
          </p>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No spend categories yet.
          </p>
        ) : null}

        {!isLoading && !isError && items.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
            <ChartContainer
              className="mx-auto aspect-square max-h-[280px] w-full"
              config={chartConfig}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={items}
                  dataKey="amount"
                  nameKey="merchantCategory"
                  innerRadius={70}
                  outerRadius={110}
                  stroke="var(--background)"
                  strokeWidth={3}
                >
                  {items.map((item) => (
                    <Cell
                      key={item.merchantCategory}
                      fill={`var(--color-${item.merchantCategory})`}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.merchantCategory}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full shadow-sm"
                      style={{
                        background: `var(--color-${item.merchantCategory})`,
                      }}
                    />
                    <span>{formatCategoryLabel(item.merchantCategory)}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.amount, item.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercentage(item.percentage)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
