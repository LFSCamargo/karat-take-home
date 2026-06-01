export const dashboardEndpoints = {
  metrics: '/api/metrics',
  cardholder: '/api/cardholder',
  merchantCategories: '/api/merchant-categories',
  spendBreakdown: '/api/spend/breakdown',
  transactions: '/api/transactions',
  transaction: (id: string) => `/api/transactions/${id}`,
} as const;
