"""The flyers page /prospekty/ in headless Chrome.

  python3 tests/prospekty_e2e.py           page checks, no internet needed
  python3 tests/prospekty_e2e.py --live    also opens every flyer link on the chains' sites
                                           (CHROME=/path/to/chrome to use a system browser)

Covers: the right chains and stores per town, the town choice is remembered, every link goes to
an official chain domain and opens in a new tab, inside Telegram links open in the phone's
browser, and the page fits a 340 px screen. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, os, re, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFICIAL = r'^https://(www\.)?(aldi-sued\.de|lidl\.de|rewe\.de|edeka\.de|netto-online\.de|penny\.de|filiale\.kaufland\.de|trinkgut\.de)/'
TG = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '', ready() {}, expand() {}, onEvent() {},
  setHeaderColor() {}, setBackgroundColor() {}, openLink(u) { window.__opened = u; },
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};"""
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail else ''))
    if not ok: fails.append(name)

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/prospekty/'

STATE = """() => [...document.querySelectorAll('.chain')].map(c => ({name: c.querySelector('h2').textContent,
  stores: c.querySelectorAll('.store').length, storeLinks: c.querySelectorAll('.store a').length, chainLink: !!c.querySelector(':scope > a.go')}))"""

async def main():
    url = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        ctx = await browser.new_context(viewport={'width': 340, 'height': 760})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(url); await pg.wait_for_timeout(300)

        x = {c['name']: c for c in await pg.evaluate(STATE)}
        check('Xanten: chains', list(x) == ['ALDI SÜD', 'Lidl', 'REWE', 'EDEKA', 'Netto', 'PENNY', 'trinkgut'], str(list(x)))
        check('Xanten: EDEKA and REWE have a flyer button per store', x['EDEKA']['storeLinks'] == 2 and x['REWE']['storeLinks'] == 1 and not x['EDEKA']['chainLink'])
        check('Xanten: other chains have one flyer button', all(x[n]['chainLink'] and not x[n]['storeLinks'] for n in ['ALDI SÜD', 'Lidl', 'Netto', 'PENNY', 'trinkgut']))
        check('fits 340 px, no sideways scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= 340)

        await pg.click('.town button[data-town="wesel"]')
        w = {c['name']: c for c in await pg.evaluate(STATE)}
        check('Wesel: Kaufland appears, 4 REWE and 4 EDEKA flyers', 'Kaufland' in w and w['REWE']['storeLinks'] == 4 and w['EDEKA']['storeLinks'] == 4, str(w.get('REWE')))
        await pg.reload(); await pg.wait_for_timeout(300)
        check('town choice remembered', await pg.get_attribute('.town button[data-town="wesel"]', 'aria-pressed') == 'true')

        links = await pg.evaluate("() => [...document.querySelectorAll('#list a')].map(a => [a.href, a.target, a.rel])")
        await pg.click('.town button[data-town="xanten"]')
        links += await pg.evaluate("() => [...document.querySelectorAll('#list a')].map(a => [a.href, a.target, a.rel])")
        bad = [h for h, t, r in links if not re.match(OFFICIAL, h) and 'lidl.de' not in h]
        check('every link goes to an official chain site', not bad, str(bad))
        check('links open in a new tab', all(t == '_blank' and 'noopener' in r for h, t, r in links))
        await ctx.close()

        ctx = await browser.new_context(viewport={'width': 390, 'height': 760})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG, content_type='text/javascript'))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(url); await pg.wait_for_timeout(300)
        href = await pg.get_attribute('.chain a.go', 'href')
        await pg.click('.chain a.go'); await pg.wait_for_timeout(300)
        check('inside Telegram: flyer opens in the phone browser', await pg.evaluate('window.__opened') == href and pg.url == url, href)
        await ctx.close()

        if '--live' in sys.argv:   # the chain sites block plain HTTP clients, so a real browser opens each page
            for h in sorted({h for h, t, r in links}):
                ctx = await browser.new_context(locale='de-DE', user_agent='Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36')
                live = await ctx.new_page()
                try:
                    await live.goto(h, timeout=40000)
                    for _ in range(10):   # REWE answers rapid requests with a Cloudflare check ("Nur einen Moment"); a phone browser passes it
                        if 'Moment' not in await live.title(): break
                        await live.wait_for_timeout(1500)
                    title = await live.title()
                    check(f'live: {h}', not re.search(r'404|nicht gefunden|offline|Moment', title, re.I), title[:50])
                except Exception as e:
                    check(f'live: {h}', False, str(e)[:80])
                await ctx.close(); await asyncio.sleep(4)
        await browser.close()

asyncio.run(main())
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
