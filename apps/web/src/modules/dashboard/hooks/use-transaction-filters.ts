import { useSearchParams } from 'react-router';

export function useTransactionFilters() {
  const [searchParams] = useSearchParams();

  return {
    page: Number(searchParams.get('page') ?? '1'),
    pageSize: Number(searchParams.get('pageSize') ?? '8'),
    merchant: searchParams.get('merchant') ?? undefined,
    merchantCategories: searchParams.getAll('merchantCategory'),
    statuses: searchParams.getAll('status'),
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  };
}
