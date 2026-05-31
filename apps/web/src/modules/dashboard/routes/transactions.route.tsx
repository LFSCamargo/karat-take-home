import { Link } from 'react-router';

import { useTransactionsQuery } from '../hooks/dashboard-queries';

export function TransactionsRoute() {
  const transactions = useTransactionsQuery();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header>
        <Link className="text-sm text-slate-500" to="/dashboard">
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Transactions
        </h1>
      </header>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">Merchant</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.data?.items.length ? (
              transactions.data.items.map((transaction) => (
                <tr key={transaction.id} className="border-t">
                  <td className="p-4">
                    <Link to={`/transactions/${transaction.id}`}>
                      {transaction.merchantName}
                    </Link>
                  </td>
                  <td className="p-4">{transaction.merchantCategory}</td>
                  <td className="p-4">{transaction.status}</td>
                  <td className="p-4 text-right">
                    ${transaction.amount.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-slate-500" colSpan={4}>
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
