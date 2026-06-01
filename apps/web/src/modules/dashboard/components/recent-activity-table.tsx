import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@web/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@web/components/ui/card';
import { Skeleton } from '@web/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@web/components/ui/table';

import type { Transaction } from '../api/api-client';
import { TransactionStatusBadge } from './transaction-status-badge';
import { formatCurrency } from '../utils/format';

type RecentActivityTableProps = {
  isLoading: boolean;
  isError: boolean;
  items?: Transaction[];
};

export function RecentActivityTable({
  isLoading,
  isError,
  items = [],
}: RecentActivityTableProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-3xl border-border/70 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur-sm">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-secondary/50 to-transparent pb-5">
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Latest card authorizations from your demo account.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        {isLoading ? (
          <div className="space-y-3 px-6 py-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <p className="px-6 py-6 text-sm text-destructive">
            Recent activity could not be loaded.
          </p>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <p className="px-6 py-6 text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : null}

        {!isLoading && !isError && items.length > 0 ? (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[52%] pl-6">Merchant</TableHead>
                <TableHead className="w-[22%]">Status</TableHead>
                <TableHead className="w-[26%] pr-6 text-right">
                  Amount
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="transition-colors hover:bg-secondary/40"
                >
                  <TableCell className="truncate pl-6 font-medium">
                    <Link
                      className="transition-colors hover:text-primary hover:underline"
                      to={`/transactions/${transaction.id}`}
                    >
                      {transaction.merchantName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right font-medium">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
      <CardFooter className="border-t border-border/50 bg-secondary/20 py-4">
        <Button asChild className="rounded-full" variant="outline">
          <Link to="/transactions">
            View all transactions
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
