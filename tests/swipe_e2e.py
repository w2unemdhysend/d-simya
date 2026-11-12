"""Swipes in headless Chrome with real touch events (DevTools protocol), on a phone-sized touch screen.

  python3 tests/swipe_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Covers: sideways swipe switches tabs on the washer page (next, previous), the page and the tab marker follow the
finger, a short swipe springs back, scrolling up and down never switches, nothing on the first tab to the right,
the program knob is not a swipe; the new view slides in from the side it comes from; a swipe from the left edge opens
the menu and a swipe on the menu closes it; the games menu has no tabs (only the edge swipe); pages without tabs only have the
edge swipe. Also: at the bottom of the washer page, turning the program knob never moves the page.
Exits 1 if a check fails.
"""
import asyncio, functools, http.server, os, sys, threading
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

async def touch(cdp, kind, x=None, y=None):
    await cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [] if x is None else [{'x': x, 'y': y}]})

async def swipe(cdp, x0, y0, x1, y1, steps=10, ms=160, end=True):
    await touch(cdp, 'touchStart', x0, y0)
    for i in range(1, steps + 1):
        await touch(cdp, 'touchMove', x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps)
        await asyncio.sleep(ms / steps / 1000)
    if end: await touch(cdp, 'touchEnd')

async def page(browser, url):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 800}, has_touch=True, is_mobile=True, device_scale_factor=1)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.goto(url); await pg.wait_for_timeout(500)
    return ctx, pg, await ctx.new_cdp_session(pg)

