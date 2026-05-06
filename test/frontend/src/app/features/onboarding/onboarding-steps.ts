export type TooltipPosition = 'right' | 'bottom' | 'left' | 'center';

export interface OnboardingStep {
  target: string | null;
  title: string;
  description: string;
  position: TooltipPosition;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    target: null,
    title: 'Welcome to WealthWatch!',
    description:
      'WealthWatch helps you track income, expenses, and budgets in one place. Let us quickly show you around the app. You can skip at any time.',
    position: 'center',
  },
  {
    target: 'a[routerLink="/dashboard"]',
    title: 'Dashboard',
    description:
      'Your financial overview at a glance. See your net balance, income vs. expenses charts, and recent transactions all in one place.',
    position: 'right',
  },
  {
    target: 'a[routerLink="/transactions"]',
    title: 'Transactions',
    description:
      'Add, edit, and review all your income and expense transactions. Filter by date, category, or type to find what you need.',
    position: 'right',
  },
  {
    target: 'a[routerLink="/accounts"]',
    title: 'Accounts',
    description:
      'Manage your bank accounts, savings, and wallets. Track balances across multiple accounts and transfer money between them instantly.',
    position: 'right',
  },
  {
    target: 'a[routerLink="/calendar"]',
    title: 'Calendar',
    description:
      'View your transactions on a calendar timeline. See spending patterns across the month at a glance.',
    position: 'right',
  },
  {
    target: 'a[routerLink="/categories"]',
    title: 'Categories',
    description:
      'Organize your transactions with custom categories. Group spending by type so you can see exactly where your money goes.',
    position: 'right',
  },
  {
    target: 'a[routerLink="/settings"]',
    title: 'Settings',
    description:
      'Customize WealthWatch to your preference. Change the theme, set your default currency, and manage your account.',
    position: 'right',
  },
];