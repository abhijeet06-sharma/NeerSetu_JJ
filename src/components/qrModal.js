// NeerSetu_JJ QR Identification Modal
// Supports Camera Scanning, Preset Quick-Select, Printable QR Badges,
// and Real Web Bluetooth BLE connection after system identification.

import { qrService } from '../services/qrService.js';
import { connectionManager } from '../services/connectionManager.js';
import { i18n } from '../i18n/i18nEngine.js';

// Water status display config
const STATUS_CONFIG = {
  GOOD:      { label: '✅ SAFE',     color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  ATTENTION: { label: '⚠️ ATTENTION', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  CRITICAL:  { label: '🚨 CRITICAL',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
  UNKNOWN:   { label: '— UNKNOWN',   color: '#64748b', bg: 'rgba(100,116,139,0.12)' }
};

// Per-system last-known status (matches SYSTEM_PROFILES in connectionManager)
const SYSTEM_STATUS = {
  'NEERSETU-T7':       'GOOD',
  'AQUA-JH-001':       'ATTENTION',
  'AQUA-JH-MINING-03': 'CRITICAL'
};

export class QrModal {
  constructor(onSystemSelected) {
    this.onSystemSelected = onSystemSelected;
    this.modalEl = null;
    this._selectedSysId = null;
    this.init();
  }

  init() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.id = 'qr-scan-modal';
    this.modalEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.modalEl);

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl || e.target.closest('.modal-close-btn')) {
        this.close();
      }
    });
  }

  open(activeSystemId = 'NEERSETU-T7') {
    this._selectedSysId = activeSystemId;
    const systems = qrService.getAvailableSystems();
    const qrSvg = qrService.generateQrSvg(activeSystemId);
    const connStatus = connectionManager.getConnectionStatus();

    this.modalEl.innerHTML = `
      <div class="modal-dialog modal-qr" role="dialog">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">${i18n.t('btn_scan_qr')}</h3>
            <span class="modal-subtitle">Identify AquaSystem — zero credentials required</span>
          </div>
          <button class="modal-close-btn" aria-label="Close">✕</button>
        </div>

        <div class="modal-body">
          <div class="qr-tabs">
            <button class="qr-tab-btn active" data-tab="preset">Choose System</button>
            <button class="qr-tab-btn" data-tab="camera">Live Camera Scan</button>
            <button class="qr-tab-btn" data-tab="badge">Create QR</button>
          </div>

          <!-- Tab 1: Preset Quick Selection -->
          <div class="qr-tab-content tab-preset active">
            <p class="section-hint">Select a deployed AquaSystem in Jharkhand:</p>
            <div class="systems-list">
              ${systems.map((s) => {
                const st = SYSTEM_STATUS[s.id] ?? 'UNKNOWN';
                const sc = STATUS_CONFIG[st] ?? STATUS_CONFIG.UNKNOWN;
                return `
                  <div class="system-choice-card ${s.id === activeSystemId ? 'active' : ''}" data-sys-id="${s.id}">
                    <div class="sys-choice-header">
                      <span class="sys-id-code">${s.id}</span>
                      <span class="sys-water-badge" style="color:${sc.color}; background:${sc.bg}; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:700;">${sc.label}</span>
                    </div>
                    <div class="sys-choice-name">${s.name}</div>
                    <div class="sys-choice-loc">📍 ${s.location}</div>
                    <div class="sys-tag-row" style="margin-top:4px;">
                      <span class="sys-tag">${s.tag}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            
            <div class="manual-input-box">
              <label for="manual-sys-id">Or enter AquaSystem ID manually:</label>
              <div class="input-row">
                <input type="text" id="manual-sys-id" placeholder="e.g. AQUA-JH-001" value="${activeSystemId}"/>
                <button class="btn btn-primary" id="btn-apply-manual">Identify</button>
              </div>
            </div>

            <!-- BLE Connect Section (shown after a system is selected) -->
            <div class="ble-connect-section" id="ble-connect-section">
              <div class="ble-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
                </svg>
                Connect to Physical ESP32
              </div>
              <p class="ble-section-hint">
                Pair with the real hardware device for live sensor readings from the identified system.
                If pairing fails or is cancelled, the app continues in simulated mode.
              </p>
              <div class="ble-status-row" id="ble-status-row">
                ${this._renderBleStatus(connStatus)}
              </div>
              <button class="btn-ble-connect" id="btn-ble-connect">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>
                </svg>
                Scan & Connect via Bluetooth
              </button>
            </div>
          </div>

          <!-- Tab 2: Live Camera Video Stream -->
          <div class="qr-tab-content tab-camera">
            <div class="camera-viewport">
              <video id="qr-video" playsinline></video>
              <div class="scanner-crosshairs">
                <div class="laser-beam"></div>
              </div>
            </div>
            <p class="camera-hint">Point your phone camera at the QR code plate on the AquaSystem unit.</p>
            <div id="camera-status" class="camera-status-msg"></div>
          </div>

          <!-- Tab 3: QR Generator -->
          <div class="qr-tab-content tab-badge">
            <div class="qr-generator-controls">
              <label for="qr-system-select">AquaSystem</label>
              <select id="qr-system-select">
                ${systems.map((s) => `<option value="${s.id}" ${s.id === activeSystemId ? 'selected' : ''}>${s.id}</option>`).join('')}
              </select>
              <div class="qr-generator-link" id="qr-generator-link">${qrService.getSystemUrl(activeSystemId)}</div>
            </div>
            <div class="qr-card-preview">
              <div class="qr-badge-header">
                <div class="badge-logo-text">NeerSetu_JJ</div>
                <div class="badge-sub">NeerSetu JalJeevan Ecosystem</div>
              </div>
              <div class="qr-svg-holder">
                ${qrSvg}
              </div>
              <div class="badge-sys-info">
                <div class="badge-id-large">${activeSystemId}</div>
                <div class="badge-desc">Scan to open NeerSetu & identify this AquaSystem</div>
              </div>
            </div>
            <div class="qr-generator-actions">
              <button class="btn btn-primary" id="btn-download-qr">Download QR</button>
              <button class="btn btn-secondary" id="btn-print-qr">Print</button>
            </div>
            <p class="badge-note">This is a real, standards-compliant QR. It contains only the public PWA link and AquaSystem ID — no credentials or sensor data.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">${i18n.t('btn_close')}</button>
        </div>
      </div>
    `;

    this.modalEl.classList.add('open');
    this.modalEl.setAttribute('aria-hidden', 'false');

    // Tab switching logic
    const tabBtns = this.modalEl.querySelectorAll('.qr-tab-btn');
    const tabContents = this.modalEl.querySelectorAll('.qr-tab-content');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
        tabContents.forEach((c) => c.classList.toggle('active', c.classList.contains(`tab-${tab}`)));

        if (tab === 'camera') {
          this.startCamera();
        } else {
          qrService.stopCameraScan();
        }
      });
    });

    // Preset selection cards
    this.modalEl.querySelectorAll('.system-choice-card').forEach((card) => {
      card.addEventListener('click', () => {
        const sysId = card.getAttribute('data-sys-id');
        this.highlightCard(sysId);
        this._selectedSysId = sysId;
        this.selectSystem(sysId, false); // select but don't close yet
      });
    });

    // Manual input button
    const manualBtn = this.modalEl.querySelector('#btn-apply-manual');
    const manualInput = this.modalEl.querySelector('#manual-sys-id');
    if (manualBtn && manualInput) {
      manualBtn.addEventListener('click', () => {
        const val = manualInput.value.trim().toUpperCase();
        if (val) {
          this._selectedSysId = val;
          this.selectSystem(val, false);
        }
      });
    }

    // BLE connect button
    const bleBtn = this.modalEl.querySelector('#btn-ble-connect');
    if (bleBtn) {
      bleBtn.addEventListener('click', () => this.handleBleConnect());
    }

    const qrSelect = this.modalEl.querySelector('#qr-system-select');
    qrSelect?.addEventListener('change', () => {
      const sysId = qrSelect.value;
      this._selectedSysId = sysId;
      this.highlightCard(sysId);
      this.selectSystem(sysId, false);
      this.updateQrPreview(sysId);
    });

    this.modalEl.querySelector('#btn-download-qr')?.addEventListener('click', () => this.downloadQr(this._selectedSysId || activeSystemId));
    this.modalEl.querySelector('#btn-print-qr')?.addEventListener('click', () => window.print());
  }

  _renderBleStatus(connStatus) {
    const isReal  = connStatus.type === 'BLE_REAL';
    const isSim   = connStatus.type === 'BLE_SIMULATED';
    const dot     = isReal ? '#10b981' : isSim ? '#9333ea' : '#64748b';
    const label   = isReal ? `Connected: ${connStatus.deviceId}` :
                    isSim  ? 'Simulated Edge Mode (no hardware)' :
                             'Disconnected';
    return `
      <div style="display:flex; align-items:center; gap:8px; font-size:0.78rem; color:#94a3b8;">
        <span style="width:8px; height:8px; border-radius:50%; background:${dot}; flex-shrink:0;"></span>
        ${label}
      </div>
    `;
  }

  highlightCard(sysId) {
    this.modalEl.querySelectorAll('.system-choice-card').forEach((c) => {
      c.classList.toggle('active', c.getAttribute('data-sys-id') === sysId);
    });
  }

  async handleBleConnect() {
    const bleBtn = this.modalEl.querySelector('#btn-ble-connect');
    const statusRow = this.modalEl.querySelector('#ble-status-row');
    if (!bleBtn || !statusRow) return;

    bleBtn.textContent = 'Searching for device...';
    bleBtn.disabled = true;
    bleBtn.style.opacity = '0.7';

    const success = await connectionManager.connectRealBle();

    const connStatus = connectionManager.getConnectionStatus();
    statusRow.innerHTML = this._renderBleStatus(connStatus);

    if (success) {
      bleBtn.textContent = '✅ Connected – Close to start monitoring';
      bleBtn.style.background = 'rgba(16,185,129,0.2)';
      bleBtn.style.borderColor = '#10b981';
      bleBtn.style.color = '#10b981';
    } else {
      bleBtn.textContent = 'Pairing failed – running in simulated mode';
      bleBtn.style.opacity = '1';
      bleBtn.disabled = false;
    }
  }

  selectSystem(sysId, andClose = true) {
    qrService.identifySystem(sysId);
    if (this.onSystemSelected) {
      this.onSystemSelected(sysId);
    }
    if (andClose) this.close();
  }

  async startCamera() {
    const video = this.modalEl.querySelector('#qr-video');
    const statusMsg = this.modalEl.querySelector('#camera-status');
    if (!video) return;

    statusMsg.textContent = 'Requesting camera access...';
    const success = await qrService.startCameraScan(
      video,
      (detectedId) => {
        statusMsg.textContent = `Scanned: ${detectedId}! Identifying...`;
        setTimeout(() => {
          this.selectSystem(qrService.parsePayload(detectedId) || detectedId);
        }, 500);
      },
      (err) => {
        statusMsg.textContent = 'Camera not available or access denied. Please use the quick selector.';
      }
    );

    if (success) {
      statusMsg.textContent = 'Camera active. Center the QR code in the box.';
    }
  }

  updateQrPreview(sysId) {
    const holder = this.modalEl.querySelector('.qr-svg-holder');
    const link = this.modalEl.querySelector('#qr-generator-link');
    if (holder) holder.innerHTML = qrService.generateQrSvg(sysId);
    if (link) link.textContent = qrService.getSystemUrl(sysId);
    const idLabel = this.modalEl.querySelector('.badge-id-large');
    if (idLabel) idLabel.textContent = sysId;
  }

  downloadQr(sysId) {
    const svg = qrService.generateQrSvg(sysId);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sysId}-neersetu-qr.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  close() {
    qrService.stopCameraScan();
    this.modalEl.classList.remove('open');
    this.modalEl.setAttribute('aria-hidden', 'true');
  }
}
