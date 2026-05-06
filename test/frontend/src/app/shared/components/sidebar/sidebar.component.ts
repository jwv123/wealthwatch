import { Component, input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'ww-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar"
          [class.sidebar--collapsed]="collapsed()"
          [class.sidebar--mobile-open]="mobileOpen()">
      <nav class="sidebar__nav">
        <a routerLink="/dashboard"
           routerLinkActive="sidebar__link--active"
           class="sidebar__link"
           (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span class="sidebar__label">Dashboard</span>
        </a>
        <a routerLink="/transactions"
           routerLinkActive="sidebar__link--active"
           class="sidebar__link"
           (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span class="sidebar__label">Transactions</span>
        </a>
        <a routerLink="/accounts"
           routerLinkActive="sidebar__link--active"
           class="sidebar__link"
           (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <span class="sidebar__label">Accounts</span>
        </a>
        <a routerLink="/recurring"
           routerLinkActive="sidebar__link--active"
           class="sidebar__link"
           (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          <span class="sidebar__label">Recurring</span>
        </a>
        <a routerLink="/calendar"
           routerLinkActive="sidebar__link--active"
           class="sidebar__link"
           (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span class="sidebar__label">Calendar</span>
        </a>
        <a routerLink="/categories"
           routerLinkActive="sidebar__link--active"
           class="sidebar__link"
           (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          <span class="sidebar__label">Categories</span>
        </a>
        <a routerLink="/settings"
           routerLinkActive="sidebar__link--active"
           class="sidebar__link"
           (click)="onNavClick()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span class="sidebar__label">Settings</span>
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px;
      min-height: 100%;
      background: var(--ww-glass-sidebar-bg);
      backdrop-filter: blur(var(--ww-glass-blur));
      -webkit-backdrop-filter: blur(var(--ww-glass-blur));
      border-right: 1px solid var(--ww-glass-border);
      padding: 1rem 0;
      flex-shrink: 0;
      transition: width 0.25s ease, background 0.3s ease, border-color 0.3s ease;
      overflow: hidden;
    }
    .sidebar--collapsed {
      width: 60px;
    }
    .sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .sidebar__link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      color: var(--ww-text-main);
      text-decoration: none;
      font-size: 0.875rem;
      white-space: nowrap;
      transition: background-color 0.2s, color 0.2s;
    }
    .sidebar--collapsed .sidebar__link {
      padding: 0.75rem;
      justify-content: center;
    }
    .sidebar__label {
      transition: opacity 0.2s ease;
    }
    .sidebar--collapsed .sidebar__label {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
    .sidebar__link:hover {
      background-color: rgba(var(--ww-blue-rgb), 0.08);
      color: var(--ww-navy);
    }
    .sidebar__link--active {
      background-color: rgba(var(--ww-blue-rgb), 0.12);
      color: var(--ww-blue);
      font-weight: 600;
      border-right: 3px solid var(--ww-blue);
    }
    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
      .sidebar--mobile-open {
        display: flex !important;
        position: fixed;
        top: 60px;
        left: 0;
        z-index: 9998;
        height: calc(100vh - 60px);
        width: 220px;
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
      }
      .sidebar--onboarding {
        display: flex !important;
        position: fixed;
        top: 60px;
        left: 0;
        z-index: 9999;
        height: calc(100vh - 60px);
      }
    }
  `],
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  mobileOpen = input<boolean>(false);

  @Output() navClick = new EventEmitter<void>();

  onNavClick(): void {
    this.navClick.emit();
  }
}