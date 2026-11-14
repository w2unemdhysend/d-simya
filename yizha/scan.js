// Barcodes of packaged food: from the camera live, or from a photo when the camera cannot be opened here.
// The browser's own BarcodeDetector where it has one (Chrome on Android); otherwise zxing-wasm (MIT, kept in
// assets/zxing, about 1 MB, loaded the first time it is needed). Everything runs on the phone.

const FORMATS = ['EAN13', 'EAN8', 'UPCA', 'UPCE'];
let zx = null;
async function zxing() {
  if (!zx) zx = import('../assets/zxing/reader/index.js').then((m) => {
    m.setZXingModuleOverrides({ locateFile: (path, prefix) => (path.endsWith('.wasm') ? new URL('../assets/zxing/zxing_reader.wasm', import.meta.url).href : prefix + path) });
    return m;
  });
  return zx;
}
async function native() {
  try {
    if (!('BarcodeDetector' in window)) return null;
    const have = await window.BarcodeDetector.getSupportedFormats();
    if (!have.includes('ean_13')) return null;
    return new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'].filter((f) => have.includes(f)) });
  } catch (e) { return null; }
}
// A product barcode: 8, 12 or 13 digits with a right check digit
export function validCode(s) {
  const d = String(s || '').replace(/\D/g, '');
  if (![8, 12, 13].includes(d.length)) return false;
  const digits = d.split('').map(Number), check = digits.pop();
  const sum = digits.reverse().reduce((a, n, i) => a + n * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

// From a still image (a File from the camera input): the code or null
export async function fromImage(file) {
  const det = await native();
  if (det) {
    try { const bmp = await createImageBitmap(file); const r = await det.detect(bmp); const c = r.map((x) => x.rawValue).find(validCode); if (c) return c; } catch (e) { /* zxing below */ }
  }
  const m = await zxing();
  const r = await m.readBarcodes(file, { formats: FORMATS, tryHarder: true, maxNumberOfSymbols: 1 });
  const c = r.map((x) => x.text).find(validCode);
  return c || null;
}

// Live from the camera into `video`; onCode(code) once a code is read twice in a row. Returns stop().
// Throws when the camera cannot be opened (no permission, no camera, Telegram without camera access).
export async function live(video, onCode) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
  video.srcObject = stream; video.setAttribute('playsinline', ''); video.muted = true;
  await video.play().catch(() => {});
  let stopped = false, last = '', timer = null;
  const det = await native(), m = det ? null : await zxing();
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
  async function tick() {
    if (stopped) return;
    try {
      if (video.readyState >= 2 && video.videoWidth) {
        let code = null;
        if (det) code = (await det.detect(video)).map((x) => x.rawValue).find(validCode) || null;
        else {
          // the middle band of the picture, where the frame on screen is: smaller and faster to read
          const w = video.videoWidth, h = video.videoHeight, cw = Math.min(w, 960), ch = Math.round((h * 0.5) * (cw / w));
          canvas.width = cw; canvas.height = ch;
          ctx.drawImage(video, 0, h * 0.25, w, h * 0.5, 0, 0, cw, ch);
          const r = await m.readBarcodes(ctx.getImageData(0, 0, cw, ch), { formats: FORMATS, tryHarder: true, maxNumberOfSymbols: 1 });
          code = r.map((x) => x.text).find(validCode) || null;
        }
        if (code && code === last) { stop(); onCode(code); return; }
        last = code || '';
      }
    } catch (e) { /* a frame that could not be read */ }
    timer = setTimeout(tick, det ? 120 : 220);
  }
  function stop() { stopped = true; clearTimeout(timer); stream.getTracks().forEach((t) => t.stop()); video.srcObject = null; }
  tick();
  return stop;
}
