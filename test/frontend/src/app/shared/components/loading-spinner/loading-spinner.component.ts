import { Component } from '@angular/core';

@Component({
  selector: 'ww-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-overlay" *ngIf="loading">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--ww-border);
      border-top-color: var(--ww-blue);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingSpinnerComponent {
  loading = true;
}