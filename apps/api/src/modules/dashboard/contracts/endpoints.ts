export const dashboardEndpoints = {
  metrics: '/api/metrics',
  spendBreakdown: '/api/spend/breakdown',
  transactions: '/api/transactions',
  transaction: (id: string) => `/api/transactions/${id}`,
} as const;
