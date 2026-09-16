// NeerSetu_JJ Header Component
// System status pill, custom HIN & ENG language selector, connectivity badges

import { i18n } from '../i18n/i18nEngine.js';
import { connectionManager } from '../services/connectionManager.js';
import { syncService } from '../services/syncService.js';

export class AppHeader {
  constructor({ onScanQr, onNavigate, onLanguageChange }) {
    this.onScanQr = onScanQr;
    this.onNavigate = onNavigate;
    this.onLanguageChange = onLanguageChange;
    this.headerEl = null;
    this.isMenuOpen = false;
    this.boundClickOutside = (e) => this.handleClickOutside(e);
  }

  render(container) {
    this.headerEl = document.createElement('header');
    this.headerEl.className = 'app-header';
    container.appendChild(this.headerEl);
    this.fullRender();

    // Re-render full header only when language changes
    i18n.subscribe(() => this.fullRender());

    // Update status indicators without rebuilding DOM (prevents dropdown closing)
    connectionManager.onStatusChange(() => this.updateStatusOnly());
    syncService.subscribe(() => this.updateStatusOnly());

    document.addEventListener('click', this.boundClickOutside);
  }

  handleClickOutside(e) {
    if (!this.isMenuOpen || !this.headerEl) return;
    const menuWrap = this.headerEl.querySelector('#lang-menu-wrap');
    if (menuWrap && !menuWrap.contains(e.target)) {
      this.closeMenu();
    }
  }

