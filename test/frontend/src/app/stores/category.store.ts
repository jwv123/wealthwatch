import { signal, computed } from '@angular/core';
import { Category } from '../shared/models/category.model';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

const _state = signal<CategoryState>(initialState);

export const CategoryStore = {
  categories: computed(() => _state().categories),
  isLoading: computed(() => _state().isLoading),
  error: computed(() => _state().error),

  incomeCategories: computed(() =>
    _state().categories.filter((c) => c.type === 'income')
  ),

  expenseCategories: computed(() =>
    _state().categories.filter((c) => c.type === 'expense')
  ),

  byId: computed(() => {
    const map = new Map<string, Category>();
    _state().categories.forEach((c) => map.set(c.id, c));
    return map;
  }),

  setCategories: (categories: Category[]) =>
    _state.update((s) => ({ ...s, categories, isLoading: false })),

  addCategory: (category: Category) =>
    _state.update((s) => ({
      ...s,
      categories: [...s.categories, category],
    })),

  updateCategory: (id: string, updates: Partial<Category>) =>
    _state.update((s) => ({
      ...s,
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeCategory: (id: string) =>
    _state.update((s) => ({
      ...s,
      categories: s.categories.filter((c) => c.id !== id),
    })),

  setLoading: (isLoading: boolean) =>
    _state.update((s) => ({ ...s, isLoading })),

  setError: (error: string | null) =>
    _state.update((s) => ({ ...s, error })),

  reset: () => _state.set(initialState),
};