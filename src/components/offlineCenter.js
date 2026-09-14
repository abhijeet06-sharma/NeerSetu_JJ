// NeerSetu_JJ Offline Center Component
// Transparent offline data management, sync queue inspection, and SIH Internet simulation toggle

import { syncService } from '../services/syncService.js';
import { connectionManager } from '../services/connectionManager.js';
import { localDb } from '../db/localDb.js';
import { i18n } from '../i18n/i18nEngine.js';

export class OfflineCenter {
  constructor() {
    this.container = null;
    this.pendingRecords = [];
    this.unsubscribeSync = null;
  }

  mount(container) {
    this.container = container;
    this.loadPending();

    this.unsubscribeSync = syncService.subscribe(() => {
      this.loadPending();
      this.render();
    });

    i18n.subscribe(() => this.render());
  }

  unmount() {
    if (this.unsubscribeSync) this.unsubscribeSync();
  }

  async loadPending() {
    this.pendingRecords = await localDb.getPendingSyncRecords();
  }

  render() {
    if (!this.container) return;

    const sync = syncService.getState();
    const conn = connectionManager.getConnectionStatus();
    const isOnline = sync.online;

    this.container.innerHTML = `
      <div class="offline-center-wrap">
        <div class="view-header-strip">
          <div>
            <h2 class="view-title">Offline Center & Cloud Sync</h2>
            <span class="view-sub">Local IndexedDB Persistence • Zero Cloud Lock-in</span>
          </div>
          <div class="net-status-badge ${isOnline ? 'net-online' : 'net-offline'}">
            ${isOnline ? '🟢 ONLINE' : '🟠 OFFLINE MODE'}
          </div>
        </div>

        <!-- Main Offline/Online Status Card -->
        <div class="offline-status-card ${isOnline ? 'card-online' : 'card-offline'}">
          <div class="card-status-header">
            <div class="status-icon-bubble">
              ${isOnline ? `
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
              ` : `
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
              `}
            </div>
            <div>
              <h3>${isOnline ? 'Internet Connected' : i18n.t('offline_banner_title')}</h3>
              <p>${isOnline ? 'Cloud mirror is reachable. Live telemetry can synchronize automatically.' : i18n.t('offline_banner_desc')}</p>
            </div>
          </div>

          <!-- 4-Stat Indicator Grid -->
          <div class="offline-stats-grid">
            <div class="off-stat-tile">
              <span class="lbl">Internet State</span>
              <span class="val ${isOnline ? 'txt-online' : 'txt-offline'}">${isOnline ? 'Available' : 'Unavailable'}</span>
            </div>
            <div class="off-stat-tile">
              <span class="lbl">AquaSystem BLE</span>
              <span class="val txt-online">${conn.connected ? 'Connected locally' : 'Disconnected'}</span>
            </div>
            <div class="off-stat-tile">
              <span class="lbl">Local Monitoring</span>
              <span class="val txt-online">Active (ESP32)</span>
            </div>
            <div class="off-stat-tile">
              <span class="lbl">Waiting to Upload</span>
              <span class="val txt-alert">${sync.pendingCount} readings</span>
            </div>
          </div>

          <!-- Sync Progress Bar if syncing -->
          ${sync.isSyncing ? `
            <div class="sync-progress-box">
              <div class="sync-spinner"></div>
              <span>Uploading ${sync.pendingCount} records to cloud database...</span>
            </div>
          ` : ''}

          <!-- Sync Action Button -->
          <div class="offline-actions-row">
            <button class="btn btn-primary" id="btn-force-sync" ${!isOnline || sync.pendingCount === 0 || sync.isSyncing ? 'disabled' : ''}>
              ${sync.isSyncing ? 'Synchronizing...' : i18n.t('btn_upload_now')} (${sync.pendingCount})
            </button>
          </div>
        </div>

        <!-- SIH Presentation Simulator Card -->
        <div class="demo-internet-toggle-card">
          <div class="demo-toggle-header">
            <div>
              <span class="sih-tag">SIH PRESENTATION TOOL</span>
              <h4>Simulate Internet Disconnection / Restoration</h4>
              <p>Flip this switch during your presentation to demonstrate how the PWA logs data offline without loss, then seamlessly syncs when connectivity returns.</p>
            </div>
            <label class="switch-toggle" for="chk-sim-net">
              <input type="checkbox" id="chk-sim-net" ${!sync.isSimulatedOffline ? 'checked' : ''}/>
              <span class="slider-round"></span>
            </label>
          </div>
        </div>

        <!-- Pending Records Log -->
        <div class="pending-records-card">
          <h4>Offline Upload Queue (${this.pendingRecords.length} Items)</h4>
          ${this.pendingRecords.length === 0 ? `
            <p class="all-synced-note">✓ All historical telemetry is synchronized. Zero pending records in queue.</p>
          ` : `
            <div class="pending-list">
              ${this.pendingRecords.slice(0, 10).map((r) => `
                <div class="pending-item">
                  <div class="pending-time">
                    🕒 ${new Date(r.timestamp).toLocaleTimeString()}
                  </div>
                  <div class="pending-val">
                    TDS: <strong>${r.tds}</strong> ppm • Turb: <strong>${r.turbidity}</strong> NTU • pH: <strong>${r.ph}</strong>
                  </div>
                  <span class="pending-badge">WAITING SYNC</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

      </div>
    `;

    // Force Sync button
    this.container.querySelector('#btn-force-sync')?.addEventListener('click', () => {
      syncService.triggerSync();
    });

    // Simulated Internet Switch
    const chkSim = this.container.querySelector('#chk-sim-net');
    if (chkSim) {
      chkSim.addEventListener('change', (e) => {
        const isOnlineSim = e.target.checked;
        syncService.setSimulatedOffline(!isOnlineSim);
      });
    }
  }
}