  toggleMenu(e) {
    if (e) e.stopPropagation();
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isMenuOpen = true;
    const menu = this.headerEl?.querySelector('#lang-dropdown-menu');
    const btn = this.headerEl?.querySelector('#btn-lang-toggle');
    if (menu) menu.classList.add('open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  closeMenu() {
    this.isMenuOpen = false;
    const menu = this.headerEl?.querySelector('#lang-dropdown-menu');
    const btn = this.headerEl?.querySelector('#btn-lang-toggle');
    if (menu) menu.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  selectLanguage(lang) {
    this.closeMenu();
    if (lang !== i18n.getLang()) {
      i18n.setLang(lang);
      if (this.onLanguageChange) this.onLanguageChange(lang);
    }
  }

  fullRender() {
    if (!this.headerEl) return;

    const currentLang = i18n.getLang();
    const conn = connectionManager.getConnectionStatus();
    const sync = syncService.getState();

    const isLive = conn.connected && conn.type !== 'DISCONNECTED';
    const isOnline = sync.online;

    this.headerEl.innerHTML = `
      <div class="header-top-bar">
        <!-- Logo & Branding -->
        <div class="brand-group" role="button" tabindex="0" id="btn-brand-home">
          <div class="brand-logo-drop">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="url(#dropG)"/>
              <path d="M8 15c2-3 6-3 8 0" stroke="#ffffff" stroke-width="2"/>
              <defs>
                <linearGradient id="dropG" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="100%" stop-color="#0284c7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="brand-titles">
            <div class="brand-slogan">${i18n.t('app_slogan')}</div>
            <div class="brand-name">
              <span class="brand-bold">NeerSetu</span><span class="brand-accent">_JJ</span>
            </div>
          </div>
        </div>

        <!-- Controls: Language (HIN & ENG) & QR System Selector -->
        <div class="header-actions">
          <!-- AquaSystem ID Badge Pill -->
          <button class="system-id-pill" id="btn-header-sys" title="${i18n.t('system_pill_title')}">
            <span class="sys-dot ${isLive ? 'dot-live' : 'dot-cached'}"></span>
            <span class="sys-code" id="header-sys-code">${conn.systemId}</span>
            <svg class="qr-mini-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>

          <!-- Language Selector showing HIN & ENG -->
          <div class="lang-selector-wrap" id="lang-menu-wrap">
            <button type="button" class="lang-toggle-btn" id="btn-lang-toggle" aria-expanded="${this.isMenuOpen ? 'true' : 'false'}" aria-haspopup="true" title="Switch Language / भाषा बदलें">
              <span class="lang-icon">🌐</span>
              <span class="lang-label-pair">
                <span class="lang-opt ${currentLang === 'hi' ? 'active' : ''}">HIN</span>
                <span class="lang-sep">&</span>
                <span class="lang-opt ${currentLang === 'en' ? 'active' : ''}">ENG</span>
              </span>
              <svg class="lang-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Custom Dropdown Menu (Closes after selection) -->
            <div class="lang-dropdown-menu ${this.isMenuOpen ? 'open' : ''}" id="lang-dropdown-menu" role="menu">
              <button type="button" class="lang-menu-item ${currentLang === 'hi' ? 'selected' : ''}" data-lang="hi" role="menuitem">
                <span class="lang-flag">🇮🇳</span>
                <div class="lang-item-text">
                  <span class="lang-item-code">HIN</span>
                  <span class="lang-item-native">हिन्दी</span>
                </div>
                ${currentLang === 'hi' ? '<span class="lang-check">✓</span>' : ''}
              </button>
              <button type="button" class="lang-menu-item ${currentLang === 'en' ? 'selected' : ''}" data-lang="en" role="menuitem">
                <span class="lang-flag">🇬🇧</span>
                <div class="lang-item-text">
                  <span class="lang-item-code">ENG</span>
                  <span class="lang-item-native">English</span>
                </div>
                ${currentLang === 'en' ? '<span class="lang-check">✓</span>' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Network & Edge Connection Strip -->
      <div class="header-status-strip">
        <div class="strip-left">
          <span class="edge-status-pill ${isLive ? 'pill-live' : 'pill-offline'}">
            <span class="pulse-dot"></span>
            <span id="txt-edge-status">${isLive ? '🟢 ' + i18n.t('state_live') + ' (ESP32 BLE)' : '🟠 ' + i18n.t('state_cached')}</span>
          </span>
          <span class="cloud-status-pill ${isOnline ? 'pill-online' : 'pill-cloud-off'}">
            <span id="txt-cloud-status">${isOnline ? '☁️ ' + i18n.t('online') : '🚫 ' + i18n.t('offline')}</span>
          </span>
        </div>

        <div class="strip-right" id="strip-sync-wrap">
          ${sync.pendingCount > 0 ? `
            <span class="pending-upload-tag" id="btn-sync-quick">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              ${sync.pendingCount} ${i18n.t('offline_waiting_prefix')}
            </span>
          ` : `
            <span class="synced-tag">${i18n.t('synced')}</span>
          `}
        </div>
      </div>
    `;

    // Attach listeners
    this.headerEl.querySelector('#btn-header-sys')?.addEventListener('click', () => {
      if (this.onScanQr) this.onScanQr();
    });

    this.headerEl.querySelector('#btn-brand-home')?.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('home');
    });

    // Language dropdown trigger
    this.headerEl.querySelector('#btn-lang-toggle')?.addEventListener('click', (e) => {
      this.toggleMenu(e);
    });

    // Dropdown items - select language and immediately close
    this.headerEl.querySelectorAll('.lang-menu-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedLang = item.getAttribute('data-lang');
        if (selectedLang) {
          this.selectLanguage(selectedLang);
        }
      });
    });

    this.headerEl.querySelector('#btn-sync-quick')?.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('offline');
    });
  }

  // Targeted update: updates only dynamic telemetry & sync tags WITHOUT re-rendering or closing menus
  updateStatusOnly() {
    if (!this.headerEl) return;

    const conn = connectionManager.getConnectionStatus();
    const sync = syncService.getState();
    const isLive = conn.connected && conn.type !== 'DISCONNECTED';
    const isOnline = sync.online;

    // Update system code
    const sysCodeEl = this.headerEl.querySelector('#header-sys-code');
    if (sysCodeEl) sysCodeEl.textContent = conn.systemId;

    const sysDot = this.headerEl.querySelector('.sys-dot');
    if (sysDot) {
      sysDot.className = `sys-dot ${isLive ? 'dot-live' : 'dot-cached'}`;
    }

    // Update edge status pill
    const edgePill = this.headerEl.querySelector('.edge-status-pill');
    const txtEdge = this.headerEl.querySelector('#txt-edge-status');
    if (edgePill) {
      edgePill.className = `edge-status-pill ${isLive ? 'pill-live' : 'pill-offline'}`;
    }
    if (txtEdge) {
      txtEdge.textContent = isLive ? '🟢 ' + i18n.t('state_live') + ' (ESP32 BLE)' : '🟠 ' + i18n.t('state_cached');
    }

    // Update cloud status pill
    const cloudPill = this.headerEl.querySelector('.cloud-status-pill');
    const txtCloud = this.headerEl.querySelector('#txt-cloud-status');
    if (cloudPill) {
      cloudPill.className = `cloud-status-pill ${isOnline ? 'pill-online' : 'pill-cloud-off'}`;
    }
    if (txtCloud) {
      txtCloud.textContent = isOnline ? '☁️ ' + i18n.t('online') : '🚫 ' + i18n.t('offline');
    }

    // Update sync tag
    const syncWrap = this.headerEl.querySelector('#strip-sync-wrap');
    if (syncWrap) {
      if (sync.pendingCount > 0) {
        syncWrap.innerHTML = `
          <span class="pending-upload-tag" id="btn-sync-quick">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            ${sync.pendingCount} ${i18n.t('offline_waiting_prefix')}
          </span>
        `;
        syncWrap.querySelector('#btn-sync-quick')?.addEventListener('click', () => {
          if (this.onNavigate) this.onNavigate('offline');
        });
      } else {
        syncWrap.innerHTML = `<span class="synced-tag">${i18n.t('synced')}</span>`;
      }
    }
  }

  update() {
    this.fullRender();
  }
}

