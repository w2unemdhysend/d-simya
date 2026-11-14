// Runs the page tests (tests/*_e2e.py) in headless Chromium, each in its own process, and says which failed.
//   node tools/e2e.mjs               all of them (a few minutes)
//   node tools/e2e.mjs scan mapa     only tests/scan_e2e.py and tests/mapa_e2e.py
// Needs Python 3 with playwright, pillow and numpy, and poppler-utils (pdftotext) for the scanner.
// CHROME=/path/to/chrome uses that browser instead of Playwright's own; SHOTS=/some/dir keeps the screenshots.
// Without access to jsDelivr: TESS_NODE_MODULES=/path/node_modules serves Tesseract.js from a local npm install
// (tesseract.js@7.0.0 tesseract.js-core@7.0.0 @tesseract.js-data/deu@1.0.0 @tesseract.js-data/ukr@1.0.0).
import { readdirSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const only = process.argv.slice(2);
const files = readdirSync(root + 'tests').filter((f) => f.endsWith('_e2e.py') && (!only.length || only.includes(f.replace('_e2e.py', '')))).sort();
if (!files.length) { console.error('no such page tests: ' + only.join(', ')); process.exit(2); }
const env = { ...process.env, SHOTS: process.env.SHOTS || mkdtempSync(join(tmpdir(), 'dsimya-shots-')) };
const python = process.platform === 'win32' ? 'python' : 'python3';

const failed = [];
for (const f of files) {
  const t0 = Date.now(), r = spawnSync(python, ['tests/' + f], { cwd: root, env, encoding: 'utf8', timeout: 15 * 60000 });
  const ok = r.status === 0;
  if (!ok) failed.push(f);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${f} (${Math.round((Date.now() - t0) / 1000)} s)`);
  if (!ok) console.log(((r.stdout || '') + (r.stderr || '') + (r.error ? String(r.error) : '')).split('\n').filter((l) => !l.startsWith('PASS')).join('\n').replace(/^/gm, '     '));
}
console.log(failed.length ? `\n${failed.length} of ${files.length} page tests failed: ${failed.join(', ')}` : `\nall ${files.length} page tests passed (screenshots: ${env.SHOTS})`);
process.exit(failed.length ? 1 : 0);
