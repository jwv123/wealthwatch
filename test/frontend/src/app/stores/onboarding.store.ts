import { signal, computed } from '@angular/core';

const STORAGE_KEY = 'ww-onboarding-completed';

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  hasCompleted: boolean;
}

function getInitialCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

const _state = signal<OnboardingState>({
  isActive: false,
  currentStep: 0,
  totalSteps: 8,
  hasCompleted: getInitialCompleted(),
});

export const OnboardingStore = {
  isActive: computed(() => _state().isActive),
  currentStep: computed(() => _state().currentStep),
  totalSteps: computed(() => _state().totalSteps),
  hasCompleted: computed(() => _state().hasCompleted),

  start(): void {
    _state.update((s) => ({
      ...s,
      isActive: true,
      currentStep: 0,
      hasCompleted: false,
    }));
    localStorage.removeItem(STORAGE_KEY);
  },

  next(): void {
    _state.update((s) => {
      const nextStep = s.currentStep + 1;
      if (nextStep >= s.totalSteps) {
        localStorage.setItem(STORAGE_KEY, 'true');
        return { ...s, isActive: false, currentStep: 0, hasCompleted: true };
      }
      return { ...s, currentStep: nextStep };
    });
  },

  prev(): void {
    _state.update((s) => ({
      ...s,
      currentStep: Math.max(0, s.currentStep - 1),
    }));
  },

  skip(): void {
    localStorage.setItem(STORAGE_KEY, 'true');
    _state.update((s) => ({
      ...s,
      isActive: false,
      currentStep: 0,
      hasCompleted: true,
    }));
  },
};