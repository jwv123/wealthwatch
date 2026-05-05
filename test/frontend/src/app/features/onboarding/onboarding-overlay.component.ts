import {
  Component,
  NgZone,
  OnDestroy,
  signal,
  effect,
  inject,
} from '@angular/core';
import { OnboardingStore } from '../../stores/onboarding.store';
import { ONBOARDING_STEPS, OnboardingStep } from './onboarding-steps';
import { overlayFade, tooltipSlide, spotlightPulse } from './onboarding.animations';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Component({
  selector: 'ww-onboarding-overlay',
  standalone: true,
  animations: [overlayFade, tooltipSlide, spotlightPulse],
  template: `
    @if (OnboardingStore.isActive()) {
    <div class="onboarding-overlay" [@overlayFade]>
      @if (spotlightRect()) {
        <div class="onboarding-spotlight"
             [style.top.px]="spotlightRect()!.top"
             [style.left.px]="spotlightRect()!.left"
             [style.width.px]="spotlightRect()!.width"
             [style.height.px]="spotlightRect()!.height"
             [@spotlightPulse]="OnboardingStore.currentStep()">
        </div>
      }

      <div class="onboarding-tooltip"
           [class.onboarding-tooltip--center]="currentStep().position === 'center'"
           [style.top.px]="currentStep().position !== 'center' ? tooltipPos().top : null"
           [style.left.px]="currentStep().position !== 'center' ? tooltipPos().left : null"
           [@tooltipSlide]="OnboardingStore.currentStep()">
        <div class="onboarding-tooltip__counter">
          {{ OnboardingStore.currentStep() + 1 }} / {{ OnboardingStore.totalSteps() }}
        </div>
        <h3 class="onboarding-tooltip__title">{{ currentStep().title }}</h3>
        <p class="onboarding-tooltip__description">{{ currentStep().description }}</p>
        <div class="onboarding-tooltip__actions">
          @if (OnboardingStore.currentStep() > 0) {
            <button class="onboarding-tooltip__btn onboarding-tooltip__btn--prev"
                    (click)="OnboardingStore.prev()">
              Previous
            </button>
          }
          <button class="onboarding-tooltip__btn onboarding-tooltip__btn--skip"
                  (click)="OnboardingStore.skip()">
            Skip
          </button>
          <button class="ww-btn ww-btn-primary onboarding-tooltip__btn onboarding-tooltip__btn--next"
                  (click)="OnboardingStore.next()">
            {{ isLastStep() ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    .onboarding-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
    }
    .onboarding-spotlight {
      position: absolute;
      border-radius: 4px;
      z-index: 10001;
      pointer-events: none;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 3px var(--ww-blue);
      transition: top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease;
    }
    .onboarding-tooltip {
      position: absolute;
      z-index: 10002;
      width: 300px;
      background: var(--ww-bg-card);
      border: 1px solid var(--ww-glass-border);
      border-radius: var(--ww-radius);
      box-shadow: var(--ww-glass-shadow);
      padding: 1.25rem;
    }
    .onboarding-tooltip--center {
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%);
      width: 360px;
    }
    .onboarding-tooltip__counter {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--ww-blue);
      margin-bottom: 0.5rem;
    }
    .onboarding-tooltip__title {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }
    .onboarding-tooltip__description {
      font-size: 0.875rem;
      color: var(--ww-text-main);
      line-height: 1.5;
      margin-bottom: 1rem;
    }
    .onboarding-tooltip__actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      align-items: center;
    }
    .onboarding-tooltip__btn {
      font-family: var(--ww-font-body);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .onboarding-tooltip__btn--prev {
      background: transparent;
      border: 1px solid var(--ww-border);
      color: var(--ww-text-main);
      padding: 0.5rem 0.875rem;
      border-radius: var(--ww-radius);
      font-size: 0.8125rem;
    }
    .onboarding-tooltip__btn--prev:hover {
      border-color: var(--ww-blue);
      color: var(--ww-blue);
    }
    .onboarding-tooltip__btn--skip {
      background: transparent;
      border: none;
      color: var(--ww-text-main);
      padding: 0.5rem 0.875rem;
      font-size: 0.8125rem;
      opacity: 0.7;
      margin-right: auto;
    }
    .onboarding-tooltip__btn--skip:hover {
      opacity: 1;
    }
    .onboarding-tooltip__btn--next {
      padding: 0.5rem 1rem;
    }
    @media (max-width: 768px) {
      .onboarding-tooltip {
        width: calc(100vw - 2rem);
        max-width: 300px;
      }
      .onboarding-tooltip--center {
        width: calc(100vw - 2rem);
        max-width: 340px;
      }
    }
  `],
})
export class OnboardingOverlayComponent implements OnDestroy {
  OnboardingStore = OnboardingStore;

  spotlightRect = signal<Rect | null>(null);
  tooltipPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });
  isLastStep = signal(false);
  currentStep = signal<OnboardingStep>(ONBOARDING_STEPS[0]);

  private zone = inject(NgZone);
  private resizeHandler = () => {
    const stepIndex = OnboardingStore.currentStep();
    const step = ONBOARDING_STEPS[stepIndex];
    if (step.target) {
      this.zone.run(() => this.computePositions(step));
    }
  };

  constructor() {
    effect(() => {
      const stepIndex = OnboardingStore.currentStep();
      const step = ONBOARDING_STEPS[stepIndex];
      this.currentStep.set(step);
      this.isLastStep.set(stepIndex === OnboardingStore.totalSteps() - 1);

      if (step.target) {
        this.computePositions(step);
      } else {
        this.spotlightRect.set(null);
        this.tooltipPos.set({ top: 0, left: 0 });
      }
    });

    effect(() => {
      document.body.style.overflow = OnboardingStore.isActive() ? 'hidden' : '';
    });

    window.addEventListener('resize', this.resizeHandler);
  }

  private computePositions(step: OnboardingStep): void {
    const el = document.querySelector(step.target!);
    if (!el) {
      this.spotlightRect.set(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const pad = 4;
    this.spotlightRect.set({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });

    const tooltipWidth = window.innerWidth <= 768 ? 260 : 300;
    const gap = 12;

    let top: number;
    let left: number;

    switch (step.position) {
      case 'right':
        top = rect.top;
        left = rect.right + gap;
        if (left + tooltipWidth > window.innerWidth) {
          left = rect.left - tooltipWidth - gap;
        }
        break;
      case 'left':
        top = rect.top;
        left = rect.left - tooltipWidth - gap;
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      default:
        top = 0;
        left = 0;
    }

    top = Math.max(8, Math.min(top, window.innerHeight - 200));

    this.tooltipPos.set({ top, left });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    document.body.style.overflow = '';
  }
}