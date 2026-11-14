"""Settings and watching over the pages, in headless Chrome.

  python3 tests/settings_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Covers: «Великий» text in the menu: set at once, kept on every page from its first frame, clearer greys; the map keeps
its own scale; errors on a page go to the server once, without long numbers or addresses, at most three a page, and
nothing is sent from a local test copy unless asked. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        ctx = await browser.new_context(viewport={'width': 360, 'height': 800})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
        await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
        reports = []
        async def worker(route):
            if route.request.url.endswith('/report'): reports.append(json.loads(route.request.post_data)); return await route.fulfill(status=204)
            return await route.fulfill(status=503, body='{}')
        await ctx.route('**/*.workers.dev/**', worker)
        pg = await ctx.new_page()
        await pg.goto(base + 'ekstreno/'); await pg.wait_for_timeout(400)
        muted0 = await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()")
        await pg.click('#menubtn'); await pg.wait_for_timeout(300)
        check('the menu offers the text size', await pg.locator('[data-big]').count() == 2)
        await pg.click('[data-big="1"]'); await pg.wait_for_timeout(200)
        zoom = await pg.evaluate("getComputedStyle(document.body).zoom")
        check('«Великий»: bigger at once, darker greys', await pg.get_attribute('html', 'data-big') == '1' and zoom == '1.15' and await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()") != muted0, zoom)
        await pg.keyboard.press('Escape')
        for path in ('', 'yizha/', 'sport/', 'spysok/'):
            await pg.goto(base + path); await pg.wait_for_timeout(300)
            check(f'«Великий» kept on «{path or "головна"}», nothing scrolls sideways', await pg.get_attribute('html', 'data-big') == '1' and await pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth') <= 0)
        await pg.goto(base + 'mapa/'); await pg.wait_for_timeout(300)
        check('the map keeps its own scale', await pg.evaluate("getComputedStyle(document.body).zoom") == '1')
        await pg.click('#menubtn') if await pg.is_visible('#menubtn') else None
        await pg.goto(base + 'ekstreno/'); await pg.click('#menubtn'); await pg.click('[data-big="0"]'); await pg.wait_for_timeout(200)
        check('back to normal', await pg.get_attribute('html', 'data-big') is None and await pg.evaluate("localStorage.getItem('dsimya-big')") is None)

        # errors
        await pg.goto(base + 'ekstreno/'); await pg.wait_for_timeout(300)
        await pg.evaluate("setTimeout(() => { throw new Error('boom for 4242424242 at me@example.com'); })"); await pg.wait_for_timeout(500)
        check('a local test copy sends nothing', reports == [])
        await pg.evaluate("localStorage.setItem('dsimya-report-test', '1')")
        await pg.reload(); await pg.wait_for_timeout(300)
        for i in range(2): await pg.evaluate("setTimeout(() => { throw new Error('boom for 4242424242 at me@example.com'); })")
        await pg.evaluate("setTimeout(() => Promise.reject(new Error('rejected 123456789')))")
        for m in ('a', 'b', 'c'): await pg.evaluate(f"setTimeout(() => {{ throw new Error('other {m}'); }})")
        await pg.wait_for_timeout(800)
        check('an error is sent once, without the number or the address', len([r for r in reports if r['m'].startswith('Error: boom') or r['m'].startswith('Uncaught Error: boom')]) == 1 and not any('4242424242' in r['m'] or 'example.com' in r['m'] for r in reports), str(reports))
        check('…with the page and where, never who', reports and reports[0]['p'] == 'ekstreno/' and 'initData' not in json.dumps(reports) and reports[0]['t'], str(reports[:1]))
        check('at most three a page', len(reports) == 3, str(len(reports)))
        await browser.close()
    print('\n' + (f'{len(fails)} FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)

asyncio.run(main())
