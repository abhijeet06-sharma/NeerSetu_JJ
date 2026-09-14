// NeerSetu_JJ Technician & Judges Engineering Mode
// Detailed ADC voltages, optical absorbance spectrum, TinyML edge telemetry, and BIS standards configurator

import { connectionManager } from '../services/connectionManager.js';
import { standardsConfig } from '../services/standardsConfig.js';
import { syncService } from '../services/syncService.js';
import { i18n } from '../i18n/i18nEngine.js';

export class TechView {
  constructor() {
    this.container = null;
    this.currentReading = null;
    this.unsubscribeTelem = null;
    this.isConnectingBle = false;
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
    const sync = syncService.getState();
    const thresholds = standardsConfig.thresholds;

    const rawAdc = r?.raw_adc || {
      blue: 1842, red: 2190, white: 2950, green: 1912, ir: 3105, uv: 1420
    };

    // Calculate approximate photodiode voltages (ESP32 ADC Vref ~ 3.3V, 12-bit = 4095)
    const toVolt = (adc) => ((adc / 4095) * 3.3).toFixed(2);

    this.container.innerHTML = `
      <div class="tech-view-wrap">
        <div class="view-header-strip">
          <div>
            <div class="tech-badge-title">🛠️ TECHNICIAN & JUDGES CONSOLE</div>
            <h2 class="view-title">Edge Telemetry & Calibration Suite</h2>
            <span class="view-sub">Target: ${conn.systemId} • Edge MCU: ESP32-JH-007</span>
          </div>
          <div class="tech-conn-pill">
            ${conn.isRealBle ? '🟢 REAL BLE GATT' : '🔵 SIMULATED EDGE STREAM'}
          </div>
        </div>

        <!-- Hardware & Firmware Spec Banner -->
        <div class="tech-card hardware-spec-card">
          <div class="spec-grid">
            <div class="spec-cell">
              <span class="lbl">Microcontroller</span>
              <span class="val">ESP32-WROOM-32D (240MHz)</span>
            </div>
            <div class="spec-cell">
              <span class="lbl">Edge TinyML Runtime</span>
              <span class="val">${r?.tinyml?.model || 'INT8 Quantized MLP'}</span>
            </div>
            <div class="spec-cell">
              <span class="lbl">Inference Latency</span>
              <span class="val highlight">${r?.tinyml?.inference_time_ms || 18} ms</span>
            </div>
            <div class="spec-cell">
              <span class="lbl">Model RAM Footprint</span>
              <span class="val">24.2 KB (Zero cloud latency)</span>
            </div>
            <div class="spec-cell">
              <span class="lbl">Free Heap Memory</span>
              <span class="val">${r?.tinyml?.device_heap_free_kb || 184} KB</span>
            </div>
            <div class="spec-cell">
              <span class="lbl">Firmware Revision</span>
              <span class="val">v1.4.2-jh-mining-edge</span>
            </div>
          </div>
        </div>

        <!-- Optical Sensing Array (Raw ADC & Voltages) -->
        <div class="tech-card optical-adc-card">
          <div class="card-head">
            <h4>6-Band Optical LED Sensing Array</h4>
            <span class="head-sub">Multi-spectral absorption photodiode telemetry</span>
          </div>

          <div class="spectrum-channels-grid">
            <!-- Blue -->
            <div class="channel-card">
              <div class="chan-top">
                <span class="chan-dot dot-blue"></span>
                <span class="chan-name">Blue (470nm)</span>
              </div>
              <div class="chan-adc-val">${rawAdc.blue} <small>ADC</small></div>
              <div class="chan-volt">${toVolt(rawAdc.blue)} V</div>
              <div class="adc-progress-bar"><div style="width:${(rawAdc.blue/4095)*100}%; background:#38bdf8;"></div></div>
              <span class="chan-role">Turbidity & Colloid scatter</span>
            </div>

            <!-- Red -->
            <div class="channel-card">
              <div class="chan-top">
                <span class="chan-dot dot-red"></span>
                <span class="chan-name">Red (660nm)</span>
              </div>
              <div class="chan-adc-val">${rawAdc.red} <small>ADC</small></div>
              <div class="chan-volt">${toVolt(rawAdc.red)} V</div>
              <div class="adc-progress-bar"><div style="width:${(rawAdc.red/4095)*100}%; background:#ef4444;"></div></div>
              <span class="chan-role">Suspended particle attenuation</span>
            </div>

            <!-- White -->
            <div class="channel-card">
              <div class="chan-top">
                <span class="chan-dot dot-white"></span>
                <span class="chan-name">White (450-700nm)</span>
              </div>
              <div class="chan-adc-val">${rawAdc.white} <small>ADC</small></div>
              <div class="chan-volt">${toVolt(rawAdc.white)} V</div>
              <div class="adc-progress-bar"><div style="width:${(rawAdc.white/4095)*100}%; background:#f8fafc;"></div></div>
              <span class="chan-role">Broadband baseline reference</span>
            </div>

            <!-- Green -->
            <div class="channel-card">
              <div class="chan-top">
                <span class="chan-dot dot-green"></span>
                <span class="chan-name">Green (525nm)</span>
              </div>
              <div class="chan-adc-val">${rawAdc.green} <small>ADC</small></div>
              <div class="chan-volt">${toVolt(rawAdc.green)} V</div>
              <div class="adc-progress-bar"><div style="width:${(rawAdc.green/4095)*100}%; background:#10b981;"></div></div>
              <span class="chan-role">Organic & algae chlorophyll</span>
            </div>

            <!-- IR -->
            <div class="channel-card">
              <div class="chan-top">
                <span class="chan-dot dot-ir"></span>
                <span class="chan-name">IR (850nm)</span>
              </div>
              <div class="chan-adc-val">${rawAdc.ir} <small>ADC</small></div>
              <div class="chan-volt">${toVolt(rawAdc.ir)} V</div>
              <div class="adc-progress-bar"><div style="width:${(rawAdc.ir/4095)*100}%; background:#a855f7;"></div></div>
              <span class="chan-role">Total dissolved solids correlation</span>
            </div>

            <!-- UV -->
            <div class="channel-card">
              <div class="chan-top">
                <span class="chan-dot dot-uv"></span>
                <span class="chan-name">UV (385nm)</span>
              </div>
              <div class="chan-adc-val">${rawAdc.uv} <small>ADC</small></div>
              <div class="chan-volt">${toVolt(rawAdc.uv)} V</div>
              <div class="adc-progress-bar"><div style="width:${(rawAdc.uv/4095)*100}%; background:#6366f1;"></div></div>
              <span class="chan-role">Anthocyanin reagent absorbance</span>
            </div>
          </div>
        </div>

        <!-- Web Bluetooth & Hardware Connection Controls -->
        <div class="tech-card connection-tools-card">
          <h4>Hardware Adapter Configuration</h4>
          <p>Switch between real Web Bluetooth pairing with physical ESP32 and local high-fidelity edge emulation.</p>
          
          <div class="conn-buttons-row">
            <button class="btn btn-primary" id="btn-scan-real-ble" ${this.isConnectingBle ? 'disabled' : ''}>
              ${this.isConnectingBle ? 'Searching for NeerSetu ESP32...' : 'Pair Real ESP32 via Web Bluetooth'}
            </button>
            <button class="btn btn-secondary" id="btn-reconnect-sim">
              Reset Simulated Edge Stream
            </button>
            <button class="btn btn-outline" id="btn-disconnect-edge">
              Disconnect Live Edge Feed
            </button>
          </div>
        </div>

        <!-- BIS 10500 Threshold Settings -->
        <div class="tech-card threshold-config-card">
          <div class="card-head">
            <h4>${i18n.t('threshold_config')}</h4>
            <span class="head-sub">Configure water quality alert boundaries</span>
          </div>

          <div class="threshold-sliders-grid">
            <div class="thresh-cell">
              <label>TDS Desirable Limit: <strong id="val-tds-acc">${thresholds.tds.acceptable} ppm</strong></label>
              <input type="range" id="rng-tds-acc" min="100" max="1000" step="50" value="${thresholds.tds.acceptable}"/>
            </div>
            <div class="thresh-cell">
              <label>TDS Critical Limit: <strong id="val-tds-crit">${thresholds.tds.critical} ppm</strong></label>
              <input type="range" id="rng-tds-crit" min="1000" max="3000" step="100" value="${thresholds.tds.critical}"/>
            </div>
            <div class="thresh-cell">
              <label>Turbidity Desirable: <strong id="val-turb-acc">${thresholds.turbidity.acceptable} NTU</strong></label>
              <input type="range" id="rng-turb-acc" min="0.5" max="3.0" step="0.1" value="${thresholds.turbidity.acceptable}"/>
            </div>
            <div class="thresh-cell">
              <label>Turbidity Critical: <strong id="val-turb-crit">${thresholds.turbidity.critical} NTU</strong></label>
              <input type="range" id="rng-turb-crit" min="3.0" max="10.0" step="0.5" value="${thresholds.turbidity.critical}"/>
            </div>
          </div>

          <div class="thresh-actions">
            <button class="btn btn-secondary" id="btn-reset-thresh">Reset to BIS 10500 Defaults</button>
          </div>
        </div>

      </div>
    `;

    // Bluetooth pair button
    this.container.querySelector('#btn-scan-real-ble')?.addEventListener('click', async () => {
      this.isConnectingBle = true;
      this.render();
      try {
        await connectionManager.connectRealBle();
      } catch (e) {
        alert(e.message);
      } finally {
        this.isConnectingBle = false;
        this.render();
      }
    });

    this.container.querySelector('#btn-reconnect-sim')?.addEventListener('click', () => {
      connectionManager.reconnect();
    });

    this.container.querySelector('#btn-disconnect-edge')?.addEventListener('click', () => {
      connectionManager.disconnect();
    });

    // Threshold sliders
    const rngTdsAcc = this.container.querySelector('#rng-tds-acc');
    const rngTdsCrit = this.container.querySelector('#rng-tds-crit');
    const rngTurbAcc = this.container.querySelector('#rng-turb-acc');
    const rngTurbCrit = this.container.querySelector('#rng-turb-crit');

    if (rngTdsAcc && rngTdsCrit && rngTurbAcc && rngTurbCrit) {
      rngTdsAcc.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.container.querySelector('#val-tds-acc').textContent = `${val} ppm`;
        standardsConfig.saveThresholds({ tds: { ...thresholds.tds, acceptable: val } });
      });

      rngTdsCrit.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.container.querySelector('#val-tds-crit').textContent = `${val} ppm`;
        standardsConfig.saveThresholds({ tds: { ...thresholds.tds, critical: val } });
      });

      rngTurbAcc.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.container.querySelector('#val-turb-acc').textContent = `${val} NTU`;
        standardsConfig.saveThresholds({ turbidity: { ...thresholds.turbidity, acceptable: val } });
      });

      rngTurbCrit.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.container.querySelector('#val-turb-crit').textContent = `${val} NTU`;
        standardsConfig.saveThresholds({ turbidity: { ...thresholds.turbidity, critical: val } });
      });

      this.container.querySelector('#btn-reset-thresh')?.addEventListener('click', () => {
        standardsConfig.resetToDefault();
        this.render();
      });
    }
  }
}
