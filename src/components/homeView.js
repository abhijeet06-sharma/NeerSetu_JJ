// NeerSetu_JJ Rural-First Home Screen
// Focused on extreme simplicity, large typography, icon+color+text, audio readout

import { i18n } from '../i18n/i18nEngine.js';
import { connectionManager } from '../services/connectionManager.js';
import { speechService } from '../services/speechService.js';
import { localDb } from '../db/localDb.js';

export class HomeView {
  constructor({ onNavigate, onScanQr }) {
    this.onNavigate = onNavigate;
    this.onScanQr = onScanQr;
    this.container = null;
    this.currentReading = null;
    this.systemProfile = null;
    this.unsubscribeTelem = null;
    this.unsubscribeConn = null;
  }

  mount(container) {
    this.container = container;
    this.loadProfile();

    this.unsubscribeTelem = connectionManager.onTelemetry((reading) => {
      this.currentReading = reading;
      this.render();
    });

    this.unsubscribeConn = connectionManager.onStatusChange(() => {
      this.loadProfile();
      this.render();
    });

    i18n.subscribe(() => this.render());
  }

  unmount() {
    if (this.unsubscribeTelem) this.unsubscribeTelem();
    if (this.unsubscribeConn) this.unsubscribeConn();
  }

  async loadProfile() {
    const sysId = connectionManager.getActiveSystemId();
    this.systemProfile = await localDb.getSystem(sysId);
    this.render();
  }

  getStatusVisuals(status) {
    switch (status) {
      case 'GOOD':
        return {
          cardClass: 'status-card-good',
          icon: `
            <svg class="status-hero-icon" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          `,
          title: i18n.t('status_good_title'),
          desc: i18n.t('status_good_desc'),
          badgeClass: 'badge-live',
          badgeText: i18n.t('status_good_badge')
        };
      case 'ATTENTION':
        return {
          cardClass: 'status-card-attention',
          icon: `
            <svg class="status-hero-icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          `,
          title: i18n.t('status_attention_title'),
          desc: i18n.t('status_attention_desc'),
          badgeClass: 'badge-attention',
          badgeText: i18n.t('status_attention_badge')
        };
      case 'CRITICAL':
        return {
          cardClass: 'status-card-critical',
          icon: `
            <svg class="status-hero-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          `,
          title: i18n.t('status_critical_title'),
          desc: i18n.t('status_critical_desc'),
          badgeClass: 'badge-critical',
          badgeText: i18n.t('status_critical_badge')
        };
      default:
        return {
          cardClass: 'status-card-nodata',
          icon: `
            <svg class="status-hero-icon" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          `,
          title: i18n.t('status_no_data_title'),
          desc: i18n.t('status_no_data_desc'),
          badgeClass: 'badge-not-connected',
          badgeText: '⚪ NO DATA'
        };
    }
  }

