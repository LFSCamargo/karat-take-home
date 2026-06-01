import type { ChartConfig } from '@web/components/ui/chart';

import type { SpendBreakdownItem } from '../api/types';
import { formatCategoryLabel } from './format';

const SPEND_CHART_PALETTE = [
  {
    theme: {
      light: 'oklch(0.62 0.18 255)',
      dark: 'oklch(0.68 0.16 255)',
    },
  },
  {
    theme: {
      light: 'oklch(0.68 0.14 190)',
      dark: 'oklch(0.72 0.14 190)',
    },
  },
  {
    theme: {
      light: 'oklch(0.72 0.16 145)',
      dark: 'oklch(0.76 0.14 145)',
    },
  },
  {
    theme: {
      light: 'oklch(0.76 0.15 75)',
      dark: 'oklch(0.78 0.14 75)',
    },
  },
  {
    theme: {
      light: 'oklch(0.64 0.18 25)',
      dark: 'oklch(0.68 0.17 25)',
    },
  },
  {
    theme: {
      light: 'oklch(0.58 0.16 310)',
      dark: 'oklch(0.64 0.15 310)',
    },
  },
  {
    theme: {
      light: 'oklch(0.7 0.12 220)',
      dark: 'oklch(0.74 0.11 220)',
    },
  },
  {
    theme: {
      light: 'oklch(0.66 0.14 55)',
      dark: 'oklch(0.72 0.13 55)',
    },
  },
] as const;

export function getCategoryColorToken(category: string, index: number) {
  const paletteIndex =
    index >= 0
      ? index % SPEND_CHART_PALETTE.length
      : hashCategory(category) % SPEND_CHART_PALETTE.length;

  return {
    cssVar: `--color-${category}`,
    palette: SPEND_CHART_PALETTE[paletteIndex],
  };
}

export function buildSpendBreakdownChartConfig(
  items: SpendBreakdownItem[],
): ChartConfig {
  return Object.fromEntries(
    items.map((item, index) => {
      const { palette } = getCategoryColorToken(item.merchantCategory, index);

      return [
        item.merchantCategory,
        {
          label: formatCategoryLabel(item.merchantCategory),
          theme: palette.theme,
        },
      ];
    }),
  );
}

function hashCategory(category: string) {
  let hash = 0;

  for (let index = 0; index < category.length; index += 1) {
    hash = (hash + category.charCodeAt(index)) % SPEND_CHART_PALETTE.length;
  }

  return Math.abs(hash);
}
