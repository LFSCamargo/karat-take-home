import { Link } from 'react-router';
import type { ReactNode } from 'react';

import {
  useMetricsQuery,
  useSpendBreakdownQuery,
  useTransactionsQuery,
} from '../hooks/dashboard-queries';

export function DashboardRoute() {
  const metrics = useMetricsQuery();
  const spendBreakdown = useSpendBreakdownQuery();
  const transactions = useTransactionsQuery();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 p-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-500">Card activity</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Stripe Card Dashboard
        </h1>
        <p className="text-slate-600">
          Recent card spend, lightweight metrics, and merchant category
          insights.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total spend"
          value={
            metrics.data ? `$${metrics.data.totalSpend.toFixed(2)}` : 'Loading'
          }
        />
        <MetricCard
          label="Transactions"
          value={
            metrics.data ? String(metrics.data.transactionCount) : 'Loading'
          }
        />
        <MetricCard
          label="Average amount"
          value={
            metrics.data
              ? `$${metrics.data.averageTransactionAmount.toFixed(2)}`
              : 'Loading'
          }
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <DashboardPanel title="Spend breakdown">
          {spendBreakdown.data?.length ? (
            <ul className="space-y-2">
              {spendBreakdown.data.map((item) => (
                <li
                  key={item.merchantCategory}
                  className="flex justify-between"
                >
                  <span>{item.merchantCategory}</span>
                  <span>${item.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No spend categories yet.</p>
          )}
        </DashboardPanel>

        <DashboardPanel title="Recent activity">
          {transactions.data?.items.length ? (
            <ul className="space-y-2">
              {transactions.data.items.map((transaction) => (
                <li key={transaction.id} className="flex justify-between">
                  <span>{transaction.merchantName}</span>
                  <span>${transaction.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          )}
          <Link
            className="mt-4 inline-flex text-sm font-medium text-slate-900"
            to="/transactions"
          >
            View all transactions
          </Link>
        </DashboardPanel>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function DashboardPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
