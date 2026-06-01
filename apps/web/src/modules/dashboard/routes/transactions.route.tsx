import { TransactionFilters } from '../components/transaction-filters';
import { TransactionsTable } from '../components/transactions-table';
import { useTransactionFilters } from '../hooks/use-transaction-filters';
import { useTransactionsQuery } from '../hooks/dashboard-queries';

export function TransactionsRoute() {
  const filters = useTransactionFilters();
  const transactions = useTransactionsQuery(filters);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <section className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Activity feed
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Search, filter, and paginate through card activity for your demo
            account.
          </p>
        </div>
      </section>

      <TransactionFilters />

      <TransactionsTable
        data={transactions.data}
        isError={transactions.isError}
        isLoading={transactions.isLoading}
      />
    </main>
  );
}
