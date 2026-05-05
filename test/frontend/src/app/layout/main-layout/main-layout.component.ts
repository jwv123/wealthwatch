import { Component, OnInit, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { OnboardingOverlayComponent } from '../../features/onboarding/onboarding-overlay.component';
import { OnboardingStore } from '../../stores/onboarding.store';
import { AuthStore } from '../../stores/auth.store';

@Component({
  selector: 'ww-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, OnboardingOverlayComponent],
  template: `
    <div class="layout">
      <ww-navbar (toggleSidebar)="toggleSidebar()" />
      <div class="layout__body">
        @if (mobileDrawerOpen()) {
          <div class="layout__backdrop" (click)="closeMobileDrawer()"></div>
        }
        <ww-sidebar [collapsed]="sidebarCollapsed()"
                     [mobileOpen]="mobileDrawerOpen()"
                     [class.sidebar--onboarding]="OnboardingStore.isActive()"
                     (navClick)="closeMobileDrawer()" />
        <main class="layout__content">
          <router-outlet />
        </main>
      </div>
      <ww-onboarding-overlay />
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .layout__body {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .layout__backdrop {
      display: none;
    }
    .layout__content {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
      min-width: 0;
    }
    @media (max-width: 768px) {
      .layout__content {
        padding: 1rem;
      }
      .layout__backdrop {
        display: block;
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 9997;
      }
    }
  `],
})
export class MainLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  mobileDrawerOpen = signal(false);
  OnboardingStore = OnboardingStore;

  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.mobileDrawerOpen.update((v) => !v);
    } else {
      this.sidebarCollapsed.update((v) => !v);
    }
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isMobile() && this.mobileDrawerOpen()) {
      this.mobileDrawerOpen.set(false);
    }
  }

  ngOnInit(): void {
    if (AuthStore.isAuthenticated() && !OnboardingStore.hasCompleted()) {
      setTimeout(() => {
        if (AuthStore.isAuthenticated() && !OnboardingStore.hasCompleted() && !OnboardingStore.isActive()) {
          OnboardingStore.start();
        }
      }, 500);
    }
  }
}