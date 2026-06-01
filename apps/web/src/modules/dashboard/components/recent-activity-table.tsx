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
import {
  CategoryBadge,
  TransactionStatusBadge,
} from './transaction-status-badge';
import { formatCurrency, formatDate } from '../utils/format';

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
    <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Latest card authorizations from your demo account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <p className="text-sm text-destructive">
            Recent activity could not be loaded.
          </p>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : null}

        {!isLoading && !isError && items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    <Link
                      className="transition-colors hover:text-primary"
                      to={`/transactions/${transaction.id}`}
                    >
                      {transaction.merchantName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={transaction.merchantCategory} />
                  </TableCell>
                  <TableCell>
                    <TransactionStatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(transaction.authorizedAt)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline">
          <Link to="/transactions">
            View all transactions
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
