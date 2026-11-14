// Runs the Node tests (tests/*.test.mjs), each in its own process, and says which failed.
//   node tools/test.mjs              all of them: one line per file, the failing checks in full
//   node tools/test.mjs bot access   only tests/bot.test.mjs and tests/access.test.mjs
//   node tools/test.mjs --verbose    every check of every file
// No packages needed (Node 22+). Also runs before every Worker deploy (wrangler.jsonc, "build"): a failing test stops it.
// The page tests (tests/*_e2e.py) need Python and Playwright: npm run e2e.
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2), verbose = args.includes('--verbose'), only = args.filter((a) => !a.startsWith('--'));
const files = readdirSync(root + 'tests').filter((f) => f.endsWith('.test.mjs') && (!only.length || only.includes(f.replace('.test.mjs', '')))).sort();
if (!files.length) { console.error('no such tests: ' + only.join(', ')); process.exit(2); }

const failed = [];
for (const f of files) {
  const t0 = Date.now(), r = spawnSync(process.execPath, ['tests/' + f], { cwd: root, encoding: 'utf8' });
  const ok = r.status === 0, out = ((r.stdout || '') + (r.stderr || '')).trimEnd();
  if (!ok) failed.push(f);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${f} (${Date.now() - t0} ms)`);
  if (verbose) console.log(out.replace(/^/gm, '     '));
  else if (!ok) console.log(out.split('\n').filter((l) => !l.startsWith('PASS')).join('\n').replace(/^/gm, '     '));
}
console.log(failed.length ? `\n${failed.length} of ${files.length} test files failed: ${failed.join(', ')}` : `\nall ${files.length} test files passed`);
process.exit(failed.length ? 1 : 0);
