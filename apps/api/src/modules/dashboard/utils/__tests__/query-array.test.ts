import { describe, expect, it } from 'vitest';

import { toStringArray } from '../query-array';

describe('toStringArray', () => {
  it('returns an empty array for undefined values', () => {
    expect(toStringArray(undefined)).toEqual([]);
  });

  it('wraps a single string in an array', () => {
    expect(toStringArray('approved')).toEqual(['approved']);
  });

  it('preserves string arrays from repeated query params', () => {
    expect(toStringArray(['restaurants', 'travel'])).toEqual([
      'restaurants',
      'travel',
    ]);
  });
});
