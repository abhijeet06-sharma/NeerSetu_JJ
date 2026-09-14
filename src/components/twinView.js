// NeerSetu_JJ Digital Twin Full Screen View
// Virtual Process Flow + Physical vs Digital Reality + What-If Simulation Sandbox

import { TwinRenderer } from '../twin/twinRenderer.js';
import { whatIfEngine } from '../twin/whatIfEngine.js';
import { connectionManager } from '../services/connectionManager.js';
import { syncService } from '../services/syncService.js';
import { i18n } from '../i18n/i18nEngine.js';

export class TwinView {
  constructor({ onStageClick }) {
    this.onStageClick = onStageClick;
    this.container = null;
    this.activeTab = 'virtual_flow'; // 'virtual_flow' | 'physical_vs_digital' | 'what_if'
    this.twinRenderer = null;
    this.currentReading = null;
    this.unsubscribeTelem = null;

    // Simulation inputs
    this.simTurbidity = 45;
    this.simHydrocarbons = 20;
    this.simHeavyMetals = 'HIGH';
    this.isSimulating = false;
  }

  mount(container) {
    this.container = container;
    this.render();

    this.unsubscribeTelem = connectionManager.onTelemetry((reading) => {
      this.currentReading = reading;
      if (this.twinRenderer && this.activeTab === 'virtual_flow') {
        this.updateRenderer();
      }
    });

    i18n.subscribe(() => this.render());
  }

  unmount() {
    if (this.unsubscribeTelem) this.unsubscribeTelem();
  }

