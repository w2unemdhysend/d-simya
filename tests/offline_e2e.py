"""Offline mode: the service worker (sw.js) in headless Chrome.

  python3 tests/offline_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Covers: sw.js keeps every page of the menu and every local file the pages import, with the same asset version the
pages use (so a release never mixes old and new files); after one visit with internet, pages open without internet,
even ones not opened before, and with a ?query; the last weather answer is shown offline; the "no internet" label
comes and goes with the connection; the shopping list and translations are never kept. Exits 1 if a check fails.
"""
import asyncio, functools, glob, http.server, json, os, re, sys, threading
os.environ.setdefault('PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS', '1')   # let the test answer the worker's requests too
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WX = json.load(open(os.path.join(ROOT, 'tests', 'fixtures', 'weather.json')))
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail and not ok else ''))
    if not ok: fails.append(name)

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/'

def static_checks():
    sw = open(os.path.join(ROOT, 'sw.js')).read()
    core = re.findall(r"'([^']+)'", sw[sw.index('const CORE = ['):sw.index('];', sw.index('const CORE = ['))])
    pages = ['index.html'] + sorted(glob.glob('*/index.html', root_dir=ROOT))
    versions = set()
    for p in pages:
        html = open(os.path.join(ROOT, p)).read()
        versions |= set(re.findall(r'assets/((?:ui|page)\.(?:css|js)\?v=\d+)', html))
        d = os.path.dirname(p)
        check(f'sw.js keeps the page {d or "home"}', (d + '/' if d else './') in core)
        for css in re.findall(r'<link rel="stylesheet" href="(?!https?:)([^"]+)"', html):
            rel = os.path.normpath(os.path.join(d, css)).replace('\\', '/')
            if not rel.startswith('assets/'): check(f'sw.js keeps {rel} (style of {p})', rel in core, rel)
        # the page's modules and, in turn, everything they import
        todo = [(d, m) for m in re.findall(r"from '(\.{1,2}/[^']+)'", html)]
        todo += [(d, m) for m in re.findall(r'<script type="module" src="(?!https?:)([^"]+)"', html)]
        todo += [(d, m) for m in re.findall(r"fetch\('(\.{0,2}/?[\w/.-]+\.(?:json|ttf))'", html)]
        seen = set()
        while todo:
            base_dir, mod = todo.pop()
            rel = os.path.normpath(os.path.join(base_dir, mod)).replace('\\', '/')
            if rel in seen: continue
            seen.add(rel)
            check(f'sw.js keeps {rel} (used by {p})', rel in core, rel)
            path = rel.split('?')[0]
            if path.endswith('.js') and os.path.exists(os.path.join(ROOT, path)):
                todo += [(os.path.dirname(path), m) for m in re.findall(r"from '(\.{1,2}/[^']+)'", open(os.path.join(ROOT, path)).read())]
    check('pages use one asset version, and sw.js keeps that one', len(versions) == 3 and all('assets/' + v in core for v in versions), f'{versions} vs {[c for c in core if "?v=" in c]}')
    check('sw.js never keeps the list, translations or searches', not re.search(r'/list|translate|transit/stops', sw.split('const DATA')[1].split('\n')[0]))

async def main():
    static_checks()
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        ctx = await browser.new_context(viewport={'width': 390, 'height': 800})
        await ctx.add_init_script("try { localStorage.setItem('dsimya-sw-test', '1'); } catch (e) {}")
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
        await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        async def worker(route):
            if '/weather' in route.request.url: return await route.fulfill(json=WX, headers={'Access-Control-Allow-Origin': '*'})
            await route.fulfill(status=404, json={'ok': False}, headers={'Access-Control-Allow-Origin': '*'})
        await ctx.route('**/*.workers.dev/**', worker)
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))

        await pg.goto(base + 'pogoda/')
        await pg.evaluate("navigator.serviceWorker.ready.then(() => true)")
        await pg.reload(); await pg.wait_for_selector('#now-body:not([hidden])', timeout=10000)
        check('online: the service worker controls the page', await pg.evaluate('!!navigator.serviceWorker.controller'))
        check('online: no "no internet" label', await pg.is_hidden('.offline'))
        await pg.wait_for_function("caches.keys().then(k => k.some(n => n.startsWith('dsimya-core-')))", timeout=10000)
        await pg.wait_for_timeout(800)
        kept = await pg.evaluate("async () => { const out = []; for (const n of await caches.keys()) for (const r of await (await caches.open(n)).keys()) out.push(n + ' ' + new URL(r.url).pathname + new URL(r.url).search); return out; }")
        check('pages and files kept after one visit', any(k.endswith('/pralka/') for k in kept) and any('ui.js?v=' in k for k in kept) and any('kalender.json' in k for k in kept), str(kept[:8]))
        check('the last weather answer is kept', any('/weather' in k for k in kept), str([k for k in kept if 'data' in k]))

        await ctx.set_offline(True)
        await pg.goto(base + 'pralka/')
        check('offline: a page never opened before still opens (the washer guide)', (await pg.text_content('h1')) == 'Пралка')
        check('offline: the "no internet" label shows', await pg.is_visible('.offline') and 'Немає інтернету' in await pg.text_content('.offline'))
        await pg.goto(base + 'igry/?tab=art')
        check('offline: a page with a ?query opens (the bot\'s word-of-the-day link)', await pg.is_visible('#view-art'))
        await pg.goto(base + 'igry/?tab=satz'); await pg.wait_for_timeout(300)
        check('offline: the German games work (their modules are kept)', await pg.is_visible('#z-pool .zw'))
        await pg.goto(base + 'pogoda/')
        await pg.wait_for_selector('#now-body:not([hidden]), #now-wait.err', timeout=10000)
        check('offline: the last weather is shown, with its time', '5°' in await pg.text_content('#now-body') and 'оновлено о' in await pg.text_content('#now-body'))
        await pg.goto(base + 'smittia/')
        check('offline: the waste calendar works (its data file is kept)', 'Сміття' == await pg.text_content('h1') and not await pg.locator('text=Не вдалося').count())
        await ctx.set_offline(False); await pg.wait_for_timeout(300)
        # the phrasebook: clips fetched ahead while online play later without internet
        await pg.goto(base + 'rozmovnyk/'); await pg.wait_for_timeout(1500)
        first = await pg.evaluate("import('../audio/index.js').then(m => m.AUDIO['Können Sie das bitte wiederholen?'])")
        await ctx.set_offline(True)
        got = await pg.evaluate(f"fetch('../audio/{first}').then(r => r.status + ' ' + r.headers.get('content-type')).catch(e => 'failed ' + e)")
        check('offline: a phrasebook clip fetched before plays without internet', got.startswith('200'), got)
        await ctx.set_offline(False); await pg.wait_for_timeout(300)
        check('back online: the label goes away', await pg.is_hidden('.offline'))
        await ctx.close(); await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
