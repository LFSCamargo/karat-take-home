import type { RouteObject } from 'react-router';

import { AppShell } from './components/app-shell';
import { DashboardRoute } from './routes/dashboard.route';
import { TransactionDetailRoute } from './routes/transaction-details.route';
import { TransactionsRoute } from './routes/transactions.route';

export const DashboardRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardRoute />,
      },
      {
        path: '/transactions',
        element: <TransactionsRoute />,
      },
      {
        path: '/transactions/:transactionId',
        element: <TransactionDetailRoute />,
      },
    ],
  },
];
