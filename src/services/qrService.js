// NeerSetu_JJ QR Code & System Identification Service
// Handles Camera Scanning, Quick Identification Presets, and SVG QR Generation

import { localDb } from '../db/localDb.js';
import { connectionManager } from './connectionManager.js';
import QRCode from './qr/index.js';
import QRErrorCorrectLevel from './qr/QRErrorCorrectLevel.js';

class QRService {
  constructor() {
    this.videoStream = null;
    this.scanInterval = null;
  }

  // Pre-configured demonstration systems in Jharkhand
  getAvailableSystems() {
    return [
      {
        id: 'NEERSETU-T7',
        name: 'NeerSetu T7 - Ranchi Mining Cluster',
        location: 'Ward 4, Ranchi, Jharkhand',
        tag: 'Coal & Bauxite Runoff Area'
      },
      {
        id: 'AQUA-JH-001',
        name: 'AquaSystem JH-001 - Dhanbad Coal Belt',
        location: 'Jharia Sector 3, Dhanbad, Jharkhand',
        tag: 'Heavy Particulate Monitoring'
      },
      {
        id: 'AQUA-JH-MINING-03',
        name: 'NeerSetu Iron Belt - West Singhbhum',
        location: 'Noamundi Perimeter, West Singhbhum',
        tag: 'Acid Mine Drainage Risk'
      }
    ];
  }

  async identifySystem(systemIdOrPayload) {
    const parsedId = this.parsePayload(systemIdOrPayload) || systemIdOrPayload;
    const validIds = ['NEERSETU-T7', 'AQUA-JH-001', 'AQUA-JH-MINING-03'];
    const targetId = validIds.includes(parsedId) ? parsedId : 'NEERSETU-T7';

    console.log(`[NeerSetu QR] System identified: ${targetId}`);
    connectionManager.setSystem(targetId);

    // Fetch profile from local IndexedDB
    const profile = await localDb.getSystem(targetId);
    return profile;
  }

  // Start real camera stream if supported and allowed
  async startCameraScan(videoElement, onDetected, onError) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera stream not supported in this browser');
      }

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      videoElement.srcObject = this.videoStream;
      await videoElement.play();

      // Scan canvas frame periodically
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      this.scanInterval = setInterval(() => {
        if (!this.videoStream || videoElement.videoWidth === 0) return;
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Check if barcode detector is available in modern Android Chrome
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          barcodeDetector.detect(canvas).then((barcodes) => {
            if (barcodes && barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              this.stopCameraScan();
              onDetected(rawValue);
            }
          }).catch(() => {});
        }
      }, 500);

      return true;
    } catch (err) {
      console.warn('[NeerSetu QR] Camera access error:', err.message);
      if (onError) onError(err);
      return false;
    }
  }

  stopCameraScan() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((t) => t.stop());
      this.videoStream = null;
    }
  }

  // Build a real standards-compliant QR payload for the currently hosted PWA.
  // Because this uses the current origin at runtime, the same build works on
  // localhost, a LAN address, GitHub Pages, or any HTTPS static host.
  getSystemUrl(systemId) {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('system', systemId);
    return url.toString();
  }

  parsePayload(payload) {
    if (!payload) return null;
    const raw = String(payload).trim();
    try {
      const url = new URL(raw);
      return url.searchParams.get('system') || url.searchParams.get('system_id');
    } catch {
      // Also accept a plain system ID for the in-app camera scanner.
      return raw.replace(/^system[=:]/i, '').trim() || null;
    }
  }

  // Real QR encoder. This is bundled locally; there is no API, CDN or cloud
  // service involved. Error correction L is sufficient for a clean printed ID.
  generateQrSvg(systemId) {
    const payload = this.getSystemUrl(systemId);
    const qr = new QRCode(-1, QRErrorCorrectLevel.L);
    qr.addData(payload);
    qr.make();

    const modules = qr.getModuleCount();
    const quiet = 4;
    const cell = 6;
    const total = (modules + quiet * 2) * cell;
    let paths = '';

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (qr.isDark(row, col)) {
          paths += `<rect x="${(col + quiet) * cell}" y="${(row + quiet) * cell}" width="${cell}" height="${cell}"/>`;
        }
      }
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="220" height="220" role="img" aria-label="QR code for ${systemId}">
        <rect width="100%" height="100%" fill="#ffffff"/>
        <g fill="#000000" shape-rendering="crispEdges">${paths}</g>
      </svg>
    `;
  }
}

export const qrService = new QRService();
