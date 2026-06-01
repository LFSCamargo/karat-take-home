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
  type ChartConfig,
} from '@web/components/ui/chart';
import { Skeleton } from '@web/components/ui/skeleton';

import type { SpendBreakdownItem } from '../api/api-client';
import {
  formatCategoryLabel,
  formatCurrency,
  formatPercentage,
} from '../utils/format';

const chartConfig = {
  restaurants: { label: 'Restaurants', color: 'var(--chart-1)' },
  travel: { label: 'Travel', color: 'var(--chart-2)' },
  groceries: { label: 'Groceries', color: 'var(--chart-3)' },
  fuel: { label: 'Fuel', color: 'var(--chart-4)' },
  software: { label: 'Software', color: 'var(--chart-5)' },
  entertainment: { label: 'Entertainment', color: 'var(--chart-1)' },
} satisfies ChartConfig;

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
  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
      <CardHeader>
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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
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
                  strokeWidth={4}
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

            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.merchantCategory}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
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
