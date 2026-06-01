import { CreditCard, LayoutDashboard, Receipt } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { Separator } from '@web/components/ui/separator';
import { cn } from '@web/lib/utils';

import { fakeUser } from '../api/mock-data';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
] as const;

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-8">
            <NavLink className="group flex items-center gap-3" to="/dashboard">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                <CreditCard className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  Card Dashboard
                </p>
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

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{fakeUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {fakeUser.cardBrand} •••• {fakeUser.cardLast4}
              </p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
              {fakeUser.name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </div>
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
          <p>Signed in as {fakeUser.email}</p>
        </div>
        <Separator />
      </footer>
    </div>
  );
}
