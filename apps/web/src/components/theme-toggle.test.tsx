import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { themeStorageKey } from './theme.constants';
import { ThemeProvider } from './theme-provider';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('renders the theme toggle control', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(
      await screen.findByRole('button', { name: 'Toggle theme' }),
    ).toBeInTheDocument();
  });
});

describe('theme bootstrap script contract', () => {
  it('uses the same storage key as ThemeProvider', () => {
    expect(themeStorageKey).toBe('stripe-card-dashboard-theme');
  });
});
