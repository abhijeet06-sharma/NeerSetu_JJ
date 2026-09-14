// NeerSetu_JJ SIH Presentation Controller
// Implements the exact 12-step SIH demonstration workflow specified in Section 49

import { syncService } from '../services/syncService.js';
import { connectionManager } from '../services/connectionManager.js';
import { qrService } from '../services/qrService.js';

export class SihDemoController {
  constructor({ onNavigate, onScanQr, onInspectStage }) {
    this.onNavigate = onNavigate;
    this.onScanQr = onScanQr;
    this.onInspectStage = onInspectStage;
    this.container = null;
    this.currentStep = 1;
    this.isExpanded = false;

    this.steps = [
      {
        step: 1,
        title: 'Step 1: Scan QR Code',
        desc: 'Scan the physical QR plate attached to the purification unit.',
        action: () => {
          this.onNavigate('home');
          this.onScanQr();
        }
      },
      {
        step: 2,
        title: 'Step 2: System Identified',
        desc: 'System recognized as NEERSETU-T7 from local database cache.',
        action: () => {
          qrService.identifySystem('NEERSETU-T7');
          this.onNavigate('home');
        }
      },
      {
        step: 3,
        title: 'Step 3: Connect to ESP32 Edge',
        desc: 'Pair with local ESP32 via Bluetooth Low Energy.',
        action: () => {
          connectionManager.reconnect();
          this.onNavigate('home');
        }
      },
      {
        step: 4,
        title: 'Step 4: Show Live Water Readings',
        desc: 'Display TDS (182 ppm), Turbidity (1.7 NTU), pH (7.2), Temp (27.4°C).',
        action: () => {
          this.onNavigate('home');
        }
      },
      {
        step: 5,
        title: 'Step 5: Open Digital Twin',
        desc: 'View the 11-stage 2D Virtual Process Representation.',
        action: () => {
          this.onNavigate('twin');
        }
      },
      {
        step: 6,
        title: 'Step 6: Inspect Truthful States',
        desc: 'Observe LIVE (Stage 7), NOT CONNECTED (Stage 5, 9), and MODELLED (Other stages).',
        action: () => {
          this.onNavigate('twin');
        }
      },
      {
        step: 7,
        title: 'Step 7: Virtual Integration Reality',
        desc: 'Show physical modular units vs future integrated pipeline architecture.',
        action: () => {
          this.onNavigate('twin');
          const paneBtn = document.querySelector('[data-tab="physical_vs_digital"]');
          if (paneBtn) paneBtn.click();
        }
      },
      {
        step: 8,
        title: 'Step 8: Turn Internet OFF',
        desc: 'Simulate losing cellular/Internet connectivity in a rural dead-zone.',
        action: () => {
          syncService.setSimulatedOffline(true);
          this.onNavigate('offline');
        }
      },
      {
        step: 9,
        title: 'Step 9: Show Offline Mode',
        desc: 'Verify offline banner: local monitoring continues directly from ESP32.',
        action: () => {
          this.onNavigate('offline');
        }
      },
      {
        step: 10,
        title: 'Step 10: Continue Local Logging',
        desc: 'Measurements continue accumulating safely in IndexedDB local queue.',
        action: () => {
          this.onNavigate('home');
        }
      },
      {
        step: 11,
        title: 'Step 11: Restore Internet',
        desc: 'Internet connectivity is restored as user enters network coverage.',
        action: () => {
          syncService.setSimulatedOffline(false);
          this.onNavigate('offline');
        }
      },
      {
        step: 12,
        title: 'Step 12: Batch Synchronize',
        desc: 'Pending offline measurements automatically upload to cloud mirror.',
        action: () => {
          syncService.triggerSync();
          this.onNavigate('offline');
        }
      }
    ];
  }

  mount(parent) {
    this.container = document.createElement('div');
    this.container.className = 'sih-demo-bar-wrap';
    parent.appendChild(this.container);
    this.render();
  }

  render() {
    if (!this.container) return;

    const s = this.steps[this.currentStep - 1];

    this.container.innerHTML = `
      <div class="sih-demo-controller ${this.isExpanded ? 'expanded' : 'collapsed'}">
        <div class="demo-bar-main">
          <div class="demo-step-badge">
            <span class="badge-sih-star">★ SIH DEMO</span>
            <span class="step-counter">Step ${this.currentStep} of 12</span>
          </div>
          
          <div class="demo-step-info" role="button" id="btn-toggle-demo-expand">
            <div class="demo-step-title">${s.title}</div>
            <div class="demo-step-desc">${s.desc}</div>
          </div>

          <div class="demo-step-actions">
            <button class="btn-demo-nav" id="btn-demo-prev" ${this.currentStep === 1 ? 'disabled' : ''} title="Previous Step">‹</button>
            <button class="btn-demo-run" id="btn-demo-execute" title="Run this step">
              ▶ Run Step ${this.currentStep}
            </button>
            <button class="btn-demo-nav" id="btn-demo-next" ${this.currentStep === 12 ? 'disabled' : ''} title="Next Step">›</button>
            <button class="btn-demo-toggle-view" id="btn-demo-drawer-toggle">
              ${this.isExpanded ? '▼' : '▲'}
            </button>
          </div>
        </div>

        ${this.isExpanded ? `
          <div class="demo-stepper-drawer">
            <h5>Smart India Hackathon Presentation Sequence</h5>
            <div class="stepper-pills-list">
              ${this.steps.map((st) => `
                <div class="stepper-item ${st.step === this.currentStep ? 'active-step' : st.step < this.currentStep ? 'done-step' : ''}" data-step-num="${st.step}">
                  <span class="step-num-bubble">${st.step}</span>
                  <span class="step-name">${st.title.replace(/Step \d+: /, '')}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Attach listeners
    this.container.querySelector('#btn-demo-execute')?.addEventListener('click', () => {
      s.action();
    });

    this.container.querySelector('#btn-demo-prev')?.addEventListener('click', () => {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.render();
        this.steps[this.currentStep - 1].action();
      }
    });

    this.container.querySelector('#btn-demo-next')?.addEventListener('click', () => {
      if (this.currentStep < 12) {
        this.currentStep++;
        this.render();
        this.steps[this.currentStep - 1].action();
      }
    });

    this.container.querySelector('#btn-demo-drawer-toggle')?.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      this.render();
    });

    this.container.querySelectorAll('.stepper-item').forEach((item) => {
      item.addEventListener('click', () => {
        const stepNum = Number(item.getAttribute('data-step-num'));
        this.currentStep = stepNum;
        this.render();
        this.steps[this.currentStep - 1].action();
      });
    });
  }
}
