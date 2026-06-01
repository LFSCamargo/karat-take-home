import type {
  DashboardMetrics,
  SpendBreakdownItem,
  Transaction,
} from './types';

export const fakeUser = {
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  cardLast4: '4242',
  cardBrand: 'Visa',
  memberSince: '2024-03-12',
} as const;

const now = new Date();

function daysAgo(days: number, hour = 12): string {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_01',
    amount: 84.5,
    currency: 'usd',
    merchantName: 'Blue Bottle Coffee',
    merchantCategory: 'restaurants',
    status: 'approved',
    authorizedAt: daysAgo(0, 8),
    postedAt: daysAgo(0, 9),
  },
  {
    id: 'txn_02',
    amount: 312.0,
    currency: 'usd',
    merchantName: 'United Airlines',
    merchantCategory: 'travel',
    status: 'approved',
    authorizedAt: daysAgo(1, 14),
    postedAt: daysAgo(1, 16),
  },
  {
    id: 'txn_03',
    amount: 46.18,
    currency: 'usd',
    merchantName: 'Whole Foods Market',
    merchantCategory: 'groceries',
    status: 'approved',
    authorizedAt: daysAgo(2, 18),
    postedAt: daysAgo(2, 19),
  },
  {
    id: 'txn_04',
    amount: 19.99,
    currency: 'usd',
    merchantName: 'Spotify',
    merchantCategory: 'software',
    status: 'approved',
    authorizedAt: daysAgo(3, 10),
    postedAt: daysAgo(3, 10),
  },
  {
    id: 'txn_05',
    amount: 128.4,
    currency: 'usd',
    merchantName: 'Shell',
    merchantCategory: 'fuel',
    status: 'approved',
    authorizedAt: daysAgo(4, 7),
    postedAt: daysAgo(4, 8),
  },
  {
    id: 'txn_06',
    amount: 62.75,
    currency: 'usd',
    merchantName: 'Nobu',
    merchantCategory: 'restaurants',
    status: 'approved',
    authorizedAt: daysAgo(5, 20),
    postedAt: daysAgo(5, 21),
  },
  {
    id: 'txn_07',
    amount: 540.0,
    currency: 'usd',
    merchantName: 'Marriott Hotels',
    merchantCategory: 'travel',
    status: 'pending',
    authorizedAt: daysAgo(6, 15),
    postedAt: null,
  },
  {
    id: 'txn_08',
    amount: 24.5,
    currency: 'usd',
    merchantName: 'AMC Theatres',
    merchantCategory: 'entertainment',
    status: 'approved',
    authorizedAt: daysAgo(7, 19),
    postedAt: daysAgo(7, 20),
  },
  {
    id: 'txn_09',
    amount: 899.0,
    currency: 'usd',
    merchantName: 'Apple Store',
    merchantCategory: 'software',
    status: 'declined',
    authorizedAt: daysAgo(8, 11),
    postedAt: null,
  },
  {
    id: 'txn_10',
    amount: 37.2,
    currency: 'usd',
    merchantName: "Trader Joe's",
    merchantCategory: 'groceries',
    status: 'approved',
    authorizedAt: daysAgo(9, 17),
    postedAt: daysAgo(9, 18),
  },
  {
    id: 'txn_11',
    amount: 156.0,
    currency: 'usd',
    merchantName: 'Delta Air Lines',
    merchantCategory: 'travel',
    status: 'approved',
    authorizedAt: daysAgo(11, 6),
    postedAt: daysAgo(11, 8),
  },
  {
    id: 'txn_12',
    amount: 12.4,
    currency: 'usd',
    merchantName: 'Sweetgreen',
    merchantCategory: 'restaurants',
    status: 'approved',
    authorizedAt: daysAgo(12, 12),
    postedAt: daysAgo(12, 13),
  },
];

const spendable = mockTransactions.filter((txn) => txn.status === 'approved');

export const mockMetrics: DashboardMetrics = {
  totalSpend: spendable.reduce((sum, txn) => sum + txn.amount, 0),
  transactionCount: spendable.length,
  averageTransactionAmount:
    spendable.reduce((sum, txn) => sum + txn.amount, 0) / spendable.length,
  latestActivityAt: mockTransactions[0]?.authorizedAt ?? null,
  currency: 'usd',
};

function buildSpendBreakdown(): SpendBreakdownItem[] {
  const totals = new Map<string, number>();

  for (const txn of spendable) {
    totals.set(
      txn.merchantCategory,
      (totals.get(txn.merchantCategory) ?? 0) + txn.amount,
    );
  }

  const grandTotal = [...totals.values()].reduce(
    (sum, amount) => sum + amount,
    0,
  );

  return [...totals.entries()]
    .map(([merchantCategory, amount]) => ({
      merchantCategory,
      amount,
      currency: 'usd',
      percentage: grandTotal ? (amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export const mockSpendBreakdown = buildSpendBreakdown();

export const merchantCategories = [
  ...new Set(mockTransactions.map((txn) => txn.merchantCategory)),
].sort();

export const transactionStatuses = [
  ...new Set(mockTransactions.map((txn) => txn.status)),
].sort();
