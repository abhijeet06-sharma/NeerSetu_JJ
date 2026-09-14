// NeerSetu_JJ Bottom Mobile-First Navigation
// Minimal 5-item bar for rural simplicity + Technician mode quick entry

import { i18n } from '../i18n/i18nEngine.js';

export class AppNavigation {
  constructor({ onNavigate }) {
    this.onNavigate = onNavigate;
    this.currentRoute = 'home';
    this.navEl = null;
  }

  render(container) {
    this.navEl = document.createElement('nav');
    this.navEl.className = 'bottom-nav-bar';
    container.appendChild(this.navEl);
    this.update();

    i18n.subscribe(() => this.update());
  }

  setRoute(route) {
    this.currentRoute = route;
    this.update();
  }

  update() {
    if (!this.navEl) return;

    const navItems = [
      {
        id: 'home',
        label: i18n.t('nav_home'),
        icon: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        `
      },
      {
        id: 'monitor',
        label: i18n.t('nav_monitor'),
        icon: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        `
      },
      {
        id: 'twin',
        label: i18n.t('nav_twin'),
        icon: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        `
      },
      {
        id: 'history',
        label: i18n.t('nav_history'),
        icon: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        `
      },
      {
        id: 'offline',
        label: 'Offline / Sync',
        icon: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
          </svg>
        `
      },
      {
        id: 'health',
        label: i18n.t('nav_health'),
        icon: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        `
      },
      {
        id: 'tech',
        label: 'Judge / Tech',
        icon: `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        `
      }
    ];

    this.navEl.innerHTML = `
      <div class="nav-inner">
        ${navItems.map((item) => `
          <button class="nav-btn ${this.currentRoute === item.id ? 'active' : ''}" data-route="${item.id}" aria-label="${item.label}">
            <div class="nav-icon-wrap">${item.icon}</div>
            <span class="nav-label">${item.label}</span>
          </button>
        `).join('')}
      </div>
    `;

    this.navEl.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        this.setRoute(route);
        if (this.onNavigate) this.onNavigate(route);
      });
    });
  }
}
