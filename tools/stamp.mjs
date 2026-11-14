// Writes the asset versions, so nobody has to bump them by hand:
//   · every reference "file?v=…" in the pages, scripts and sw.js gets the first 8 hex digits of the file's SHA-256,
//     so a browser fetches a file again exactly when it changed (and keeps it otherwise);
//   · VERSION in sw.js becomes a hash of everything the offline cache keeps (CORE), so the phones refresh their copy
//     after any change to the site and never otherwise.
//
//   node tools/stamp.mjs           write the new versions (npm run stamp; the pre-commit hook does it, see README)
//   node tools/stamp.mjs --check   change nothing; exit 1 and name the files if something is not stamped (CI does this)
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP = /^(\.git|node_modules|audio|shots|assets\/three|assets\/maplibre|assets\/fonts|tests\/fixtures|\.wrangler)(\/|$)/;
const REF = /(["'])([^"'\s?]+)\?v=([0-9A-Za-z]+)\1/g;
const check = process.argv.includes('--check');

function walk(dir, out = []) {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = dir ? `${dir}/${name}` : name;
    if (SKIP.test(rel)) continue;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel, out);
    else if (/\.(html|js|mjs)$/.test(name)) out.push(rel);
  }
  return out;
}
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 8);

const files = walk('');
const text = new Map(files.map((f) => [f, readFileSync(join(ROOT, f), 'utf8')]));
const content = (rel) => (text.has(rel) ? text.get(rel) : readFileSync(join(ROOT, rel)));
const problems = [];

// A file's version depends on its own references (igry/hop.js names hop/engine.js?v=…), so stamp until nothing moves
for (let pass = 0; pass < 10; pass++) {
  let moved = false;
  for (const f of files) {
    const s = text.get(f);
    const next = s.replace(REF, (all, q, ref, v) => {
      const target = relative(ROOT, resolve(ROOT, dirname(f), ref)).split('\\').join('/');
      if (!existsSync(join(ROOT, target))) { if (pass === 0) problems.push(`${f}: ${ref} does not exist`); return all; }
      return `${q}${ref}?v=${hash(content(target))}${q}`;
    });
    if (next !== s) { text.set(f, next); moved = true; }
  }
  if (!moved) break;
}

// VERSION in sw.js: a hash over the files of CORE (a folder means its index.html)
{
  const sw = text.get('sw.js'), list = sw.match(/const CORE = \[([\s\S]*?)\];/);
  const core = [...list[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const h = createHash('sha256');
  for (const entry of core) {
    const path = entry.split('?')[0].replace(/^\.\/$/, '').replace(/(^|\/)$/, '$1index.html') || 'index.html';
    if (!existsSync(join(ROOT, path))) { problems.push(`sw.js: CORE names ${entry}, which does not exist`); continue; }
    h.update(path).update(content(path));
  }
  text.set('sw.js', sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${h.digest('hex').slice(0, 10)}';`));
}

const changed = files.filter((f) => text.get(f) !== readFileSync(join(ROOT, f), 'utf8'));
if (problems.length) console.error(problems.join('\n'));
if (check) {
  if (changed.length) console.error(`not stamped: ${changed.join(', ')}\nrun: npm run stamp`);
  else if (!problems.length) console.log('asset versions are up to date');
  process.exit(changed.length || problems.length ? 1 : 0);
}
for (const f of changed) writeFileSync(join(ROOT, f), text.get(f));
console.log(changed.length ? `stamped: ${changed.join(', ')}` : 'asset versions were already up to date');
process.exit(problems.length ? 1 : 0);
