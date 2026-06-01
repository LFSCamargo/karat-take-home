import { describe, expect, it } from 'vitest';

import { formatPrimaryCardLabel, getFirstName } from './cardholder-display';

describe('cardholder-display', () => {
  it('extracts the first name for greetings', () => {
    expect(getFirstName('Alex Rivera')).toBe('Alex');
    expect(getFirstName(null)).toBe('there');
  });

  it('formats the primary card label', () => {
    expect(
      formatPrimaryCardLabel({
        brand: 'Visa',
        last4: '4242',
        status: 'active',
      }),
    ).toBe('Visa ···· 4242');
  });
});