  getFreshnessLabel(timestamp, isLive) {
    if (isLive) {
      return {
        label: i18n.t('updated_just_now'),
        isLiveBadge: true
      };
    }

    if (!timestamp) {
      return {
        label: i18n.t('cached_warning'),
        isLiveBadge: false
      };
    }

    const diffMins = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMins < 2) {
      return { label: i18n.t('updated_just_now'), isLiveBadge: true };
    }
    if (diffMins < 60) {
      return {
        label: `${i18n.t('updated_at')} ${diffMins} ${i18n.t('updated_mins_ago')} (${i18n.t('state_cached')})`,
        isLiveBadge: false
      };
    }
    const diffHours = Math.floor(diffMins / 60);
    return {
      label: `${i18n.t('updated_at')} ${diffHours} ${i18n.t('updated_hours_ago')} (${i18n.t('state_cached')})`,
      isLiveBadge: false
    };
  }

  render() {
    if (!this.container) return;

    const r = this.currentReading;
    const conn = connectionManager.getConnectionStatus();
    const isLive = conn.connected && conn.type !== 'DISCONNECTED';
    const statusInfo = this.getStatusVisuals(r ? r.water_status : 'NO_DATA');
    const freshness = this.getFreshnessLabel(r ? r.timestamp : null, isLive);
    const systemName = this.systemProfile ? this.systemProfile.name : conn.systemId;
    const location = this.systemProfile ? this.systemProfile.location : 'Jharkhand, India';
    const fallbackTank = { 'NEERSETU-T7': 39, 'AQUA-JH-001': 0, 'AQUA-JH-MINING-03': 0 };
    const safeWaterLiters = r?.safe_water_liters ?? this.systemProfile?.safe_water_liters ?? fallbackTank[conn.systemId] ?? 0;
    const tankCapacity = this.systemProfile?.final_tank_capacity_liters ?? 50;
    const tankPercent = Math.max(0, Math.min(100, Math.round((Number(safeWaterLiters) / tankCapacity) * 100)));

    this.container.innerHTML = `
      <div class="rural-home-view">
        
        <!-- AquaSystem Identity Card -->
        <div class="system-hero-card">
          <div class="system-meta-row">
            <div class="sys-id-block">
              <span class="sys-label">${i18n.t('aquasystem')}</span>
              <h2 class="sys-id-title">${conn.systemId}</h2>
              <p class="sys-loc-sub">📍 ${location}</p>
            </div>
            <div class="system-action-buttons">
            <button class="btn-qr-scan-small" id="btn-home-connect" title="${i18n.t('btn_connect')}">
              <span>↔</span>
              <span>${i18n.t('btn_connect')}</span>
            </button>
            <button class="btn-qr-scan-small" id="btn-home-qr" title="${i18n.t('btn_scan_qr')}">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>${i18n.t('btn_scan_qr')}</span>
            </button>
            </div>
          </div>
        </div>

        <!-- Safe Water Reserve: primary user-facing information -->
        <!-- Safe Water Reserve -->
        <div class="safe-water-card">
          <div class="safe-water-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 2.5S5.5 9.2 5.5 14.2a6.5 6.5 0 0 0 13 0C18.5 9.2 12 2.5 12 2.5Z"/>
              <path d="M9.5 15.2c.4 1.5 1.4 2.3 3 2.6"/>
            </svg>
          </div>
          <div class="safe-water-main">
            <div class="safe-water-label">${i18n.t('safe_water_available')}</div>
            <div class="safe-water-value">${Number(safeWaterLiters).toFixed(0)} <span>L</span></div>
            <div class="safe-water-sub">${i18n.t('final_reserve_tank')} · ${tankPercent}% ${i18n.t('capacity_of')} ${tankCapacity} L ${i18n.t('capacity')}</div>
          </div>
          <div class="safe-water-state ${safeWaterLiters > 0 && r?.water_status === 'GOOD' ? 'ready' : safeWaterLiters > 0 ? 'caution' : 'empty'}">
            ${safeWaterLiters > 0 && r?.water_status === 'GOOD' ? i18n.t('state_ready') : safeWaterLiters > 0 ? i18n.t('state_check') : i18n.t('state_empty')}
          </div>
        </div>

        <!-- Water Quality Primary Status Card -->
        <div class="status-hero-card ${statusInfo.cardClass}">
          <div class="status-hero-header">
            <div class="status-icon-wrap">
              ${statusInfo.icon}
            </div>
            <div class="status-text-wrap">
              <div class="status-badge-row">
                <span class="rural-badge ${isLive ? 'badge-live' : 'badge-cached'}">
                  ${isLive ? '🟢 ' + i18n.t('state_live') : '🟠 ' + i18n.t('state_cached')}
                </span>
                <span class="status-label-chip">${i18n.t('water_quality')}</span>
              </div>
              <h3 class="status-hero-title">${statusInfo.title}</h3>
              <p class="status-hero-desc">${statusInfo.desc}</p>
            </div>
          </div>

          <!-- Spoken Audio Assistant Button -->
          <div class="voice-row">
            <button class="btn-voice-read" id="btn-read-status" aria-label="${i18n.t('btn_read_status')}">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
              <span>🔊 ${i18n.t('btn_read_status')}</span>
            </button>
          </div>
        </div>

        <!-- Final-water treatment decision: explicit three-stage output -->
        <div class="final-water-decision ${r?.water_status === 'GOOD' ? 'good' : r?.water_status === 'ATTENTION' ? 'attention' : r?.water_status === 'CRITICAL' ? 'critical' : ''}">
          ${r?.water_status === 'GOOD'
            ? i18n.t('decision_good')
            : r?.water_status === 'ATTENTION'
              ? i18n.t('decision_attention')
              : r?.water_status === 'CRITICAL'
                ? i18n.t('decision_critical')
                : i18n.t('decision_waiting')}
        </div>

        <!-- Offline Safety Warning Banner (If Not Live) -->
        ${!isLive ? `
          <div class="cached-warning-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>${i18n.t('state_cached')}:</strong> ${i18n.t('cached_warning')}
            </div>
          </div>
        ` : ''}

        <!-- 4 Key Readings (Large Typography) -->
        <div class="metrics-grid">
          <!-- TDS -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-name">${i18n.t('param_tds_short')}</span>
              <span class="metric-unit">ppm</span>
            </div>
            <div class="metric-val-wrap">
              <span class="metric-value">${r ? r.tds : '--'}</span>
            </div>
            <div class="metric-sub">${i18n.t('param_tds')}</div>
          </div>

          <!-- Turbidity -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-name">${i18n.t('param_turbidity_short')}</span>
              <span class="metric-unit">NTU</span>
            </div>
            <div class="metric-val-wrap">
              <span class="metric-value">${r ? r.turbidity : '--'}</span>
            </div>
            <div class="metric-sub">${i18n.t('param_turbidity')}</div>
          </div>

          <!-- pH -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-name">${i18n.t('param_ph_short')}</span>
              <span class="metric-unit">pH</span>
            </div>
            <div class="metric-val-wrap">
              <span class="metric-value">${r ? r.ph : '--'}</span>
            </div>
            <div class="metric-sub">${i18n.t('param_ph')}</div>
          </div>

          <!-- Temperature -->
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-name">${i18n.t('param_temp_short')}</span>
              <span class="metric-unit">°C</span>
            </div>
            <div class="metric-val-wrap">
              <span class="metric-value">${r ? r.temperature : '--'}</span>
            </div>
            <div class="metric-sub">${i18n.t('param_temp')}</div>
          </div>
        </div>

        <!-- Timestamp & Source Banner -->
        <div class="freshness-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span class="freshness-text">${freshness.label}</span>
        </div>

        <!-- Quick Primary Action Buttons -->
        <div class="home-actions-row">
          <button class="btn btn-action-twin" id="btn-goto-twin">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>${i18n.t('btn_view_twin')}</span>
          </button>
          
          <button class="btn btn-action-history" id="btn-goto-history">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>${i18n.t('btn_view_history')}</span>
          </button>
        </div>

      </div>
    `;

    // Attach interactions
    this.container.querySelector('#btn-home-qr')?.addEventListener('click', () => {
      if (this.onScanQr) this.onScanQr();
    });

    this.container.querySelector('#btn-home-connect')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = `<span>…</span><span>${i18n.t('btn_connecting')}</span>`;
      const success = await connectionManager.connectRealBle();
      btn.disabled = false;
      btn.innerHTML = success ? `<span>✓</span><span>${i18n.t('btn_connected')}</span>` : `<span>↔</span><span>${i18n.t('btn_try_again')}</span>`;
      this.render();
    });

    this.container.querySelector('#btn-read-status')?.addEventListener('click', () => {
      speechService.speakStatus(this.currentReading);
    });

    this.container.querySelector('#btn-goto-twin')?.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('twin');
    });

    this.container.querySelector('#btn-goto-history')?.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('history');
    });
  }
}
