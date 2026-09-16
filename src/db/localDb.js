// NeerSetu_JJ IndexedDB Robust Local Database
// Offline-first storage for AquaSystem profiles, telemetry logs, and sync queue

const DB_NAME = 'NeerSetuDB_JJ';
const DB_VERSION = 2;

class LocalDatabase {
  constructor() {
    this.db = null;
    this.readyPromise = this.init();
  }

  async ensureReady() {
    if (this.db) return this.db;
    return this.readyPromise;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. AquaSystem Profiles
        if (!db.objectStoreNames.contains('systems')) {
          const sysStore = db.createObjectStore('systems', { keyPath: 'system_id' });
          sysStore.createIndex('device_id', 'device_id', { unique: false });
        }

        // 2. Telemetry Log
        if (!db.objectStoreNames.contains('telemetry')) {
          const telemStore = db.createObjectStore('telemetry', { keyPath: 'id', autoIncrement: true });
          telemStore.createIndex('system_id', 'system_id', { unique: false });
          telemStore.createIndex('timestamp', 'timestamp', { unique: false });
          telemStore.createIndex('sync_status', 'sync_status', { unique: false });
        }

        // 3. Thresholds / Configuration
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // v2: replace the old per-device random demo history with one
        // deterministic history so the same AquaSystem looks identical on
        // every device without requiring a cloud database.
        if (event.oldVersion > 0 && event.oldVersion < 2 && db.objectStoreNames.contains('telemetry')) {
          event.target.transaction.objectStore('telemetry').clear();
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        try {
          await this.seedInitialData();
        } catch (err) {
          console.warn('[NeerSetu DB] Seeding warning:', err);
        }
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[NeerSetu DB] Failed to open IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async seedInitialData() {
    // Check if initial systems exist
    const systems = await this.getAllSystems();
    const existingTelemetry = await this.getTelemetryForSystem('NEERSETU-T7', 1);
    if (systems.length === 0) {
      const defaultSystems = [
        {
          // ✅ SAFE – within BIS 10500:2012 permissible limits
          system_id: 'NEERSETU-T7',
          device_id: 'ESP32-JH-007',
          name: 'NeerSetu T7 – Ranchi Urban Village',
          location: 'Ward 4, Namkum Block, Ranchi',
          hardware_rev: 'v2.1-Modular-Edge',
          final_tank_capacity_liters: 50,
          safe_water_liters: 39,
          firmware: 'TinyML-v1.4.2-INT8',
          last_sync: Date.now() - 1800000,
          connected_modules: ['quality_chamber', 'esp32_edge', 'optical_6ch'],
          unconnected_modules: ['oil_separator', 'uv_chamber'],
          last_known_reading: {
            tds: 182,
            turbidity: 1.4,
            ph: 7.2,
            temperature: 27.4,
            water_status: 'GOOD',
            timestamp: Date.now() - 120000,
            data_source: 'CACHED'
          }
        },
        {
          // ⚠️ ATTENTION – TDS & turbidity borderline, needs monitoring
          system_id: 'AQUA-JH-001',
          device_id: 'ESP32-JH-001',
          name: 'AquaSystem JH-001 – Dhanbad Coal Belt',
          location: 'Jharia Coalfield Sector 3, Dhanbad',
          hardware_rev: 'v2.0-Modular-Edge',
          final_tank_capacity_liters: 50,
          safe_water_liters: 28,
          firmware: 'TinyML-v1.3.0-INT8',
          last_sync: Date.now() - 7200000,
          connected_modules: ['quality_chamber', 'esp32_edge'],
          unconnected_modules: ['oil_separator', 'uv_chamber'],
          last_known_reading: {
            tds: 468,
            turbidity: 3.9,
            ph: 6.6,
            temperature: 28.5,
            water_status: 'ATTENTION',
            timestamp: Date.now() - 360000,
            data_source: 'CACHED'
          }
        },
        {
          // 🚨 CRITICAL – Acid mine drainage; high TDS, high turbidity, low pH
          system_id: 'AQUA-JH-MINING-03',
          device_id: 'ESP32-JH-019',
          name: 'NeerSetu Iron Belt – West Singhbhum',
          location: 'Noamundi Mining Perimeter, West Singhbhum',
          hardware_rev: 'v2.1-Modular-Edge',
          final_tank_capacity_liters: 50,
          safe_water_liters: 0,
          firmware: 'TinyML-v1.4.2-INT8',
          last_sync: Date.now() - 14400000,
          connected_modules: ['quality_chamber', 'esp32_edge'],
          unconnected_modules: ['oil_separator', 'uv_chamber'],
          last_known_reading: {
            tds: 1240,
            turbidity: 12.4,
            ph: 5.4,
            temperature: 29.1,
            water_status: 'CRITICAL',
            timestamp: Date.now() - 720000,
            data_source: 'CACHED'
          }
        }
      ];

      for (const sys of defaultSystems) {
        await this.saveSystem(sys);
      }
    }

    if (existingTelemetry.length === 0) {
      // ──────────────────────────────────────────────────────────────────────
      // Pre-seed 24h historical telemetry for all 3 systems.
      // NEERSETU-T7: mostly GOOD with minor fluctuations.
      // AQUA-JH-001:  mostly ATTENTION – borderline readings that cross limits.
      // AQUA-JH-MINING-03: consistently CRITICAL – unsafe water.
      // ──────────────────────────────────────────────────────────────────────
      const now = Date.now();
      const sampleHistory = [];

      for (let i = 24; i >= 1; i--) {
        const t = now - (i * 3600 * 1000);

        // ✅ NEERSETU-T7 – Clean water, within BIS limits
        const t7Tds  = Math.round(178 + Math.sin(i * 0.5) * 10 + ((i * 7) % 6));
        const t7Turb = +((1.3 + Math.sin(i * 0.7) * 0.3 + ((i * 3) % 4) * 0.05).toFixed(1));
        const t7Ph   = +((7.2 + Math.cos(i * 0.3) * 0.1).toFixed(1));
        const t7Temp = +((27.0 + Math.sin(i * 0.2) * 1.5).toFixed(1));
        sampleHistory.push({
          system_id: 'NEERSETU-T7', device_id: 'ESP32-JH-007', timestamp: t,
          tds: t7Tds, turbidity: t7Turb, ph: t7Ph, temperature: t7Temp,
          water_status: 'GOOD', sensor_status: 'NORMAL',
          connection_type: 'BLE', data_source: i < 4 ? 'CACHED' : 'LIVE',
          sync_status: i > 6 ? 'SYNCED' : 'PENDING'
        });

        // ⚠️ AQUA-JH-001 – Borderline; TDS near 500, turbidity crossing 4 NTU
        const j1Tds  = Math.round(440 + Math.sin(i * 0.6) * 60 + ((i * 11) % 21));
        const j1Turb = +((3.7 + Math.sin(i * 0.8) * 0.9 + ((i * 5) % 4) * 0.1).toFixed(1));
        const j1Ph   = +((6.65 + Math.cos(i * 0.4) * 0.15).toFixed(1));
        const j1Temp = +((28.3 + Math.sin(i * 0.25) * 1.2).toFixed(1));
        const j1Status = j1Tds > 500 || j1Turb > 4.0 || j1Ph < 6.5 ? 'ATTENTION' : 'GOOD';
        sampleHistory.push({
          system_id: 'AQUA-JH-001', device_id: 'ESP32-JH-001', timestamp: t,
          tds: j1Tds, turbidity: j1Turb, ph: j1Ph, temperature: j1Temp,
          water_status: j1Status, sensor_status: 'NORMAL',
          connection_type: 'BLE', data_source: i < 4 ? 'CACHED' : 'LIVE',
          sync_status: i > 8 ? 'SYNCED' : 'PENDING'
        });

        // 🚨 AQUA-JH-MINING-03 – Chronically unsafe (acid mine drainage)
        const m3Tds  = Math.round(1210 + Math.sin(i * 0.4) * 120 + ((i * 13) % 31));
        const m3Turb = +((11.8 + Math.sin(i * 0.9) * 2.0 + ((i * 7) % 6) * 0.1).toFixed(1));
        const m3Ph   = +((5.4 + Math.cos(i * 0.5) * 0.3).toFixed(1));
        const m3Temp = +((29.0 + Math.sin(i * 0.2) * 1.0).toFixed(1));
        sampleHistory.push({
          system_id: 'AQUA-JH-MINING-03', device_id: 'ESP32-JH-019', timestamp: t,
          tds: m3Tds, turbidity: m3Turb, ph: m3Ph, temperature: m3Temp,
          water_status: 'CRITICAL', sensor_status: 'NORMAL',
          connection_type: 'BLE', data_source: i < 4 ? 'CACHED' : 'LIVE',
          sync_status: i > 10 ? 'SYNCED' : 'PENDING'
        });
      }

      for (const record of sampleHistory) {
        await this.addTelemetry(record);
      }
    }
  }

  async getAllSystems() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('systems', 'readonly');
      const store = tx.objectStore('systems');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getSystem(systemId) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('systems', 'readonly');
      const store = tx.objectStore('systems');
      const req = store.get(systemId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveSystem(systemObj) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('systems', 'readwrite');
      const store = tx.objectStore('systems');
      const req = store.put(systemObj);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async addTelemetry(record) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('telemetry', 'readwrite');
      const store = tx.objectStore('telemetry');
      const item = {
        ...record,
        timestamp: record.timestamp || Date.now(),
        sync_status: record.sync_status || 'PENDING'
      };
      const req = store.add(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async getTelemetryForSystem(systemId, limit = 50) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('telemetry', 'readonly');
      const store = tx.objectStore('telemetry');
      const index = store.index('system_id');
      const req = index.getAll(systemId);

      req.onsuccess = () => {
        const list = req.result || [];
        // Sort descending by timestamp
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list.slice(0, limit));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getLatestTelemetry(systemId) {
    const list = await this.getTelemetryForSystem(systemId, 1);
    return list.length > 0 ? list[0] : null;
  }

  async getPendingSyncRecords() {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('telemetry', 'readonly');
      const store = tx.objectStore('telemetry');
      const index = store.index('sync_status');
      const req = index.getAll('PENDING');

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async markRecordsSynced(ids) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('telemetry', 'readwrite');
      const store = tx.objectStore('telemetry');

      let completed = 0;
      if (ids.length === 0) return resolve(0);

      ids.forEach((id) => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const record = getReq.result;
          if (record) {
            record.sync_status = 'SYNCED';
            store.put(record);
          }
          completed++;
          if (completed === ids.length) {
            resolve(completed);
          }
        };
      });

      tx.onerror = () => reject(tx.error);
    });
  }

  async getSettings(key, defaultValue = null) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue);
      req.onerror = () => reject(req.error);
    });
  }

  async saveSettings(key, value) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key, value });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }
}

export const localDb = new LocalDatabase();
