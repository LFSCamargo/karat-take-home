import { Search, X } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';

import { transactionStatuses } from '../api/mock-data';
import { useMerchantCategoriesQuery } from '../hooks/dashboard-queries';
import { formatCategoryLabel } from '../utils/format';
import { MultiSelectFilter } from './multi-select-filter';

function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium leading-none text-foreground"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function TransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const merchantCategoriesQuery = useMerchantCategoriesQuery();

  const merchantCategoryOptions = useMemo(
    () => merchantCategoriesQuery.data?.items.map((item) => item.value) ?? [],
    [merchantCategoriesQuery.data?.items],
  );

  const merchant = searchParams.get('merchant') ?? '';
  const selectedCategories = searchParams.getAll('merchantCategory');
  const selectedStatuses = searchParams.getAll('status');

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    next.set('page', '1');
    setSearchParams(next);
  }

  function updateMultiParam(key: string, values: string[]) {
    const next = new URLSearchParams(searchParams);
    next.delete(key);

    for (const value of values) {
      next.append(key, value);
    }

    next.set('page', '1');
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({ page: '1' });
  }

  const hasFilters = Boolean(
    merchant || selectedCategories.length || selectedStatuses.length,
  );

  return (
    <div className="grid gap-4 rounded-xl border border-border/70 bg-card/80 p-4 backdrop-blur-sm lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))_auto] lg:items-end">
      <FilterField htmlFor="merchant-filter" label="Merchant">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="merchant-filter"
            className="pl-9"
            placeholder="Search by merchant name"
            value={merchant}
            onChange={(event) => updateParam('merchant', event.target.value)}
          />
        </div>
      </FilterField>

      <MultiSelectFilter
        ariaLabel="Category"
        emptyLabel="All categories"
        formatOption={formatCategoryLabel}
        label="Category"
        options={merchantCategoryOptions}
        selected={selectedCategories}
        onChange={(values) => updateMultiParam('merchantCategory', values)}
      />

      <MultiSelectFilter
        ariaLabel="Status"
        emptyLabel="All statuses"
        formatOption={formatStatusLabel}
        label="Status"
        options={transactionStatuses}
        selected={selectedStatuses}
        onChange={(values) => updateMultiParam('status', values)}
      />

      <Button
        disabled={!hasFilters}
        type="button"
        variant="outline"
        onClick={clearFilters}
      >
        <X className="size-4" />
        Clear
      </Button>
    </div>
  );
}
