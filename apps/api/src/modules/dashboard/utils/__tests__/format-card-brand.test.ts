import { describe, expect, it } from 'vitest';

import { formatCardBrand } from '../format-card-brand';

describe('formatCardBrand', () => {
  it('capitalizes known card brands', () => {
    expect(formatCardBrand('visa')).toBe('Visa');
    expect(formatCardBrand('mastercard')).toBe('Mastercard');
  });

  it('returns a fallback label when brand is missing', () => {
    expect(formatCardBrand(null)).toBe('Card');
  });
});
