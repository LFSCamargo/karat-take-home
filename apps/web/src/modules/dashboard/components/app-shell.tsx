import { LayoutDashboard, Receipt } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { AppLogo } from '@web/components/app-logo';
import { ThemeToggle } from '@web/components/theme-toggle';
import { Separator } from '@web/components/ui/separator';
import { cn } from '@web/lib/utils';

import {
  CardholderFooterSummary,
  CardholderSummary,
} from './cardholder-summary';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
] as const;

export function AppShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,var(--secondary),transparent_28rem),var(--background)]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-8">
            <NavLink
              aria-label="Card Dashboard home"
              className="group flex items-center gap-3"
              to="/dashboard"
            >
              <div className="flex items-center flex-col justify-center">
                <AppLogo className="h-5 w-auto transition-transform group-hover:scale-105" />
                <p className="text-xs text-muted-foreground">Challenge demo</p>
              </div>
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                    )
                  }
                  to={to}
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CardholderSummary />
          </div>
        </div>

        <div className="border-t border-border/60 px-6 py-2 md:hidden">
          <nav className="flex gap-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground',
                  )
                }
                to={to}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Demo cardholder view for the Stripe Issuing challenge.</p>
          <CardholderFooterSummary />
        </div>
        <Separator />
      </footer>
    </div>
  );
}
