import { describe, expect, it } from 'vitest';

import type { SpendBreakdownItem } from '../api/types';
import {
  buildSpendBreakdownChartConfig,
  getCategoryColorToken,
} from './chart-colors';

const sampleItems: SpendBreakdownItem[] = [
  {
    merchantCategory: 'fast_food_restaurants',
    amount: 42,
    currency: 'usd',
    percentage: 60,
  },
  {
    merchantCategory: 'airlines_air_carriers',
    amount: 28,
    currency: 'usd',
    percentage: 40,
  },
];

describe('chart-colors', () => {
  it('builds chart config for arbitrary Stripe merchant categories', () => {
    const config = buildSpendBreakdownChartConfig(sampleItems);

    expect(config.fast_food_restaurants).toEqual({
      label: 'Fast Food Restaurants',
      theme: expect.objectContaining({
        light: expect.stringContaining('oklch'),
        dark: expect.stringContaining('oklch'),
      }),
    });
    expect(config.airlines_air_carriers?.theme?.light).toContain('oklch');
  });

  it('returns stable css var tokens per category', () => {
    expect(getCategoryColorToken('travel', 0).cssVar).toBe('--color-travel');
    expect(getCategoryColorToken('travel', 0).palette.theme.light).toContain(
      'oklch',
    );
  });
});
