// NeerSetu_JJ Connection & Hardware Adapter Manager
// Web Bluetooth (Real Hardware) + Local Edge Stream + Graceful Fallbacks
//
// CONNECTION MODES:
//   BLE_REAL       – paired physical ESP32 via Web Bluetooth GATT
//   BLE_SIMULATED  – demo/offline mode using realistic per-system dummy data
//   DISCONNECTED   – no edge source, reads stale DB cache

import { localDb } from '../db/localDb.js';
import { standardsConfig } from './standardsConfig.js';

// ─────────────────────────────────────────────────────────────────────────────
// Per-system profiles: baseline sensor values + expected water quality state
// SAFE systems: close to BIS 10500:2012 limits
// UNSAFE systems: values exceed limits to represent contaminated sources
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROFILES = {
  'NEERSETU-T7': {
    deviceId: 'ESP32-JH-007',
    // Safe: TDS <500, Turbidity <1 NTU (acceptable), pH 6.5-8.5
    baseline: { tds: 220, turbidity: 0.7, ph: 7.2, temperature: 27.4 },
    bleNameHint: 'NeerSetu-T7',    // Partial BLE advertised name to match
    expectedStatus: 'GOOD'
  },
  'AQUA-JH-001': {
    deviceId: 'ESP32-JH-001',
    // Borderline: TDS elevated, turbidity at upper limit – ATTENTION state
    baseline: { tds: 650, turbidity: 2.4, ph: 6.8, temperature: 28.5 },
    bleNameHint: 'NeerSetu-001',
    expectedStatus: 'ATTENTION'
  },
  'AQUA-JH-MINING-03': {
    deviceId: 'ESP32-JH-019',
    // Unsafe: High TDS (acid mine drainage), high turbidity, low pH – CRITICAL
    baseline: { tds: 1450, turbidity: 8.0, ph: 5.5, temperature: 29.1 },
    bleNameHint: 'NeerSetu-M03',
    expectedStatus: 'CRITICAL'
  }
};

// BIS 10500:2012 – desirable/permissible limits used to drive status
// (Detailed threshold logic lives in standardsConfig.js)
// Quick override for legacy/unnamed systems
const DEFAULT_PROFILE = {
  deviceId: 'ESP32-UNKNOWN',
  baseline: { tds: 250, turbidity: 2.5, ph: 7.0, temperature: 27.0 },
  bleNameHint: 'NeerSetu',
  expectedStatus: 'ATTENTION'
};

// ─────────────────────────────────────────────────────────────────────────────
// NeerSetu ESP32 BLE GATT Service / Characteristic UUIDs
// These match the firmware definitions in `firmware/neersetu_ble.ino`
// ─────────────────────────────────────────────────────────────────────────────
const NEERSETU_BLE_SERVICE    = '0000ffe0-0000-1000-8000-00805f9b34fb';
const NEERSETU_TELEMETRY_CHAR = '0000ffe1-0000-1000-8000-00805f9b34fb'; // Notify, JSON payload
const NEERSETU_CMD_CHAR       = '0000ffe2-0000-1000-8000-00805f9b34fb'; // Write, control commands

class ConnectionManager {
  constructor() {
    this.activeSystemId = localStorage.getItem('neersetu_active_system') || 'NEERSETU-T7';
    this.connectionType = 'BLE_SIMULATED'; // 'BLE_REAL' | 'BLE_SIMULATED' | 'DISCONNECTED'
    this.isEdgeConnected = true;
    this.telemetrySubscribers = new Set();
    this.statusSubscribers = new Set();
    this.bleDevice = null;
    this.bleServer = null;
    this.bleCharacteristic = null;
    this.streamInterval = null;
    this.currentReading = null;
    this.lastUpdatedTimestamp = Date.now();

    // Load profile for the active system
    this._profile = this._getProfile(this.activeSystemId);
    this.baseline = { ...this._profile.baseline };

    this.startSimulatedStream();
  }

  // ─── Profile helpers ─────────────────────────────────────────────────────

  _getProfile(systemId) {
    return SYSTEM_PROFILES[systemId] || DEFAULT_PROFILE;
  }

  // ─── System management ───────────────────────────────────────────────────

  setSystem(systemId) {
    this.activeSystemId = systemId;
    localStorage.setItem('neersetu_active_system', systemId);

    this._profile = this._getProfile(systemId);
    this.baseline = { ...this._profile.baseline };

    // If we are already BLE_REAL, disconnect and let caller re-pair
    if (this.connectionType === 'BLE_REAL') {
      this.disconnect();
    }

    // Restart simulated stream for the new system
    this.connectionType = 'BLE_SIMULATED';
    this.isEdgeConnected = true;
    this.startSimulatedStream();
    this.emitStatus();
  }

  getActiveSystemId() {
    return this.activeSystemId;
  }

  getConnectionStatus() {
    return {
      connected: this.isEdgeConnected,
      type: this.connectionType,
      isRealBle: this.connectionType === 'BLE_REAL',
      systemId: this.activeSystemId,
      deviceId: this._profile.deviceId,
      lastUpdated: this.lastUpdatedTimestamp
    };
  }

