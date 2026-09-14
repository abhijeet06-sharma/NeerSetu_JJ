// NeerSetu_JJ 2D Digital Twin Interactive Renderer
// Honest data-state representation with tappable stages and animated water flow

import { STAGES_CONFIG } from './twinModel.js';
import { i18n } from '../i18n/i18nEngine.js';

export class TwinRenderer {
  constructor(containerElement, onStageClick) {
    this.container = containerElement;
    this.onStageClick = onStageClick;
    this.currentTelemetry = null;
    this.isOffline = false;
    this.isSimulationActive = false;
    this.simulatedData = null;
  }

  updateState({ telemetry, isOffline, isSimulationActive, simulatedData }) {
    this.currentTelemetry = telemetry;
    this.isOffline = isOffline;
    this.isSimulationActive = isSimulationActive;
    this.simulatedData = simulatedData;
    this.render();
  }

  getStageBadge(stage) {
    if (this.isSimulationActive) {
      return { label: i18n.t('state_simulated'), class: 'badge-simulated' };
    }

    if (stage.id === 'quality_chamber') {
      if (this.isOffline) {
        return { label: i18n.t('state_cached'), class: 'badge-cached' };
      }
      return { label: i18n.t('state_live'), class: 'badge-live' };
    }

    if (stage.baseDataSource === 'NOT_CONNECTED') {
      return { label: i18n.t('state_not_connected'), class: 'badge-not-connected' };
    }

    return { label: i18n.t('state_modelled'), class: 'badge-modelled' };
  }

  render() {
    if (!this.container) return;

    const stagesHtml = STAGES_CONFIG.map((stage, index) => {
      const badge = this.getStageBadge(stage);
      const isQualityChamber = stage.id === 'quality_chamber';
      const stageName = i18n.t(stage.nameKey, stage.defaultName);

      // Value readout preview on card
      let readoutHtml = '';
      if (isQualityChamber && this.currentTelemetry) {
        readoutHtml = `
          <div class="twin-stage-metric-preview">
            <span class="preview-item">TDS: <strong>${this.currentTelemetry.tds} ppm</strong></span>
            <span class="preview-item">Turb: <strong>${this.currentTelemetry.turbidity} NTU</strong></span>
            <span class="preview-item">pH: <strong>${this.currentTelemetry.ph}</strong></span>
          </div>
        `;
      } else if (stage.parameters) {
        const firstParamKey = Object.keys(stage.parameters)[0];
        const firstParamVal = stage.parameters[firstParamKey];
        readoutHtml = `
          <div class="twin-stage-param-preview">
            <span class="param-tag">${firstParamKey.replace(/_/g, ' ')}: ${firstParamVal}</span>
          </div>
        `;
      }

      const isLast = index === STAGES_CONFIG.length - 1;

      return `
        <div class="twin-stage-card ${isQualityChamber ? 'highlight-live' : ''} ${this.isSimulationActive ? 'highlight-simulated' : ''}" 
             data-stage-id="${stage.id}"
             role="button"
             tabindex="0">
          <div class="twin-stage-header">
            <div class="twin-stage-num">${stage.number}</div>
            <div class="twin-stage-title-wrap">
              <h4 class="twin-stage-title">${stageName}</h4>
              <span class="twin-stage-role">${stage.role}</span>
            </div>
            <span class="twin-state-badge ${badge.class}">${badge.label}</span>
          </div>
          
          ${readoutHtml}

          <div class="twin-stage-footer">
            <span class="twin-phys-indicator ${stage.physicalStatus.includes('AVAILABLE') || stage.physicalStatus === 'LIVE_HARDWARE' ? 'phys-avail' : 'phys-concept'}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              ${stage.physicalDesc}
            </span>
            <span class="twin-tap-hint">${i18n.t('btn_inspect')} →</span>
          </div>
        </div>

        ${!isLast ? `
          <div class="twin-flow-connector" aria-hidden="true">
            <div class="flow-line">
              <span class="flow-particle particle-1"></span>
              <span class="flow-particle particle-2"></span>
            </div>
            <svg class="flow-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>
        ` : ''}
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="twin-wrapper">
        <div class="twin-banner">
          <div class="twin-banner-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <div class="twin-banner-title">${i18n.t('twin_title')}</div>
            <div class="twin-banner-sub">${i18n.t('twin_subtitle')}</div>
          </div>
        </div>

        <div class="twin-truth-alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>${i18n.t('twin_notice')}</span>
        </div>

        <!-- Legend -->
        <div class="twin-legend-bar">
          <span class="legend-item"><span class="legend-dot dot-live"></span> ${i18n.t('state_live')}</span>
          <span class="legend-item"><span class="legend-dot dot-modelled"></span> ${i18n.t('state_modelled')}</span>
          <span class="legend-item"><span class="legend-dot dot-not-connected"></span> ${i18n.t('state_not_connected')}</span>
          <span class="legend-item"><span class="legend-dot dot-cached"></span> ${i18n.t('state_cached')}</span>
          <span class="legend-item"><span class="legend-dot dot-simulated"></span> ${i18n.t('state_simulated')}</span>
        </div>

        <!-- Stages Flow Column -->
        <div class="twin-stages-flow">
          ${stagesHtml}
        </div>
      </div>
    `;

    // Attach click listeners to all stage cards
    this.container.querySelectorAll('.twin-stage-card').forEach((card) => {
      const stageId = card.getAttribute('data-stage-id');
      const stage = STAGES_CONFIG.find((s) => s.id === stageId);
      card.addEventListener('click', () => {
        if (this.onStageClick && stage) {
          this.onStageClick(stage, this.currentTelemetry, this.getStageBadge(stage));
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (this.onStageClick && stage) {
            this.onStageClick(stage, this.currentTelemetry, this.getStageBadge(stage));
          }
        }
      });
    });
  }
}
