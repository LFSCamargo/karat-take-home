import { Link, useParams } from 'react-router';

import { useTransactionDetailQuery } from '../hooks/dashboard-queries';

export function TransactionDetailRoute() {
  const { transactionId } = useParams();
  const transaction = useTransactionDetailQuery(transactionId ?? '');

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link className="text-sm text-slate-500" to="/transactions">
        Back to transactions
      </Link>
      <section className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Transaction detail</h1>
        {transaction.data ? (
          <dl className="mt-6 grid gap-3 text-sm">
            <Detail label="Merchant" value={transaction.data.merchantName} />
            <Detail
              label="Category"
              value={transaction.data.merchantCategory}
            />
            <Detail label="Status" value={transaction.data.status} />
            <Detail
              label="Amount"
              value={`$${transaction.data.amount.toFixed(2)}`}
            />
          </dl>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Transaction details are not available yet.
          </p>
        )}
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
