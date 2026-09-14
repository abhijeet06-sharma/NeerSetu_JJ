// NeerSetu_JJ Offline-First Sync Service
// Manages local sync queue, online/offline detection, and demonstration toggles

import { localDb } from '../db/localDb.js';

class SyncService {
  constructor() {
    this.isRealOnline = navigator.onLine;
    this.isSimulatedOffline = false; // For SIH presentation demo
    this.isSyncing = false;
    this.subscribers = new Set();
    this.pendingCount = 0;
    this.lastSyncTimestamp = Date.now() - 3600000;

    this.initNetworkListeners();
    this.updatePendingCount();

    // Check pending count periodically
    setInterval(() => this.updatePendingCount(), 3000);
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isRealOnline = true;
      console.log('[NeerSetu Sync] Real internet restored');
      this.handleNetworkStatusChange();
    });

    window.addEventListener('offline', () => {
      this.isRealOnline = false;
      console.log('[NeerSetu Sync] Real internet lost');
      this.handleNetworkStatusChange();
    });
  }

  isOnline() {
    return this.isRealOnline && !this.isSimulatedOffline;
  }

  setSimulatedOffline(isOffline) {
    this.isSimulatedOffline = isOffline;
    console.log(`[NeerSetu Sync] Demo internet state set to: ${isOffline ? 'OFFLINE' : 'ONLINE'}`);
    this.handleNetworkStatusChange();
    if (!isOffline) {
      // If turned back online, trigger auto-sync
      setTimeout(() => this.triggerSync(), 800);
    }
  }

  async updatePendingCount() {
    try {
      const records = await localDb.getPendingSyncRecords();
      this.pendingCount = records.length;
      this.notify();
    } catch (e) {
      console.warn('Failed to query pending sync records:', e);
    }
  }

  handleNetworkStatusChange() {
    this.notify();
    if (this.isOnline() && this.pendingCount > 0) {
      this.triggerSync();
    }
  }

  async triggerSync() {
    if (this.isSyncing || !this.isOnline()) return;

    this.isSyncing = true;
    this.notify();

    try {
      const pendingRecords = await localDb.getPendingSyncRecords();
      if (pendingRecords.length === 0) {
        this.isSyncing = false;
        this.notify();
        return;
      }

      console.log(`[NeerSetu Sync] Uploading ${pendingRecords.length} offline records to cloud mirror...`);
      
      // Simulate realistic network batch upload delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const ids = pendingRecords.map((r) => r.id);
      await localDb.markRecordsSynced(ids);

      this.lastSyncTimestamp = Date.now();
      await this.updatePendingCount();
      console.log(`[NeerSetu Sync] Successfully synchronized ${ids.length} records.`);
    } catch (err) {
      console.error('[NeerSetu Sync] Synchronization failed:', err);
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  getState() {
    return {
      online: this.isOnline(),
      isRealOnline: this.isRealOnline,
      isSimulatedOffline: this.isSimulatedOffline,
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
      lastSyncTime: this.lastSyncTimestamp
    };
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.subscribers.forEach((cb) => cb(state));
  }
}

export const syncService = new SyncService();