  // ─── Simulated stream (offline / demo mode) ──────────────────────────────
  // Each system has a fixed baseline that reflects its real-world water
  // quality state. Small jitter simulates natural sensor variance.

  startSimulatedStream() {
    if (this.streamInterval) clearInterval(this.streamInterval);

    const emit = () => {
      if (!this.isEdgeConnected) return;
      const reading = this._buildSimulatedPacket();
      this.currentReading = reading;
      this.lastUpdatedTimestamp = reading.timestamp;
      localDb.addTelemetry(reading).catch((e) => console.warn('Local log failed:', e));
      this.notifyTelemetry(reading);
    };

    // Immediate first packet, then every 3.5 s
    emit();
    this.streamInterval = setInterval(emit, 3500);
  }

  _buildSimulatedPacket() {
    const b = this.baseline;

    // Small natural jitter (±1% of baseline)
    const bucket = Math.floor(Date.now() / 3500);
    const seedString = `${this.activeSystemId}:${bucket}`;
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) seed = ((seed << 5) - seed + seedString.charCodeAt(i)) | 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const jitter = (val, pct = 0.01) => +(val + val * pct * (rand() * 2 - 1)).toFixed(2);

    const tds         = Math.max(10,  Math.round(jitter(b.tds, 0.012)));
    const turbidity   = Math.max(0.1, +jitter(b.turbidity, 0.04).toFixed(1));
    const ph          = +jitter(b.ph, 0.006).toFixed(1);
    const temperature = +jitter(b.temperature, 0.005).toFixed(1);

    const evaluation  = standardsConfig.evaluateQuality({ tds, turbidity, ph });
    // Demo profiles intentionally represent three different final-water stages.
    // The sensor readings remain distinct; the profile locks the demonstration
    // decision so small simulated jitter cannot change the intended stage.
    const demoStatus = this._profile.expectedStatus || evaluation.status;

    const raw_adc = {
      blue:  Math.round(2000 - turbidity * 120  + rand() * 15),
      red:   Math.round(2200 - tds       * 0.6  + rand() * 20),
      white: Math.round(3100 - turbidity * 180  + rand() * 25),
      green: Math.round(1950 - turbidity * 90   + rand() * 15),
      ir:    Math.round(3250 - tds       * 0.8  + rand() * 20),
      uv:    Math.round(1450 - ph        * 30   + rand() * 10)
    };

