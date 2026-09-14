// NeerSetu_JJ Detailed Live Monitor View
// Clean telemetry cards + collapsible Technical Details for technicians & judges

import { i18n } from '../i18n/i18nEngine.js';
import { connectionManager } from '../services/connectionManager.js';

export class MonitorView {
  constructor({ onNavigate }) {
    this.onNavigate = onNavigate;
    this.container = null;
    this.currentReading = null;
    this.showTechnicalDetails = false;
    this.unsubscribeTelem = null;
  }

  mount(container) {
    this.container = container;
    this.unsubscribeTelem = connectionManager.onTelemetry((reading) => {
      this.currentReading = reading;
      this.render();
    });
    i18n.subscribe(() => this.render());
  }

  unmount() {
    if (this.unsubscribeTelem) this.unsubscribeTelem();
  }

  render() {
    if (!this.container) return;

    const r = this.currentReading;
    const conn = connectionManager.getConnectionStatus();
    const isLive = conn.connected && conn.type !== 'DISCONNECTED';
    const timestampStr = r ? new Date(r.timestamp).toLocaleTimeString() : '--:--:--';

    const rawAdc = r?.raw_adc || {
      blue: 1842, red: 2190, white: 2950, green: 1912, ir: 3105, uv: 1420
    };

    this.container.innerHTML = `
      <div class="monitor-view-wrap">
        <div class="view-header-strip">
          <div>
            <h2 class="view-title">${i18n.t('nav_monitor')}</h2>
            <span class="view-sub">${conn.systemId} • ${isLive ? '🟢 LIVE via Bluetooth' : '🟠 CACHED'}</span>
          </div>
          <div class="monitor-timestamp">
            <span class="time-lbl">${i18n.t('updated_at')}</span>
            <span class="time-val">${timestampStr}</span>
          </div>
        </div>

        <!-- Telemetry Cards -->
        <div class="monitor-cards-grid">
          <!-- TDS Card -->
          <div class="monitor-card">
            <div class="mcard-top">
              <span class="mcard-name">${i18n.t('param_tds')}</span>
              <span class="mcard-source-tag badge-live">${r ? r.data_source : 'LIVE'}</span>
            </div>
            <div class="mcard-val-row">
              <span class="mcard-number">${r ? r.tds : '--'}</span>
              <span class="mcard-unit">ppm</span>
            </div>
            <div class="mcard-bar-wrap">
              <div class="mcard-bar-fill" style="width: ${Math.min(100, (r?.tds || 0) / 10)}%; background: #10b981;"></div>
            </div>
            <div class="mcard-limit-note">BIS Desirable: &lt; 500 ppm</div>
          </div>

          <!-- Turbidity Card -->
          <div class="monitor-card">
            <div class="mcard-top">
              <span class="mcard-name">${i18n.t('param_turbidity')}</span>
              <span class="mcard-source-tag badge-live">${r ? r.data_source : 'LIVE'}</span>
            </div>
            <div class="mcard-val-row">
              <span class="mcard-number">${r ? r.turbidity : '--'}</span>
              <span class="mcard-unit">NTU</span>
            </div>
            <div class="mcard-bar-wrap">
              <div class="mcard-bar-fill" style="width: ${Math.min(100, (r?.turbidity || 0) * 20)}%; background: #0284c7;"></div>
            </div>
            <div class="mcard-limit-note">BIS Desirable: &lt; 1.0 NTU</div>
          </div>

          <!-- pH Card -->
          <div class="monitor-card">
            <div class="mcard-top">
              <span class="mcard-name">${i18n.t('param_ph')}</span>
              <span class="mcard-source-tag badge-live">${r ? r.data_source : 'LIVE'}</span>
            </div>
            <div class="mcard-val-row">
              <span class="mcard-number">${r ? r.ph : '--'}</span>
              <span class="mcard-unit">pH</span>
            </div>
            <div class="mcard-bar-wrap">
              <div class="mcard-bar-fill" style="width: ${((r?.ph || 7) / 14) * 100}%; background: #38bdf8;"></div>
            </div>
            <div class="mcard-limit-note">Acceptable Range: 6.5 - 8.5</div>
          </div>

          <!-- Temperature Card -->
          <div class="monitor-card">
            <div class="mcard-top">
              <span class="mcard-name">${i18n.t('param_temp')}</span>
              <span class="mcard-source-tag badge-live">${r ? r.data_source : 'LIVE'}</span>
            </div>
            <div class="mcard-val-row">
              <span class="mcard-number">${r ? r.temperature : '--'}</span>
              <span class="mcard-unit">°C</span>
            </div>
            <div class="mcard-bar-wrap">
              <div class="mcard-bar-fill" style="width: ${((r?.temperature || 25) / 50) * 100}%; background: #f59e0b;"></div>
            </div>
            <div class="mcard-limit-note">Ambient Sensor Range: 15°C - 38°C</div>
          </div>
        </div>

        <!-- Collapsible Technical Details (Not exposed by default) -->
        <div class="tech-collapsible-box">
          <button class="tech-toggle-btn" id="btn-toggle-tech">
            <span>⚙️ Technical & Optical Channel Details</span>
            <svg class="chevron-icon ${this.showTechnicalDetails ? 'open' : ''}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          ${this.showTechnicalDetails ? `
            <div class="tech-details-content">
              <!-- Edge Hardware & TinyML Info -->
              <div class="tech-row-box">
                <div class="tech-stat-chip">
                  <span class="k">ESP32 Core</span>
                  <span class="v">Xtensa Dual-Core 240MHz</span>
                </div>
                <div class="tech-stat-chip">
                  <span class="k">TinyML Model</span>
                  <span class="v">${r?.tinyml?.model || 'INT8 Quantized'}</span>
                </div>
                <div class="tech-stat-chip">
                  <span class="k">Inference Latency</span>
                  <span class="v">${r?.tinyml?.inference_time_ms || 18} ms</span>
                </div>
                <div class="tech-stat-chip">
                  <span class="k">Free Heap</span>
                  <span class="v">${r?.tinyml?.device_heap_free_kb || 184} KB</span>
                </div>
              </div>

              <!-- Optical Spectrum Channels ADC (12-bit 0-4095) -->
              <div class="optical-spectrum-box">
                <h5>Optical Sensing Array - Raw ADC Channels</h5>
                <p class="optical-sub">Direct photodiode transimpedance amplifier readings from ESP32 ADC1:</p>
                <div class="optical-channels-grid">
                  <div class="opt-col col-blue">
                    <span class="channel-dot dot-blue"></span>
                    <span class="chan-label">Blue (470nm)</span>
                    <span class="chan-adc">${rawAdc.blue}</span>
                    <div class="adc-micro-bar"><div style="height:${(rawAdc.blue/4095)*100}%;"></div></div>
                  </div>
                  <div class="opt-col col-red">
                    <span class="channel-dot dot-red"></span>
                    <span class="chan-label">Red (660nm)</span>
                    <span class="chan-adc">${rawAdc.red}</span>
                    <div class="adc-micro-bar"><div style="height:${(rawAdc.red/4095)*100}%;"></div></div>
                  </div>
                  <div class="opt-col col-white">
                    <span class="channel-dot dot-white"></span>
                    <span class="chan-label">White (Broad)</span>
                    <span class="chan-adc">${rawAdc.white}</span>
                    <div class="adc-micro-bar"><div style="height:${(rawAdc.white/4095)*100}%;"></div></div>
                  </div>
                  <div class="opt-col col-green">
                    <span class="channel-dot dot-green"></span>
                    <span class="chan-label">Green (525nm)</span>
                    <span class="chan-adc">${rawAdc.green}</span>
                    <div class="adc-micro-bar"><div style="height:${(rawAdc.green/4095)*100}%;"></div></div>
                  </div>
                  <div class="opt-col col-ir">
                    <span class="channel-dot dot-ir"></span>
                    <span class="chan-label">IR (850nm)</span>
                    <span class="chan-adc">${rawAdc.ir}</span>
                    <div class="adc-micro-bar"><div style="height:${(rawAdc.ir/4095)*100}%;"></div></div>
                  </div>
                  <div class="opt-col col-uv">
                    <span class="channel-dot dot-uv"></span>
                    <span class="chan-label">UV (385nm)</span>
                    <span class="chan-adc">${rawAdc.uv}</span>
                    <div class="adc-micro-bar"><div style="height:${(rawAdc.uv/4095)*100}%;"></div></div>
                  </div>
                </div>
              </div>

              <!-- Action to Technician Mode -->
              <div class="tech-cta-row">
                <button class="btn btn-secondary" id="btn-open-full-tech">
                  Open Complete Technician & Calibration Suite →
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Toggle tech details
    this.container.querySelector('#btn-toggle-tech')?.addEventListener('click', () => {
      this.showTechnicalDetails = !this.showTechnicalDetails;
      this.render();
    });

    this.container.querySelector('#btn-open-full-tech')?.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('tech');
    });
  }
}
