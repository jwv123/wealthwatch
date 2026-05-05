import { signal, computed } from '@angular/core';

export type PeriodScope = 'month' | 'year' | 'all';

export interface CategorySummary {
  name: string;
  color: string;
  total: number;
  type: string;
}

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  byCategory: CategorySummary[];
  year: number | null;
}

export interface MonthlyData {
  year: number | null;
  months: { month: string; income: number; expenses: number }[];
}

interface DashboardState {
  scope: PeriodScope;
  selectedYear: number;
  selectedMonth: number;
  summary: SummaryData | null;
  monthly: MonthlyData | null;
  isLoading: boolean;
  error: string | null;
}

const now = new Date();
const initialState: DashboardState = {
  scope: 'year',
  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth(),
  summary: null,
  monthly: null,
  isLoading: false,
  error: null,
};

const _state = signal<DashboardState>(initialState);

export const DashboardStore = {
  scope: computed(() => _state().scope),
  selectedYear: computed(() => _state().selectedYear),
  selectedMonth: computed(() => _state().selectedMonth),
  summary: computed(() => _state().summary),
  monthly: computed(() => _state().monthly),
  isLoading: computed(() => _state().isLoading),
  error: computed(() => _state().error),

  dateFrom: computed(() => {
    const { scope, selectedYear, selectedMonth } = _state();
    if (scope === 'all') return null;
    if (scope === 'year') return `${selectedYear}-01-01`;
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
  }),

  dateTo: computed(() => {
    const { scope, selectedYear, selectedMonth } = _state();
    if (scope === 'all') return null;
    if (scope === 'year') return `${selectedYear}-12-31`;
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }),

  setScope: (scope: PeriodScope) =>
    _state.update((s) => ({ ...s, scope })),

  setYear: (year: number) =>
    _state.update((s) => ({ ...s, selectedYear: year })),

  setMonth: (month: number) =>
    _state.update((s) => ({ ...s, selectedMonth: month })),

  setSummary: (summary: SummaryData) =>
    _state.update((s) => ({ ...s, summary, isLoading: false })),

  setMonthly: (monthly: MonthlyData) =>
    _state.update((s) => ({ ...s, monthly, isLoading: false })),

  setLoading: (isLoading: boolean) =>
    _state.update((s) => ({ ...s, isLoading })),

  setError: (error: string | null) =>
    _state.update((s) => ({ ...s, error })),

  reset: () => _state.set(initialState),
};