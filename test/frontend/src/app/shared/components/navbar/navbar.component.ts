import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../stores/auth.store';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'ww-navbar',
  standalone: true,
  template: `
    <nav class="navbar">
      <div class="navbar__left">
        <button class="navbar__hamburger" (click)="toggleSidebar.emit()">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="navbar__brand">
          <span class="navbar__title">WealthWatch</span>
        </div>
      </div>
      @if (AuthStore.user()) {
      <div class="navbar__user">
        <span class="navbar__greeting">Hello, {{ AuthStore.user()?.display_name || AuthStore.user()?.email }}</span>
        <button class="ww-btn ww-btn-danger navbar__logout" (click)="logout()">Logout</button>
      </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 60px;
      background: var(--ww-glass-nav-bg);
      backdrop-filter: blur(var(--ww-glass-blur));
      -webkit-backdrop-filter: blur(var(--ww-glass-blur));
      color: #fff;
      transition: background 0.3s ease;
    }
    .navbar__left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .navbar__hamburger {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--ww-radius);
      transition: background-color 0.2s;
    }
    .navbar__hamburger:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
    .navbar__brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .navbar__title {
      font-family: var(--ww-font-heading);
      font-size: 1.25rem;
      font-weight: 600;
    }
    .navbar__user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .navbar__greeting {
      font-size: 0.875rem;
      opacity: 0.9;
    }
    .navbar__logout {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
    @media (max-width: 768px) {
      .navbar__user {
        gap: 0.5rem;
      }
      .navbar__greeting {
        display: none;
      }
    }
  `],
})
export class NavbarComponent {
  AuthStore = AuthStore;

  @Output() toggleSidebar = new EventEmitter<void>();

  private router = inject(Router);
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.handleLogout();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.handleLogout();
        this.router.navigate(['/login']);
      },
    });
  }
}