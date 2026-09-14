# NeerSetu – QR, Deep Link, Safe Water & Mobile Update

## What changed
- Replaced the non-decodable QR-like SVG with a real standards-compliant QR encoder bundled locally in `src/services/qr/`.
- QR payload is generated from the current hosted PWA URL and carries `?system=<AquaSystem ID>`. No QR API, CDN, cloud service, or subscription is used.
- Added QR generator controls with system selection, Download QR and Print actions.
- Added deep-link handling in `main.js`: opening a QR URL automatically selects the correct AquaSystem.
- Added silent BLE auto-reconnect when a browser has already granted access to the ESP32. First-time Web Bluetooth pairing still requires a user gesture because of browser security.
- Added a direct Connect button on the home screen for first-time ESP32 pairing.
- Added Safe Water Available in the final reserve tank on the home screen. Dummy values: T7 39 L, JH-001 28 L, Mining-03 0 L.
- Added mobile width/margin constraints so the interface is narrower and more app-like on phones.
- Changed the online toast from cloud-sync wording to `Back online — connection restored.`

## QR workflow
1. Open NeerSetu on the deployed HTTPS site.
2. Open QR -> Create QR.
3. Select the AquaSystem.
4. Download/print the QR.
5. Scan it with any phone camera.
6. The PWA opens with that system selected.
7. If this phone has previously authorized the ESP32, BLE can reconnect automatically. Otherwise tap Connect.

## Important
- Web Bluetooth requires a supported browser/device and a secure HTTPS context for deployed use.
- A first-time Bluetooth pairing cannot be triggered silently from a QR scan; the browser requires a user gesture.
- No backend/cloud database is required for the QR/deep-link functionality.

## Validation performed
- All JavaScript source files pass `node --check` syntax validation.
- The bundled QR encoder was tested by generating a QR for a NeerSetu-style URL and decoding it successfully with a QR decoder.
- The included original Windows `node_modules` may not be portable to Linux; build on the target Windows machine using `npm.cmd run build` as before.
