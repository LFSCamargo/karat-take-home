import { RefreshCw, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@web/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs';

import { DashboardHeroMeta } from '../components/dashboard-hero-meta';
import { MetricCards } from '../components/metric-cards';
import { RecentActivityTable } from '../components/recent-activity-table';
import { SpendBreakdownChart } from '../components/spend-breakdown-chart';
import {
  dashboardKeys,
  useCardholderQuery,
  useMetricsQuery,
  useRecentTransactionsQuery,
  useSpendBreakdownQuery,
} from '../hooks/dashboard-queries';
import { getFirstName } from '../utils/cardholder-display';

export function DashboardRoute() {
  const queryClient = useQueryClient();
  const cardholder = useCardholderQuery();
  const metrics = useMetricsQuery();
  const spendBreakdown = useSpendBreakdownQuery();
  const recentTransactions = useRecentTransactionsQuery();
  const firstName = getFirstName(cardholder.data?.displayName);

  async function refreshDashboard() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: dashboardKeys.cardholder() }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.metrics() }),
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.spendBreakdown(),
      }),
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.transactions({ page: 1, pageSize: 5 }),
      }),
    ]);
    toast.success('Dashboard refreshed');
  }

  return (
    <main className="relative mx-auto flex max-w-6xl flex-col gap-8 overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-80 max-w-5xl rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-36 right-8 -z-10 size-72 rounded-full bg-chart-2/10 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2.25rem] border border-border/70 bg-gradient-to-br from-card via-background to-secondary/50 p-8 shadow-2xl shadow-primary/5 ring-1 ring-white/40 md:p-10 dark:ring-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--chart-1),transparent_24%),radial-gradient(circle_at_80%_10%,var(--chart-2),transparent_22%)] opacity-10" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
              <Sparkles className="size-3.5 text-primary" />
              Stripe Issuing dashboard
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
                Your spending, simplified
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground">
                {cardholder.isLoading ? (
                  <>
                    Welcome back. Review recent card activity, lightweight
                    metrics, and merchant category insights in one calm
                    dashboard.
                  </>
                ) : (
                  <>
                    Welcome back, {firstName}. Review recent card activity,
                    lightweight metrics, and merchant category insights in one
                    calm dashboard.
                  </>
                )}
              </p>
            </div>
            <DashboardHeroMeta
              cardholder={cardholder.data}
              isLoading={cardholder.isLoading}
              latestActivityAt={metrics.data?.latestActivityAt ?? null}
            />
          </div>

          <Button
            className="w-fit rounded-full bg-background/70 shadow-sm backdrop-blur-sm"
            type="button"
            variant="outline"
            onClick={() => void refreshDashboard()}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
        <div className="pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      </section>

      <MetricCards
        averageTransactionAmount={metrics.data?.averageTransactionAmount}
        currency={metrics.data?.currency}
        isError={metrics.isError}
        isLoading={metrics.isLoading}
        latestActivityAt={metrics.data?.latestActivityAt}
        totalSpend={metrics.data?.totalSpend}
        transactionCount={metrics.data?.transactionCount}
      />

      <Tabs className="lg:hidden" defaultValue="breakdown">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="breakdown">
          <SpendBreakdownChart
            isError={spendBreakdown.isError}
            isLoading={spendBreakdown.isLoading}
            items={spendBreakdown.data}
          />
        </TabsContent>
        <TabsContent value="activity">
          <RecentActivityTable
            isError={recentTransactions.isError}
            isLoading={recentTransactions.isLoading}
            items={recentTransactions.data?.items}
          />
        </TabsContent>
      </Tabs>

      <section className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SpendBreakdownChart
          isError={spendBreakdown.isError}
          isLoading={spendBreakdown.isLoading}
          items={spendBreakdown.data}
        />
        <RecentActivityTable
          isError={recentTransactions.isError}
          isLoading={recentTransactions.isLoading}
          items={recentTransactions.data?.items}
        />
      </section>
    </main>
  );
}
