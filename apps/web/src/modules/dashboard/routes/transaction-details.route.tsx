import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import { Button } from '@web/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card';
import { Separator } from '@web/components/ui/separator';
import { Skeleton } from '@web/components/ui/skeleton';

import { fakeUser } from '../api/mock-data';
import {
  CategoryBadge,
  TransactionStatusBadge,
} from '../components/transaction-status-badge';
import { useTransactionDetailQuery } from '../hooks/dashboard-queries';
import { formatCurrency, formatDate } from '../utils/format';

export function TransactionDetailRoute() {
  const { transactionId } = useParams();
  const transaction = useTransactionDetailQuery(transactionId ?? '');

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Button asChild className="mb-6 w-fit" size="sm" variant="ghost">
        <Link to="/transactions">
          <ArrowLeft className="size-4" />
          Back to transactions
        </Link>
      </Button>

      <Card className="overflow-hidden border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader className="border-b border-border/60 bg-secondary/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardDescription>Transaction detail</CardDescription>
              <CardTitle className="text-3xl tracking-tight">
                {transaction.isLoading ? (
                  <Skeleton className="h-9 w-56" />
                ) : (
                  (transaction.data?.merchantName ?? 'Transaction')
                )}
              </CardTitle>
            </div>

            {transaction.data ? (
              <TransactionStatusBadge status={transaction.data.status} />
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {transaction.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : null}

          {transaction.isError ? (
            <p className="text-sm text-destructive">
              This transaction could not be found for {fakeUser.name}.
            </p>
          ) : null}

          {transaction.data ? (
            <>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-6">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">
                  {formatCurrency(
                    transaction.data.amount,
                    transaction.data.currency,
                  )}
                </p>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Merchant" value={transaction.data.merchantName} />
                <DetailItem
                  label="Category"
                  value={
                    <CategoryBadge category={transaction.data.merchantCategory} />
                  }
                />
                <DetailItem
                  label="Status"
                  value={
                    <TransactionStatusBadge status={transaction.data.status} />
                  }
                />
                <DetailItem
                  label="Currency"
                  value={transaction.data.currency.toUpperCase()}
                />
                <DetailItem
                  label="Authorized at"
                  value={formatDate(transaction.data.authorizedAt)}
                />
                <DetailItem
                  label="Posted at"
                  value={formatDate(transaction.data.postedAt)}
                />
              </dl>

              <Separator />

              <div className="rounded-xl bg-secondary/30 p-4 text-sm text-muted-foreground">
                Card ending in {fakeUser.cardLast4} · {fakeUser.cardBrand} ·{' '}
                {fakeUser.email}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-medium">{value}</dd>
    </div>
  );
}
