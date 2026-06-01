import { ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@web/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { cn } from '@web/lib/utils';

type MultiSelectFilterProps = {
  label: string;
  ariaLabel: string;
  options: readonly string[];
  selected: string[];
  emptyLabel: string;
  formatOption: (value: string) => string;
  onChange: (values: string[]) => void;
  className?: string;
};

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium leading-none text-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function getSelectionLabel(
  selected: string[],
  emptyLabel: string,
  formatOption: (value: string) => string,
): string {
  if (selected.length === 0) {
    return emptyLabel;
  }

  if (selected.length === 1) {
    return formatOption(selected[0]!);
  }

  return `${selected.length} selected`;
}

export function MultiSelectFilter({
  label,
  ariaLabel,
  options,
  selected,
  emptyLabel,
  formatOption,
  onChange,
  className,
}: MultiSelectFilterProps) {
  function toggleValue(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  }

  return (
    <FilterField label={label}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={ariaLabel}
            className={cn(
              'w-full justify-between font-normal',
              selected.length === 0 && 'text-muted-foreground',
              className,
            )}
            type="button"
            variant="outline"
          >
            <span className="truncate">
              {getSelectionLabel(selected, emptyLabel, formatOption)}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selected.includes(option)}
              onCheckedChange={() => toggleValue(option)}
              onSelect={(event) => event.preventDefault()}
            >
              {formatOption(option)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </FilterField>
  );
}
