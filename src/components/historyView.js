// NeerSetu_JJ History View
// Lightweight canvas time-series chart with clear LOCAL vs CLOUD history distinctions

import { localDb } from '../db/localDb.js';
import { connectionManager } from '../services/connectionManager.js';
import { i18n } from '../i18n/i18nEngine.js';

export class HistoryView {
  constructor() {
    this.container = null;
    this.activeMetric = 'tds'; // 'tds' | 'turbidity' | 'ph' | 'temp'
    this.activeFilter = 'today'; // 'today' | '7days' | 'all'
    this.historyRecords = [];
    this.selectedRecord = null;
  }

  async mount(container) {
    this.container = container;
    await this.loadHistory();
    this.render();
    i18n.subscribe(() => this.render());
  }

  unmount() {}

  async loadHistory() {
    const sysId = connectionManager.getActiveSystemId();
    this.historyRecords = await localDb.getTelemetryForSystem(sysId, 60);
    if (this.historyRecords.length > 0 && !this.selectedRecord) {
      this.selectedRecord = this.historyRecords[0];
    }
  }

  render() {
    if (!this.container) return;

    const sysId = connectionManager.getActiveSystemId();

    this.container.innerHTML = `
      <div class="history-view-wrap">
        <div class="view-header-strip">
          <div>
            <h2 class="view-title">${i18n.t('nav_history')}</h2>
            <span class="view-sub">${sysId} • Local Database & Cloud Synced</span>
          </div>
          <!-- Metric Selectors -->
          <div class="metric-filter-pills">
            <button class="m-pill ${this.activeMetric === 'tds' ? 'active' : ''}" data-metric="tds">TDS</button>
            <button class="m-pill ${this.activeMetric === 'turbidity' ? 'active' : ''}" data-metric="turbidity">Turbidity</button>
            <button class="m-pill ${this.activeMetric === 'ph' ? 'active' : ''}" data-metric="ph">pH</button>
            <button class="m-pill ${this.activeMetric === 'temp' ? 'active' : ''}" data-metric="temp">Temp</button>
          </div>
        </div>

        <!-- Canvas Chart Card -->
        <div class="history-chart-card">
          <div class="chart-header">
            <div class="chart-metric-title">
              <span class="chart-param-name">${this.getMetricTitle()}</span>
              <span class="chart-legend-local">● LOCAL HISTORY</span>
              <span class="chart-legend-cloud">○ CLOUD SYNCED</span>
            </div>
            <div class="chart-range-pills">
              <button class="r-pill ${this.activeFilter === 'today' ? 'active' : ''}" data-filter="today">Today</button>
              <button class="r-pill ${this.activeFilter === '7days' ? 'active' : ''}" data-filter="7days">7 Days</button>
            </div>
          </div>

          <div class="canvas-chart-holder">
            <canvas id="history-chart-canvas" width="600" height="220"></canvas>
          </div>
          <div class="chart-tap-hint">Tap any record in the table below to inspect full measurement details.</div>
        </div>

        <!-- Selected Record Detail Card (if tapped) -->
        ${this.selectedRecord ? `
          <div class="selected-record-box">
            <div class="sel-rec-header">
              <span class="sel-rec-time">🕒 ${new Date(this.selectedRecord.timestamp).toLocaleString()}</span>
              <span class="sel-rec-sync-tag ${this.selectedRecord.sync_status === 'SYNCED' ? 'tag-synced' : 'tag-local'}">
                ${this.selectedRecord.sync_status === 'SYNCED' ? '☁️ CLOUD SYNCED' : '📱 LOCAL STORED'}
              </span>
            </div>
            <div class="sel-rec-grid">
              <div class="sel-item"><span class="k">TDS</span><span class="v">${this.selectedRecord.tds} ppm</span></div>
              <div class="sel-item"><span class="k">Turbidity</span><span class="v">${this.selectedRecord.turbidity} NTU</span></div>
              <div class="sel-item"><span class="k">pH</span><span class="v">${this.selectedRecord.ph}</span></div>
              <div class="sel-item"><span class="k">Water Temp</span><span class="v">${this.selectedRecord.temperature} °C</span></div>
              <div class="sel-item"><span class="k">Status</span><span class="v badge-live">${this.selectedRecord.water_status}</span></div>
              <div class="sel-item"><span class="k">Data Source</span><span class="v">${this.selectedRecord.data_source}</span></div>
            </div>
          </div>
        ` : ''}

        <!-- Recent Records Table -->
        <div class="history-table-card">
          <h4>Logged Measurement History</h4>
          <div class="table-responsive">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>TDS</th>
                  <th>Turbidity</th>
                  <th>pH</th>
                  <th>Status</th>
                  <th>Storage</th>
                </tr>
              </thead>
              <tbody>
                ${this.historyRecords.slice(0, 15).map((rec) => `
                  <tr class="history-row ${this.selectedRecord?.id === rec.id ? 'active-row' : ''}" data-rec-id="${rec.id}">
                    <td>${new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><strong>${rec.tds}</strong> <small>ppm</small></td>
                    <td>${rec.turbidity} <small>NTU</small></td>
                    <td>${rec.ph}</td>
                    <td>
                      <span class="mini-status-chip ${rec.water_status === 'GOOD' ? 'chip-good' : rec.water_status === 'ATTENTION' ? 'chip-att' : 'chip-crit'}">
                        ${rec.water_status}
                      </span>
                    </td>
                    <td>
                      <span class="storage-pill ${rec.sync_status === 'SYNCED' ? 'pill-cloud' : 'pill-local'}">
                        ${rec.sync_status === 'SYNCED' ? 'Cloud' : 'Local'}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Draw the Canvas Chart
    setTimeout(() => this.drawChart(), 50);

    // Metric selector buttons
    this.container.querySelectorAll('.m-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeMetric = btn.getAttribute('data-metric');
        this.render();
      });
    });

    // Time filter pills
    this.container.querySelectorAll('.r-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.getAttribute('data-filter');
        this.render();
      });
    });

    // Row selection clicks
    this.container.querySelectorAll('.history-row').forEach((row) => {
      row.addEventListener('click', () => {
        const id = Number(row.getAttribute('data-rec-id'));
        this.selectedRecord = this.historyRecords.find((r) => r.id === id);
        this.render();
      });
    });
  }

  getMetricTitle() {
    switch (this.activeMetric) {
      case 'tds': return 'TDS (ppm) Trend';
      case 'turbidity': return 'Turbidity (NTU) Trend';
      case 'ph': return 'pH Trend';
      case 'temp': return 'Temperature (°C) Trend';
      default: return 'Telemetry Trend';
    }
  }

  drawChart() {
    const canvas = this.container.querySelector('#history-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (this.historyRecords.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText('No historical readings logged yet', width / 2 - 100, height / 2);
      return;
    }

    // Chronological order (oldest to newest)
    const dataPoints = [...this.historyRecords].reverse().slice(-24);

    const values = dataPoints.map((d) => {
      if (this.activeMetric === 'tds') return d.tds;
      if (this.activeMetric === 'turbidity') return d.turbidity;
      if (this.activeMetric === 'ph') return d.ph;
      if (this.activeMetric === 'temp') return d.temperature;
      return d.tds;
    });

    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1 || 1;

    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Draw horizontal grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';

    for (let i = 0; i <= 4; i++) {
      const y = padTop + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      const valLabel = (maxVal - ((maxVal - minVal) / 4) * i).toFixed(this.activeMetric === 'tds' ? 0 : 1);
      ctx.fillText(valLabel, 8, y + 4);
    }

    // Coordinates generator
    const coords = dataPoints.map((d, idx) => {
      const x = padLeft + (chartW / (dataPoints.length - 1 || 1)) * idx;
      const val = values[idx];
      const y = padTop + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;
      return { x, y, record: d };
    });

    // Draw smooth line & area gradient
    const grad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    grad.addColorStop(0, 'rgba(2, 132, 199, 0.35)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0.0)');

    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(coords[coords.length - 1].x, height - padBottom);
    ctx.lineTo(coords[0].x, height - padBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw point circles (filled if local, ring if cloud)
    coords.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      if (pt.record.sync_status === 'SYNCED') {
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }
}