    return {
      system_id:       this.activeSystemId,
      device_id:       this._profile.deviceId,
      timestamp:       Date.now(),
      tds, turbidity, ph, temperature,
      water_status:    demoStatus,
      sensor_status:   'NORMAL',
      connection_type: 'BLE_SIMULATED',
      data_source:     'SIMULATED',
      sync_status:     'PENDING',
      raw_adc,
      tinyml: {
        model:              'Quantized INT8 Multi-Spectral Net v1.4',
        inference_time_ms:  18 + Math.round(rand() * 3),
        ram_usage_kb:       24.2,
        flash_kb:           86.4,
        device_heap_free_kb: 184 - Math.round(rand() * 2)
      }
    };
  }

  // ─── Real Web Bluetooth connection ───────────────────────────────────────
  // Called after a QR scan identifies the system. Attempts to pair with the
  // physical ESP32 via BLE and subscribes to GATT notifications on the
  // NeerSetu telemetry characteristic. Falls back to simulated if unavailable.

  async connectRealBle() {
    if (!navigator.bluetooth) {
      console.warn('[NeerSetu BLE] Web Bluetooth not supported. Staying in simulated mode.');
      return false;
    }

    try {
      // Stop the simulated stream so it doesn't race with real hardware
      if (this.streamInterval) clearInterval(this.streamInterval);

      const nameHint = this._profile.bleNameHint || 'NeerSetu';

      // Ask user to select their ESP32 device
      this.bleDevice = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: nameHint },
          { services: [NEERSETU_BLE_SERVICE] }
        ],
        optionalServices: [NEERSETU_BLE_SERVICE, 'battery_service']
      });

      this.bleDevice.addEventListener('gattserverdisconnected', () => {
        console.warn('[NeerSetu BLE] Hardware disconnected – falling back to simulated mode');
        this.bleCharacteristic = null;
        this.connectionType = 'BLE_SIMULATED';
        this.isEdgeConnected = true;
        this.startSimulatedStream(); // Keep UI alive
        this.emitStatus();
      });

      this.bleServer = await this.bleDevice.gatt.connect();
      const service  = await this.bleServer.getPrimaryService(NEERSETU_BLE_SERVICE);

      // Subscribe to live telemetry characteristic (ESP32 notifies every ~2s)
      this.bleCharacteristic = await service.getCharacteristic(NEERSETU_TELEMETRY_CHAR);
      await this.bleCharacteristic.startNotifications();
      this.bleCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        this._handleBlePacket(event.target.value);
      });

      this.connectionType = 'BLE_REAL';
      this.isEdgeConnected = true;
      this.emitStatus();
      console.log('[NeerSetu BLE] Connected to real ESP32:', this.bleDevice.name);
      return true;

    } catch (err) {
      console.warn('[NeerSetu BLE] Pairing cancelled or unavailable:', err.message);
      // Gracefully restore simulated stream
      this.connectionType = 'BLE_SIMULATED';
      this.isEdgeConnected = true;
      this.startSimulatedStream();
      this.emitStatus();
      return false;
    }
  }

  // Parse the binary/JSON payload from the ESP32's GATT characteristic
  _handleBlePacket(dataView) {
    try {
      const decoder = new TextDecoder('utf-8');
      const rawStr  = decoder.decode(dataView);
      const parsed  = JSON.parse(rawStr);

      // The ESP32 firmware sends: { tds, turbidity, ph, temp, adc:{...}, ml:{...} }
      const tds         = parsed.tds         ?? parsed.TDS ?? 0;
      const turbidity   = parsed.turbidity   ?? parsed.NTU ?? 0;
      const ph          = parsed.ph          ?? parsed.PH  ?? 7.0;
      const temperature = parsed.temp        ?? parsed.temperature ?? 25.0;

      const evaluation  = standardsConfig.evaluateQuality({ tds, turbidity, ph });

      const reading = {
        system_id:       this.activeSystemId,
        device_id:       this.bleDevice?.name ?? this._profile.deviceId,
        timestamp:       Date.now(),
        tds, turbidity, ph, temperature,
        water_status:    demoStatus,
        sensor_status:   parsed.status ?? 'NORMAL',
        connection_type: 'BLE',
        data_source:     'LIVE',
        sync_status:     'PENDING',
        raw_adc:         parsed.adc ?? {},
        tinyml:          parsed.ml  ?? {}
      };

      this.currentReading = reading;
      this.lastUpdatedTimestamp = reading.timestamp;
      localDb.addTelemetry(reading).catch((e) => console.warn('Local log failed:', e));
      this.notifyTelemetry(reading);
    } catch (e) {
      console.warn('[NeerSetu BLE] Failed to parse BLE packet:', e);
    }
  }

  // Reconnect to a previously-authorized ESP32 without opening a pairing
  // picker. Browsers only allow this when the user has already granted access.
  async tryAutoReconnect() {
    if (!navigator.bluetooth?.getDevices) return false;
    try {
      const devices = await navigator.bluetooth.getDevices();
      const hint = (this._profile.bleNameHint || '').toLowerCase();
      const target = devices.find((d) => {
        const name = (d.name || '').toLowerCase();
        return name && (name.includes(hint) || name.includes(this._profile.deviceId.toLowerCase()));
      });
      if (!target?.gatt) return false;

      this.bleDevice = target;
      this.bleServer = await target.gatt.connect();
      const service = await this.bleServer.getPrimaryService(NEERSETU_BLE_SERVICE);
      this.bleCharacteristic = await service.getCharacteristic(NEERSETU_TELEMETRY_CHAR);
      await this.bleCharacteristic.startNotifications();
      this.bleCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        this._handleBlePacket(event.target.value);
      });
      this.connectionType = 'BLE_REAL';
      this.isEdgeConnected = true;
      this.emitStatus();
      if (this.streamInterval) clearInterval(this.streamInterval);
      console.log('[NeerSetu BLE] Auto-reconnected:', target.name);
      return true;
    } catch (err) {
      console.warn('[NeerSetu BLE] Auto-reconnect unavailable:', err.message);
      return false;
    }
  }

  // ─── Disconnect / reconnect ───────────────────────────────────────────────

  disconnect() {
    if (this.bleDevice?.gatt?.connected) {
      this.bleDevice.gatt.disconnect();
    }
    this.bleDevice = null;
    this.bleServer = null;
    this.bleCharacteristic = null;
    this.isEdgeConnected = false;
    this.connectionType = 'DISCONNECTED';
    if (this.streamInterval) clearInterval(this.streamInterval);
    this.emitStatus();
  }

  reconnect() {
    this.isEdgeConnected = true;
    this.connectionType = 'BLE_SIMULATED';
    this.startSimulatedStream();
    this.emitStatus();
  }

  // ─── Subscriber interface ────────────────────────────────────────────────

  onTelemetry(callback) {
    this.telemetrySubscribers.add(callback);
    if (this.currentReading) callback(this.currentReading);
    return () => this.telemetrySubscribers.delete(callback);
  }

  onStatusChange(callback) {
    this.statusSubscribers.add(callback);
    callback(this.getConnectionStatus());
    return () => this.statusSubscribers.delete(callback);
  }

  notifyTelemetry(reading) {
    this.telemetrySubscribers.forEach((cb) => cb(reading));
  }

  emitStatus() {
    const status = this.getConnectionStatus();
    this.statusSubscribers.forEach((cb) => cb(status));
  }
}

export const connectionManager = new ConnectionManager();
