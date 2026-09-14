// NeerSetu_JJ Header Component
// System status pill, language dropdown, connectivity badges

import { i18n } from '../i18n/i18nEngine.js';
import { connectionManager } from '../services/connectionManager.js';
import { syncService } from '../services/syncService.js';

export class AppHeader {
  constructor({ onScanQr, onNavigate, onLanguageChange }) {
    this.onScanQr = onScanQr;
    this.onNavigate = onNavigate;
    this.onLanguageChange = onLanguageChange;
    this.headerEl = null;
  }

  render(container) {
    this.headerEl = document.createElement('header');
    this.headerEl.className = 'app-header';
    container.appendChild(this.headerEl);
    this.update();

    // Subscribe to updates
    i18n.subscribe(() => this.update());
    connectionManager.onStatusChange(() => this.update());
    syncService.subscribe(() => this.update());
  }

  update() {
    if (!this.headerEl) return;

    const currentLang = i18n.getLang();
    const conn = connectionManager.getConnectionStatus();
    const sync = syncService.getState();
    const languages = i18n.getSupportedLanguages();

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
            <div class="brand-slogan">NeerSetu Jal Jeevan</div>
            <div class="brand-name">
              <span class="brand-bold">NeerSetu</span><span class="brand-accent">_JJ</span>
            </div>
          </div>
        </div>

        <!-- Controls: Language & QR System Selector -->
        <div class="header-actions">
          <!-- AquaSystem ID Badge Pill -->
          <button class="system-id-pill" id="btn-header-sys" title="Tap to scan QR / switch AquaSystem">
            <span class="sys-dot ${isLive ? 'dot-live' : 'dot-cached'}"></span>
            <span class="sys-code">${conn.systemId}</span>
            <svg class="qr-mini-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>

          <!-- Language Selector -->
          <div class="lang-selector-wrap">
            <select id="lang-select" class="lang-dropdown" aria-label="Select Language">
              ${languages.map((l) => `
                <option value="${l.code}" ${l.code === currentLang ? 'selected' : ''}>${l.code.toUpperCase()}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Network & Edge Connection Strip -->
      <div class="header-status-strip">
        <div class="strip-left">
          <span class="edge-status-pill ${isLive ? 'pill-live' : 'pill-offline'}">
            <span class="pulse-dot"></span>
            ${isLive ? '🟢 ' + i18n.t('state_live') + ' (ESP32 BLE)' : '🟠 ' + i18n.t('state_cached')}
          </span>
          <span class="cloud-status-pill ${isOnline ? 'pill-online' : 'pill-cloud-off'}">
            ${isOnline ? '☁️ Online' : '🚫 ' + i18n.t('offline_banner_title')}
          </span>
        </div>

        <div class="strip-right">
          ${sync.pendingCount > 0 ? `
            <span class="pending-upload-tag" id="btn-sync-quick">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              ${sync.pendingCount} ${i18n.t('offline_waiting_prefix')}
            </span>
          ` : `
            <span class="synced-tag">✓ Synced</span>
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

    this.headerEl.querySelector('#lang-select')?.addEventListener('change', (e) => {
      const newLang = e.target.value;
      i18n.setLang(newLang);
      if (this.onLanguageChange) this.onLanguageChange(newLang);
    });

    this.headerEl.querySelector('#btn-sync-quick')?.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('offline');
    });
  }
}