  updateRenderer() {
    if (!this.twinRenderer) return;
    const isOnline = syncService.isOnline();
    const conn = connectionManager.getConnectionStatus();
    const isOffline = !conn.connected || conn.type === 'DISCONNECTED';

    const simResults = this.isSimulating ? whatIfEngine.getSimulationResults() : null;

    this.twinRenderer.updateState({
      telemetry: this.isSimulating ? simResults.finalSimulatedReading : this.currentReading,
      isOffline: isOffline,
      isSimulationActive: this.isSimulating,
      simulatedData: simResults
    });
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="twin-view-container">
        <!-- Sub-Navigation Tabs -->
        <div class="twin-nav-tabs">
          <button class="twin-tab-btn ${this.activeTab === 'virtual_flow' ? 'active' : ''}" data-tab="virtual_flow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>${i18n.t('tab_virtual_flow')}</span>
          </button>
          
          <button class="twin-tab-btn ${this.activeTab === 'physical_vs_digital' ? 'active' : ''}" data-tab="physical_vs_digital">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>${i18n.t('tab_physical_vs_digital')}</span>
          </button>
          
          <button class="twin-tab-btn ${this.activeTab === 'what_if' ? 'active' : ''}" data-tab="what_if">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>${i18n.t('tab_what_if')}</span>
          </button>
        </div>

        <!-- Tab 1: Virtual Process Flow -->
        <div class="twin-tab-pane ${this.activeTab === 'virtual_flow' ? 'active' : ''}" id="pane-virtual-flow">
          <div id="twin-diagram-mount"></div>
        </div>

        <!-- Tab 2: Physical vs Digital Reality Comparison -->
        <div class="twin-tab-pane ${this.activeTab === 'physical_vs_digital' ? 'active' : ''}" id="pane-phys-digital">
          <div class="reality-comparison-wrap">
            <div class="reality-banner">
              <h3>Engineering Distinction & Prototype Architecture</h3>
              <p>The current physical hardware prototype is intentionally modular. Digital Twin represents the future pipeline-integrated purification plant.</p>
            </div>

            <div class="reality-grid">
              <!-- Physical Prototype Reality -->
              <div class="reality-column col-physical">
                <div class="col-header">
                  <div class="col-icon">📦</div>
                  <div>
                    <h4>Current Physical Prototype</h4>
                    <span class="sub">Standalone Modular Hardware Containers</span>
                  </div>
                </div>

                <div class="reality-items-list">
                  <div class="reality-item item-avail">
                    <div class="item-title">
                      <span>✓ Oil Separation Module</span>
                      <span class="item-tag tag-standalone">Standalone Container</span>
                    </div>
                    <p>Physical belt skimmer & coalescing chamber exists as an independent unit. Currently tested with batch samples; no direct pipeline plumbed to filtration.</p>
                  </div>

                  <div class="reality-item item-avail">
                    <div class="item-title">
                      <span>✓ Multi-layer Filtration Column</span>
                      <span class="item-tag tag-standalone">Standalone Container</span>
                    </div>
                    <p>Physical cartridge containing Calcium-Alginate, PDC, and AZBC composite adsorbent beds. Loaded and tested independently.</p>
                  </div>

                  <div class="reality-item item-connected">
                    <div class="item-title">
                      <span>🟢 Optical Quality Chamber</span>
                      <span class="item-tag tag-connected">Connected via ESP32</span>
                    </div>
                    <p>Physical flow-through optical sensing chamber with 6-band photodiode array and ESP32 running TinyML INT8 model. <strong>This is the active live telemetry source.</strong></p>
                  </div>

                  <div class="reality-item item-future">
                    <div class="item-title">
                      <span>○ Transfer Pipelines & Pumps</span>
                      <span class="item-tag tag-future">Future Engineering Step</span>
                    </div>
                    <p>Physical plumbing and pump-assisted inter-module transfer pipes are scheduled for Phase 2 hardware consolidation.</p>
                  </div>
                </div>
              </div>

              <!-- Digital Process Twin -->
              <div class="reality-column col-digital">
                <div class="col-header">
                  <div class="col-icon">🌐</div>
                  <div>
                    <h4>Digital Process Twin</h4>
                    <span class="sub">Intended Integrated Process Flow</span>
                  </div>
                </div>

                <div class="digital-flow-preview">
                  <div class="df-step">1. Raw Water Intake</div>
                  <div class="df-arrow">↓</div>
                  <div class="df-step">2. Coarse Mesh Interception</div>
                  <div class="df-arrow">↓</div>
                  <div class="df-step">3. Oil/Hydrocarbon Extraction (Modelled)</div>
                  <div class="df-arrow">↓</div>
                  <div class="df-step">4. Multi-Layer Adsorption Beds (Modelled)</div>
                  <div class="df-arrow">↓</div>
                  <div class="df-step df-live">5. Optical Telemetry + TinyML (LIVE)</div>
                  <div class="df-arrow">↓</div>
                  <div class="df-step">6. UV Pathogen Inactivation (Modelled)</div>
                  <div class="df-arrow">↓</div>
                  <div class="df-step">7. Potable Dispensing Outlet</div>
                </div>

                <div class="engineering-verdict-box">
                  <strong>Core Engineering Principle:</strong><br/>
                  <em>"Validate physical modules independently → Digitally integrate process flow → Physically integrate pipelines in final deployment."</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: What-If Simulation Sandbox -->
        <div class="twin-tab-pane ${this.activeTab === 'what_if' ? 'active' : ''}" id="pane-what-if">
          <div class="what-if-sandbox">
            <div class="sandbox-header">
              <div class="badge-simulated-pill">🟣 ${i18n.t('state_simulated')} SANDBOX</div>
              <h3>What-If Process Simulation</h3>
              <p>Test how the virtual purification stages respond when raw water quality degrades (e.g. heavy coal slurry or acid mine runoff).</p>
            </div>

            <div class="sandbox-controls-grid">
              <!-- Slider 1: Raw Turbidity -->
              <div class="slider-box">
                <div class="slider-lbl-row">
                  <span>Raw Water Turbidity</span>
                  <span class="slider-val" id="lbl-turb">${this.simTurbidity} NTU</span>
                </div>
                <input type="range" id="rng-turb" min="5" max="150" value="${this.simTurbidity}" class="sim-slider"/>
                <span class="slider-hint">Monsoon flood / mining pit water typically 40-120 NTU</span>
              </div>

              <!-- Slider 2: Oil / Hydrocarbons -->
              <div class="slider-box">
                <div class="slider-lbl-row">
                  <span>Mining Hydrocarbons</span>
                  <span class="slider-val" id="lbl-oil">${this.simHydrocarbons} ppm</span>
                </div>
                <input type="range" id="rng-oil" min="0" max="80" value="${this.simHydrocarbons}" class="sim-slider"/>
                <span class="slider-hint">Machinery wash runoff from coal/iron mines</span>
              </div>

              <!-- Dropdown 3: Heavy Metal Risk -->
              <div class="slider-box">
                <div class="slider-lbl-row">
                  <span>Heavy Metal Risk (Fe / As / Pb)</span>
                  <span class="slider-val" id="lbl-metal">${this.simHeavyMetals}</span>
                </div>
                <select id="sel-metals" class="sim-select">
                  <option value="LOW" ${this.simHeavyMetals === 'LOW' ? 'selected' : ''}>LOW (Standard well water)</option>
                  <option value="MODERATE" ${this.simHeavyMetals === 'MODERATE' ? 'selected' : ''}>MODERATE (Nearby mine site)</option>
                  <option value="HIGH" ${this.simHeavyMetals === 'HIGH' ? 'selected' : ''}>HIGH (Active open cast runoff)</option>
                </select>
                <span class="slider-hint">Simulates Anthocyanin & AZBC bed adsorption load</span>
              </div>
            </div>

            <!-- Simulated Output Card -->
            <div class="sim-output-card" id="sim-results-box">
              <!-- Rendered dynamically -->
            </div>

            <div class="sandbox-actions">
              <button class="btn btn-primary" id="btn-apply-sim">
                Apply Simulation to Digital Twin Flow
              </button>
              <button class="btn btn-secondary" id="btn-reset-sim">
                ${i18n.t('btn_reset_simulation')}
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    // Initialize TwinRenderer if tab 1 is active
    if (this.activeTab === 'virtual_flow') {
      const mount = this.container.querySelector('#twin-diagram-mount');
      if (mount) {
        this.twinRenderer = new TwinRenderer(mount, (stage, telem, badge) => {
          if (this.onStageClick) this.onStageClick(stage, telem, badge);
        });
        this.updateRenderer();
      }
    }

    // Attach Tab click handlers
    this.container.querySelectorAll('.twin-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // What-If Slider controls
    const rngTurb = this.container.querySelector('#rng-turb');
    const rngOil = this.container.querySelector('#rng-oil');
    const selMetal = this.container.querySelector('#sel-metals');

    if (rngTurb && rngOil && selMetal) {
      rngTurb.addEventListener('input', (e) => {
        this.simTurbidity = Number(e.target.value);
        this.container.querySelector('#lbl-turb').textContent = `${this.simTurbidity} NTU`;
        this.updateSimulationBox();
      });

      rngOil.addEventListener('input', (e) => {
        this.simHydrocarbons = Number(e.target.value);
        this.container.querySelector('#lbl-oil').textContent = `${this.simHydrocarbons} ppm`;
        this.updateSimulationBox();
      });

      selMetal.addEventListener('change', (e) => {
        this.simHeavyMetals = e.target.value;
        this.container.querySelector('#lbl-metal').textContent = this.simHeavyMetals;
        this.updateSimulationBox();
      });

      this.updateSimulationBox();

      this.container.querySelector('#btn-apply-sim')?.addEventListener('click', () => {
        this.isSimulating = true;
        this.activeTab = 'virtual_flow';
        this.render();
      });

      this.container.querySelector('#btn-reset-sim')?.addEventListener('click', () => {
        this.isSimulating = false;
        this.activeTab = 'virtual_flow';
        this.render();
      });
    }
  }

  updateSimulationBox() {
    whatIfEngine.setRawWaterInputs({
      turbidity: this.simTurbidity,
      hydrocarbons: this.simHydrocarbons,
      heavyMetalsRisk: this.simHeavyMetals
    });

    const res = whatIfEngine.getSimulationResults();
    const box = this.container.querySelector('#sim-results-box');
    if (!box) return;

    box.innerHTML = `
      <div class="sim-result-header">
        <span class="badge-simulated">🟣 SIMULATION RESULT</span>
        <h4>Modelled Output After 11 Purification Stages</h4>
      </div>
      <div class="sim-metrics-grid">
        <div class="sim-m-card">
          <span class="k">Estimated Clean TDS</span>
          <span class="v">${res.finalSimulatedReading.tds} <small>ppm</small></span>
          <span class="note">Reduced by multi-layer adsorption</span>
        </div>
        <div class="sim-m-card">
          <span class="k">Treated Turbidity</span>
          <span class="v">${res.finalSimulatedReading.turbidity} <small>NTU</small></span>
          <span class="note">From raw ${res.raw.turbidity} NTU (${res.stageReductions.filtration.outputTurb} post-bed)</span>
        </div>
        <div class="sim-m-card">
          <span class="k">Residual Hydrocarbons</span>
          <span class="v">${res.stageReductions.oilSeparator.outputOil} <small>ppm</small></span>
          <span class="note">${res.stageReductions.oilSeparator.oilReduction} removal via separator</span>
        </div>
        <div class="sim-m-card">
          <span class="k">Heavy Metal Sequestration</span>
          <span class="v">${res.stageReductions.filtration.metalReduction}</span>
          <span class="note">Via AZBC composite & Calcium-Alginate</span>
        </div>
      </div>
    `;
  }
}
