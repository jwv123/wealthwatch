import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthStore } from '../../../stores/auth.store';

@Component({
  selector: 'ww-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="register-card ww-card">
        <div class="register__header">
          <svg class="register__logo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Shield body -->
            <path class="register__logo-shield" d="M60 12 L100 30 L100 65 Q100 90 60 108 Q20 90 20 65 L20 30 Z"
                  fill="var(--ww-navy)" fill-opacity="0.15" stroke="var(--ww-navy)" stroke-width="2.5" stroke-linejoin="round"/>
            <!-- Inner shield highlight -->
            <path d="M60 20 L92 35 L92 63 Q92 83 60 98 Q28 83 28 63 L28 35 Z"
                  fill="var(--ww-blue)" fill-opacity="0.08" stroke="var(--ww-blue)" stroke-width="1" stroke-linejoin="round" opacity="0.5"/>
            <!-- Magnifying glass -->
            <circle class="register__logo-lens" cx="54" cy="48" r="14" stroke="var(--ww-blue)" stroke-width="2.5" fill="var(--ww-blue)" fill-opacity="0.1"/>
            <line class="register__logo-handle" x1="64" y1="58" x2="76" y2="70" stroke="var(--ww-blue)" stroke-width="2.5" stroke-linecap="round"/>
            <!-- Coins stack -->
            <ellipse class="register__logo-coin1" cx="48" cy="78" rx="10" ry="4" fill="var(--ww-green)" fill-opacity="0.25" stroke="var(--ww-green)" stroke-width="1.5"/>
            <ellipse class="register__logo-coin2" cx="48" cy="74" rx="10" ry="4" fill="var(--ww-green)" fill-opacity="0.35" stroke="var(--ww-green)" stroke-width="1.5"/>
            <ellipse class="register__logo-coin3" cx="48" cy="70" rx="10" ry="4" fill="var(--ww-green)" fill-opacity="0.5" stroke="var(--ww-green)" stroke-width="1.5"/>
            <!-- Growth arrow -->
            <polyline class="register__logo-arrow" points="72,78 78,68 84,72" stroke="var(--ww-green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <line class="register__logo-arrow-line" x1="78" y1="68" x2="78" y2="82" stroke="var(--ww-green)" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span class="register__wordmark"><span class="register__wordmark--wealth">Wealth</span><span class="register__wordmark--watch">Watch</span></span>
          <h1>Create Account</h1>
          <p class="ww-text-muted">Start managing your budget today</p>
        </div>

        @if (AuthStore.error()) {
        <div class="register__error">
          {{ AuthStore.error() }}
        </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="register__form">
          <div class="register__field">
            <label class="ww-label" for="displayName">Display Name</label>
            <input class="ww-input" id="displayName" type="text" formControlName="display_name"
                   placeholder="Your name" />
          </div>

          <div class="register__field">
            <label class="ww-label" for="email">Email</label>
            <input class="ww-input" id="email" type="email" formControlName="email"
                   placeholder="you@example.com" />
            @if (form.get('email')?.touched && form.get('email')?.invalid) {
            <div class="register__error-text">
              Please enter a valid email
            </div>
            }
          </div>

          <div class="register__field">
            <label class="ww-label" for="password">Password</label>
            <input class="ww-input" id="password" type="password" formControlName="password"
                   placeholder="Min. 6 characters" />
            @if (form.get('password')?.touched && form.get('password')?.invalid) {
            <div class="register__error-text">
              Password must be at least 6 characters
            </div>
            }
          </div>

          <div class="register__field">
            <label class="ww-label" for="confirmPassword">Confirm Password</label>
            <input class="ww-input" id="confirmPassword" type="password" formControlName="confirmPassword"
                   placeholder="Repeat your password" />
            @if (form.get('confirmPassword')?.touched && form.errors?.['passwordMismatch']) {
            <div class="register__error-text">
              Passwords do not match
            </div>
            }
          </div>

          <button class="ww-btn ww-btn-success register__submit" type="submit"
                  [disabled]="form.invalid || AuthStore.isLoading()">
            {{ AuthStore.isLoading() ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="register__login">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .register-card {
      width: 100%;
      max-width: 400px;
    }
    .register__header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .register__logo {
      width: 80px;
      height: 80px;
      margin-bottom: 1rem;
    }
    .register__logo-shield {
      animation: shieldFadeIn 0.8s ease-out both;
    }
    .register__logo-lens {
      animation: lensPulse 3s ease-in-out infinite 0.4s;
      transform-origin: 54px 48px;
    }
    .register__logo-handle {
      animation: handleSlide 0.5s ease-out both 0.6s;
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
    }
    @keyframes shieldFadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes lensPulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
    @keyframes handleSlide {
      to { stroke-dashoffset: 0; }
    }
    .register__logo-coin1 {
      animation: coinStack 0.4s ease-out both 0.3s;
      opacity: 0;
    }
    .register__logo-coin2 {
      animation: coinStack 0.4s ease-out both 0.5s;
      opacity: 0;
    }
    .register__logo-coin3 {
      animation: coinStack 0.4s ease-out both 0.7s;
      opacity: 0;
    }
    @keyframes coinStack {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .register__logo-arrow {
      animation: arrowDraw 0.5s ease-out both 0.9s;
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
    }
    .register__logo-arrow-line {
      animation: arrowDraw 0.5s ease-out both 0.9s;
      stroke-dasharray: 16;
      stroke-dashoffset: 16;
    }
    @keyframes arrowDraw {
      to { stroke-dashoffset: 0; }
    }
    .register__wordmark {
      display: block;
      font-family: var(--ww-font-heading);
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      animation: wordmarkFade 0.6s ease-out both 0.5s;
      opacity: 0;
    }
    .register__wordmark--wealth {
      color: var(--ww-navy);
    }
    .register__wordmark--watch {
      color: var(--ww-green);
    }
    @keyframes wordmarkFade {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .register__form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .register__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .register__error {
      background-color: var(--ww-bg-error);
      border: 1px solid var(--ww-red);
      border-radius: var(--ww-radius);
      padding: 0.75rem;
      color: var(--ww-red);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .register__error-text {
      color: var(--ww-red);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .register__submit {
      margin-top: 0.5rem;
      width: 100%;
    }
    .register__login {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
    }
  `],
})
export class RegisterComponent {
  AuthStore = AuthStore;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        display_name: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(form: FormGroup): { passwordMismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    AuthStore.setLoading(true);
    AuthStore.setError(null);

    const { email, password, display_name } = this.form.value;

    this.authService.register({ email, password, display_name: display_name || undefined }).subscribe({
      next: async (response) => {
        if (response.confirmationRequired) {
          AuthStore.setError(null);
          this.router.navigate(['/login'], { queryParams: { confirmed: 'pending' } });
          return;
        }
        await this.authService.handleLogin(response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        AuthStore.setError(err.error?.error || 'Registration failed');
      },
    });
  }
}