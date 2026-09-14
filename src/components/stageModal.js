// NeerSetu_JJ Stage Inspection Modal
// Provides transparent physical status vs virtual digital twin breakdown

import { i18n } from '../i18n/i18nEngine.js';

export class StageModal {
  constructor() {
    this.modalEl = null;
    this.init();
  }

  init() {
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'modal-backdrop';
    this.modalEl.id = 'stage-detail-modal';
    this.modalEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.modalEl);

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl || e.target.closest('.modal-close-btn')) {
        this.close();
      }
    });
  }

  open(stage, telemetry, badge) {
    const isQualityChamber = stage.id === 'quality_chamber';
    const stageName = i18n.t(stage.nameKey, stage.defaultName);

    let telemetryBlock = '';
    if (isQualityChamber && telemetry) {
      telemetryBlock = `
        <div class="modal-section live-metrics-section">
          <h5>Live Hardware Telemetry</h5>
          <div class="modal-telemetry-grid">
            <div class="modal-telem-card">
              <span class="lbl">TDS</span>
              <span class="val">${telemetry.tds} <small>ppm</small></span>
            </div>
            <div class="modal-telem-card">
              <span class="lbl">Turbidity</span>
              <span class="val">${telemetry.turbidity} <small>NTU</small></span>
            </div>
            <div class="modal-telem-card">
              <span class="lbl">pH</span>
              <span class="val">${telemetry.ph}</span>
            </div>
            <div class="modal-telem-card">
              <span class="lbl">Water Temp</span>
              <span class="val">${telemetry.temperature} <small>°C</small></span>
            </div>
          </div>
          <div class="edge-tinyml-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <div>
              <strong>ESP32 Edge Status:</strong> Connected via BLE (240MHz)<br/>
              <strong>TinyML Inference:</strong> ${telemetry.tinyml ? telemetry.tinyml.model : 'Running on ESP32'} (Latency: 18ms, INT8)
            </div>
          </div>
        </div>
      `;
    } else {
      telemetryBlock = `
        <div class="modal-section honest-notice-box">
          <div class="notice-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Live Telemetry Not Connected
          </div>
          <p>This physical stage is not wired with live digital sensors in the current prototype. No fabricated telemetry is displayed.</p>
        </div>
      `;
    }

    // Parameters / Layers
    let parametersList = '';
    if (stage.layers) {
      parametersList = `
        <div class="modal-section">
          <h5>Adsorption Bed Layers (Multi-Layer Filtration)</h5>
          <ul class="layers-list">
            ${stage.layers.map((l) => `<li><span class="layer-bullet"></span>${l}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (stage.parameters) {
      parametersList = `
        <div class="modal-section">
          <h5>Modelled Process Specifications</h5>
          <div class="param-chips">
            ${Object.entries(stage.parameters).map(([k, v]) => `
              <div class="param-chip">
                <span class="chip-k">${k.replace(/_/g, ' ')}:</span>
                <span class="chip-v">${v}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    this.modalEl.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-labelledby="modal-title">
        <div class="modal-header">
          <div>
            <span class="stage-tag">Stage ${stage.number} of 11</span>
            <h3 id="modal-title" class="modal-title">${stageName}</h3>
          </div>
          <button class="modal-close-btn" aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body">
          <div class="modal-status-strip">
            <div class="strip-item">
              <span class="strip-lbl">Twin Representation</span>
              <span class="twin-state-badge ${badge.class}">${badge.label}</span>
            </div>
            <div class="strip-item">
              <span class="strip-lbl">Physical Module</span>
              <span class="strip-val ${stage.physicalStatus.includes('AVAILABLE') || stage.physicalStatus === 'LIVE_HARDWARE' ? 'txt-avail' : 'txt-concept'}">
                ${stage.physicalStatus.includes('AVAILABLE') || stage.physicalStatus === 'LIVE_HARDWARE' ? '✓ Physical module available' : '○ Conceptual / Modelled'}
              </span>
            </div>
            <div class="strip-item">
              <span class="strip-lbl">Current Connection</span>
              <span class="strip-val ${isQualityChamber ? 'txt-live' : 'txt-noconn'}">
                ${isQualityChamber ? '🟢 Connected (ESP32 BLE)' : '⚪ Not connected'}
              </span>
            </div>
          </div>

          <div class="modal-section">
            <h5>Process Purpose</h5>
            <p class="role-desc">${stage.role}</p>
          </div>

          <div class="modal-section">
            <h5>Current Physical Prototype Status</h5>
            <p class="phys-desc">${stage.physicalDesc}</p>
          </div>

          ${telemetryBlock}
          ${parametersList}
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">${i18n.t('btn_close')}</button>
        </div>
      </div>
    `;

    this.modalEl.classList.add('open');
    this.modalEl.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.modalEl.classList.remove('open');
    this.modalEl.setAttribute('aria-hidden', 'true');
  }
}