TAB = "document.querySelector('.tabs [aria-selected=\"true\"]').dataset.tab"

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        ctx, pg, cdp = await page(browser, base + 'pralka/')
        check('washer page starts on Панель', await pg.evaluate(TAB) == 'panel')
        # the finger is still down: view and tab marker follow
        before = await pg.evaluate("document.querySelector('.tthumb').style.transform")
        await swipe(cdp, 300, 420, 180, 424, end=False)
        mid = await pg.evaluate("({v: document.getElementById('view-panel').style.transform, t: document.querySelector('.tthumb').style.transform})")
        check('while dragging, the page follows the finger', mid['v'].startswith('translateX(-') , str(mid))
        check('while dragging, the tab marker moves toward the next tab', mid['t'] != before, f'{before} → {mid["t"]}')
        await touch(cdp, 'touchEnd'); await pg.wait_for_timeout(700)
        check('swipe left: next tab «Що прати»', await pg.evaluate(TAB) == 'choose' and await pg.is_visible('#view-choose') and await pg.is_hidden('#view-panel'))
        dx = await pg.evaluate("getComputedStyle(document.getElementById('view-choose')).getPropertyValue('--dx').trim()")
        check('the new view came in from the right', dx == '28px', dx)
        await swipe(cdp, 300, 420, 100, 420); await pg.wait_for_timeout(700)
        check('swipe left again: «Як прати»', await pg.evaluate(TAB) == 'steps')
        await swipe(cdp, 80, 420, 300, 420); await pg.wait_for_timeout(700)
        check('swipe right: back to «Що прати»', await pg.evaluate(TAB) == 'choose')
        dx = await pg.evaluate("getComputedStyle(document.getElementById('view-choose')).getPropertyValue('--dx').trim()")
        check('going back, the view comes in from the left', dx == '-28px', dx)
        await swipe(cdp, 200, 420, 170, 420, ms=400); await pg.wait_for_timeout(500)
        st = await pg.evaluate("document.getElementById('view-choose').style.transform")
        check('a short slow swipe springs back and stays', await pg.evaluate(TAB) == 'choose' and not st, st)
        await swipe(cdp, 200, 600, 215, 250); await pg.wait_for_timeout(500)
        check('scrolling up and down never switches the tab', await pg.evaluate(TAB) == 'choose')
        await swipe(cdp, 80, 420, 300, 420); await pg.wait_for_timeout(700)
        await swipe(cdp, 80, 420, 330, 420); await pg.wait_for_timeout(600)
        check('first tab: a swipe to the right does nothing', await pg.evaluate(TAB) == 'panel')

        # the program knob turns, it is not a swipe; at the bottom of the page the page does not move
        await pg.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)"); await pg.wait_for_timeout(400)
        k = await pg.evaluate("(() => { const r = document.querySelector('#dial .knobhit').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; })()")
        y0 = await pg.evaluate('scrollY')
        PROG = "document.querySelector('#dial .plabel.on').getAttribute('data-prog')"
        progs = {await pg.evaluate(PROG)}
        tops = []
        await touch(cdp, 'touchStart', k['x'], k['y'] - 40)
        import math
        for i in range(1, 25):   # a slow turn around the knob centre, through several programs
            a = -math.pi / 2 + i * 0.12
            await touch(cdp, 'touchMove', k['x'] + 40 * math.cos(a), k['y'] + 40 * math.sin(a))
            await asyncio.sleep(0.02)
            tops.append(await pg.evaluate("Math.round(document.querySelector('#dial .knobhit').getBoundingClientRect().top)"))
            progs.add(await pg.evaluate(PROG))
        await touch(cdp, 'touchEnd'); await pg.wait_for_timeout(400)
        check('the knob is not a swipe: still on Панель', await pg.evaluate(TAB) == 'panel')
        check('the turn went through several programs', len(progs) >= 3, str(progs))
        check('turning the knob at the bottom: the page never moves', len(set(tops)) == 1 and await pg.evaluate('scrollY') == y0, f'{set(tops)} scroll {y0} → {await pg.evaluate("scrollY")}')

        # the menu: from the left edge, and closed with a swipe
        await pg.evaluate('window.scrollTo(0, 0)')
        await swipe(cdp, 4, 400, 200, 404, end=False)
        drag = await pg.evaluate("({cls: document.getElementById('drawer').className, t: document.querySelector('.drawer-panel').style.transform})")
        check('edge swipe: the menu follows the finger', 'dragging' in drag['cls'] and drag['t'].startswith('translateX(-'), str(drag))
        await touch(cdp, 'touchEnd'); await pg.wait_for_timeout(500)
        check('edge swipe opens the menu', await pg.evaluate("document.getElementById('drawer').classList.contains('open')") and await pg.evaluate("!!(history.state && history.state.menu)"))
        check('the tab did not change behind the menu', await pg.evaluate(TAB) == 'panel')
        await swipe(cdp, 260, 400, 40, 400); await pg.wait_for_timeout(500)
        check('swipe left on the menu closes it, history cleaned', not await pg.evaluate("document.getElementById('drawer').classList.contains('open')") and not await pg.evaluate("!!(history.state && history.state.menu)"))
        await swipe(cdp, 4, 400, 60, 400, ms=500); await pg.wait_for_timeout(500)
        check('a short slow edge swipe leaves the menu closed', not await pg.evaluate("document.getElementById('drawer').classList.contains('open')"))
        await ctx.close()

        # the dryer page works the same
        ctx, pg, cdp = await page(browser, base + 'sushka/')
        await swipe(cdp, 300, 420, 100, 420); await pg.wait_for_timeout(700)
        check('dryer: swipe left goes to «Що сушити»', await pg.evaluate(TAB) == 'choose')
        await ctx.close()

        # games: the menu has no tabs, so a swipe in the middle stays put
        ctx, pg, cdp = await page(browser, base + 'igry/')
        await swipe(cdp, 300, 500, 80, 500); await pg.wait_for_timeout(600)
        check('games: a swipe in the middle of the menu does nothing', await pg.is_visible('#view-hub') and not await pg.evaluate("document.getElementById('drawer').classList.contains('open')"))
        await swipe(cdp, 3, 300, 260, 300); await pg.wait_for_timeout(500)
        check('games: the edge swipe opens the menu', await pg.evaluate("document.getElementById('drawer').classList.contains('open')"))
        await ctx.close()

        # home screen: no tabs, only the edge swipe; a swipe in the middle does nothing
        ctx, pg, cdp = await page(browser, base)
        await swipe(cdp, 300, 500, 60, 500); await pg.wait_for_timeout(500)
        check('home: a swipe in the middle does nothing', not await pg.evaluate("document.getElementById('drawer').classList.contains('open')") and pg.url == base)
        await swipe(cdp, 3, 300, 260, 300); await pg.wait_for_timeout(500)
        check('home: edge swipe opens the menu', await pg.evaluate("document.getElementById('drawer').classList.contains('open')"))
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
