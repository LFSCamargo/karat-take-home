import { Link, useSearchParams } from 'react-router';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@web/components/ui/pagination';
import { Skeleton } from '@web/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@web/components/ui/table';

import type { PaginatedTransactions } from '../api/api-client';
import {
  CategoryBadge,
  TransactionStatusBadge,
} from './transaction-status-badge';
import { formatCurrency, formatDate } from '../utils/format';

type TransactionsTableProps = {
  isLoading: boolean;
  isError: boolean;
  data?: PaginatedTransactions;
};

export function TransactionsTable({
  isLoading,
  isError,
  data,
}: TransactionsTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = data?.page ?? 1;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-3 rounded-xl border border-border/70 bg-card/80 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Transactions could not be loaded.
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card/80 p-10 text-center">
        <p className="text-lg font-medium">No matching transactions</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card/80 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Authorized</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((transaction) => (
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
                <TableCell className="text-muted-foreground">
                  {formatDate(transaction.postedAt)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {data.items.length} of {data.total} transactions
        </p>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className={
                  currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                }
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage > 1) {
                    goToPage(currentPage - 1);
                  }
                }}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(event) => {
                      event.preventDefault();
                      goToPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                className={
                  currentPage >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage < totalPages) {
                    goToPage(currentPage + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
