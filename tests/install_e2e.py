"""Installing D-SIM'YA as an app (so it opens without internet), in headless Chrome.

  python3 tests/install_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Telegram has to ask its own server before it opens a Mini App, so without a connection it only spins; the pages
installed as an app open from their own icon with what sw.js keeps. Covers: the manifest (name, start, standalone,
icons that exist in their sizes, a maskable one) and its link with the icons on every page; sw.js keeps them; the menu's
foot in Telegram (opens the site in the phone's browser with ?install=1) and in a browser (Chrome's question when it
offers one, else how to do it by hand); the note on the page opened with ?install=1; nothing once installed. Exits 1 if a check fails.
"""
import asyncio, functools, glob, http.server, json, os, struct, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TG = """window.__opened = [];
window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '', ready() {}, expand() {}, onEvent() {},
  setHeaderColor() {}, setBackgroundColor() {}, isVersionAtLeast() { return true; }, openLink(u, o) { window.__opened.push([u, o]); },
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};"""
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

def png_size(path):
    with open(path, 'rb') as f: head = f.read(24)
    return struct.unpack('>II', head[16:24]) if head[:8] == b'\x89PNG\r\n\x1a\n' else None

async def main():
    m = json.load(open(os.path.join(ROOT, 'manifest.webmanifest')))
    sizes = {i['sizes']: i for i in m['icons']}
    check('manifest: name, short name, starts at the home page, a window of its own', m['short_name'] == "D-SIM'YA" and m['start_url'] == './' and m['scope'] == './' and m['display'] == 'standalone' and m['lang'] == 'uk')
    check('manifest: icons 192 and 512 that exist in those sizes, one maskable', '192x192' in sizes and '512x512' in sizes and any(i.get('purpose') == 'maskable' for i in m['icons'])
          and all(png_size(os.path.join(ROOT, i['src'])) == tuple(int(n) for n in i['sizes'].split('x')) for i in m['icons']), str([(i['src'], png_size(os.path.join(ROOT, i['src']))) for i in m['icons']]))
    pages = ['index.html'] + sorted(glob.glob(os.path.join(ROOT, '*', 'index.html')))
    missing = [p for p in pages if 'manifest.webmanifest"' not in open(os.path.join(ROOT, p)).read() or 'apple-touch-icon' not in open(os.path.join(ROOT, p)).read()]
    check('every page links the manifest and the icons', not missing, str(missing))
    sw = open(os.path.join(ROOT, 'sw.js')).read()
    check('sw.js keeps the manifest and the icons', all(x in sw for x in ["'manifest.webmanifest'", "'assets/icons/icon-192.png'", "'assets/icons/icon-512.png'"]))

    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        # in Telegram: the menu's foot opens the site in the phone's browser to install it there
        ctx = await browser.new_context(viewport={'width': 390, 'height': 800})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG, content_type='text/javascript'))
        await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(base + 'pogoda/'); await pg.wait_for_timeout(300)
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        foot = await pg.text_content('#dfoot')
        check('Telegram: the menu ends with «Працювати без інтернету»', 'Працювати без інтернету' in foot and 'застосунок' in foot, foot)
        await pg.click('#dfoot [data-install]'); await pg.wait_for_timeout(200)
        opened = await pg.evaluate('window.__opened')
        check('… which opens the site in the phone\'s browser (Chrome), asking to install', opened and opened[0][0] == base + '?install=1' and opened[0][1] == {'try_browser': 'chrome'}, str(opened))
        check('Telegram: no install note on the page itself', not await pg.query_selector('.install'))
        await ctx.close()

        # in a browser opened with ?install=1: the note says what it gives and how
        ctx = await browser.new_context(viewport={'width': 390, 'height': 800})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
        await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(base + '?install=1'); await pg.wait_for_timeout(500)
        note = await pg.text_content('.install') if await pg.query_selector('.install') else ''
        check('browser with ?install=1: a note — own icon, works without internet, how to install', 'без інтернету' in note and ('Установити додаток' in note or 'На екран' in note), note)
        await pg.click('.install [data-i="no"]'); await pg.wait_for_timeout(400)
        check('… and it goes away', not await pg.query_selector('.install'))
        # Chrome offers installing: our button asks Chrome's own question
        await pg.evaluate("""() => { window.__prompted = 0; const e = new Event('beforeinstallprompt'); e.prompt = () => { window.__prompted++; }; e.userChoice = Promise.resolve({outcome: 'accepted'}); window.dispatchEvent(e); }""")
        await pg.wait_for_timeout(300)
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        foot = await pg.text_content('#dfoot')
        check('browser: when Chrome can install, the menu says «Встановити застосунок»', 'Встановити застосунок' in foot and 'без інтернету' in foot, foot)
        await pg.click('#dfoot [data-install]'); await pg.wait_for_timeout(200)
        check('… and asks Chrome\'s own question', await pg.evaluate('window.__prompted') == 1)
        await ctx.close()

        # installed (a window of its own): nothing about installing
        ctx = await browser.new_context(viewport={'width': 390, 'height': 800})
        await ctx.add_init_script("const mm = window.matchMedia; window.matchMedia = (q) => /display-mode: standalone/.test(q) ? {matches: true, addEventListener() {}, addListener() {}} : mm.call(window, q);")
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
        await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
        pg = await ctx.new_page()
        await pg.goto(base + '?install=1'); await pg.wait_for_timeout(400)
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        check('installed: no note, no menu entry', not await pg.query_selector('.install') and (await pg.text_content('#dfoot')).strip() == '')
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
