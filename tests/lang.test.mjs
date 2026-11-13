// D-SIM'YA speaks Ukrainian and German only: none of the four letters that exist only in Russian in any file of the app,
// its Worker, tools or tests, and no links to .ru sites. Run: node tests/lang.test.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['.git', 'node_modules', '__pycache__', 'three', 'maplibre', 'fonts', 'audio']);
const TEXT = /\.(js|mjs|html|css|py|md|json|webmanifest|toml|yml|txt|svg)$/;
const files = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) { if (!SKIP.has(n)) walk(p); } else if (TEXT.test(n)) files.push(p); } })(ROOT);

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const RU = /[\u044B\u044D\u044A\u0451\u042B\u042D\u042A\u0401]/,   // the four letters, written as codes so this file passes too
      DOT_RU = /https?:\/\/[^\s"'`)]*\.ru(?=[\/:"'`)\s]|$)/;
const ru = [], links = [];
for (const f of files) readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
  const at = `${f.slice(ROOT.length + 1)}:${i + 1}`;
  if (RU.test(line)) ru.push(`${at}: ${line.trim().slice(0, 100)}`);
  if (DOT_RU.test(line)) links.push(`${at}: ${line.trim().slice(0, 100)}`);
});
t(`${files.length} files read`, files.length > 100, files.length);
t('no letters that exist only in Russian', !ru.length, ru.slice(0, 10).join('\n'));
t('no links to .ru sites', !links.length, links.slice(0, 10).join('\n'));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
