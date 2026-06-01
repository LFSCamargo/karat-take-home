import type { SpendBreakdownQuery, TransactionListQuery } from './types';

export function getMerchantCategories(query: TransactionListQuery): string[] {
  if (query.merchantCategories?.length) {
    return query.merchantCategories;
  }

  if (!query.merchantCategory) {
    return [];
  }

  return Array.isArray(query.merchantCategory)
    ? query.merchantCategory
    : [query.merchantCategory];
}

export function getStatuses(query: TransactionListQuery): string[] {
  if (query.statuses?.length) {
    return query.statuses;
  }

  if (!query.status) {
    return [];
  }

  return Array.isArray(query.status) ? query.status : [query.status];
}

export function buildTransactionsQuery(query: TransactionListQuery): string {
  const params = new URLSearchParams();

  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));

  if (query.merchant) {
    params.set('merchant', query.merchant);
  }

  for (const category of getMerchantCategories(query)) {
    params.append('merchantCategory', category);
  }

  for (const status of getStatuses(query)) {
    params.append('status', status);
  }

  if (query.from) {
    params.set('from', query.from);
  }

  if (query.to) {
    params.set('to', query.to);
  }

  return params.toString();
}

export function buildSpendBreakdownQuery(
  query: SpendBreakdownQuery = {},
): string {
  const params = new URLSearchParams();

  if (query.from) {
    params.set('from', query.from);
  }

  if (query.to) {
    params.set('to', query.to);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}
