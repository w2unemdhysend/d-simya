"""The flyers page /prospekty/ in headless Chrome, with the clock frozen on chosen days.

  python3 tests/prospekty_e2e.py           page checks, no internet needed
  python3 tests/prospekty_e2e.py --live    also opens every flyer link on the chains' sites
                                           (CHROME=/path/to/chrome to use a system browser)

Covers: the week card (dates, KW, Sunday, Christmas week, a holiday today), the right chains and stores per
town, the town choice is remembered, every flyer link goes to an official chain domain and opens in a new
tab, route links open the map for that store, the discount app line, "seen" marks and their weekly reset,
starred chains on top, the Monday reminder switch (with and without Telegram), inside Telegram links open
in the phone's browser, and the page fits a 340 px screen. Exits 1 if a check fails.
"""
import asyncio, datetime, functools, http.server, os, re, sys, threading, urllib.parse
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFICIAL = r'^https://(www\.)?(aldi-sued\.de|lidl\.de|rewe\.de|edeka\.de|netto-online\.de|penny\.de|filiale\.kaufland\.de|trinkgut\.de)/'
TG = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '%s', ready() {}, expand() {}, onEvent() {},
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

def at(day, hour=10):   # a moment in Xanten time (CET, all test days are in winter)
    return datetime.datetime.fromisoformat(f'{day}T{hour:02d}:00:00+01:00')

STATE = """() => [...document.querySelectorAll('.chain')].map(c => ({name: c.querySelector('h2').textContent,
  stores: c.querySelectorAll('.store').length, storeLinks: c.querySelectorAll('.store a.go').length, chainLink: !!c.querySelector(':scope > a.go'),
  routes: c.querySelectorAll('.store a.route').length, perk: c.querySelector('.perk').textContent, seen: !!c.querySelector('.seenmark'),
  star: c.querySelector('.star').getAttribute('aria-pressed')}))"""
WEEK = "() => ({kw: document.getElementById('wk-kw').textContent, title: document.getElementById('wk-title').textContent, line: document.getElementById('wk-line').textContent, closed: [...document.querySelectorAll('#wk-closed li')].map(l => l.className + ': ' + l.textContent), progress: document.getElementById('ptext').textContent})"

async def page(browser, url, day, tg='', width=340, worker=None):
    ctx = await browser.new_context(viewport={'width': width, 'height': 800})
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg, content_type='text/javascript'))
    await ctx.route('**/*.workers.dev/**', worker or (lambda r: r.abort()))
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.set_fixed_time(day)
    await pg.goto(url); await pg.wait_for_timeout(300)
    return ctx, pg

async def main():
    url = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        ctx, pg = await page(browser, url, at('2026-11-11'))
        w = await pg.evaluate(WEEK)
        check('week: 9–14 листопада, KW 46, next flyers on Monday 16', w['title'] == '9–14 листопада' and 'KW 46' in w['kw'] and 'Нові проспекти з понеділка, 16 листопада' in w['line'] and not w['closed'], str(w))
        x = {c['name']: c for c in await pg.evaluate(STATE)}
        check('Xanten: chains', list(x) == ['ALDI SÜD', 'Lidl', 'REWE', 'EDEKA', 'Netto', 'PENNY', 'trinkgut'], str(list(x)))
        check('Xanten: EDEKA and REWE have a flyer button per store', x['EDEKA']['storeLinks'] == 2 and x['REWE']['storeLinks'] == 1 and not x['EDEKA']['chainLink'])
        check('Xanten: other chains have one flyer button', all(x[n]['chainLink'] and not x[n]['storeLinks'] for n in ['ALDI SÜD', 'Lidl', 'Netto', 'PENNY', 'trinkgut']))
        check('every store has a route button', all(c['routes'] == c['stores'] for c in x.values()))
        check('discount line per chain (ALDI: none, Lidl: Lidl Plus, EDEKA: PAYBACK)', 'Без купонів' in x['ALDI SÜD']['perk'] and 'Lidl Plus' in x['Lidl']['perk'] and 'PAYBACK' in x['EDEKA']['perk'])
        check('progress: 0 of 8 flyers seen', w['progress'] == 'Переглянуто 0 з 8 проспектів', w['progress'])
        check('fits 340 px, no sideways scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= 340)

        await pg.click('.town button[data-town="wesel"]')
        ws = {c['name']: c for c in await pg.evaluate(STATE)}
        check('Wesel: Kaufland appears, 4 REWE and 4 EDEKA flyers', 'Kaufland' in ws and ws['REWE']['storeLinks'] == 4 and ws['EDEKA']['storeLinks'] == 4, str(ws.get('REWE')))
        check('Wesel: progress counts 14 flyers', (await pg.evaluate(WEEK))['progress'] == 'Переглянуто 0 з 14 проспектів')
        check('Wesel fits 340 px', await pg.evaluate('document.documentElement.scrollWidth') <= 340)
        await pg.reload(); await pg.wait_for_timeout(300)
        check('town choice remembered', await pg.get_attribute('.town button[data-town="wesel"]', 'aria-pressed') == 'true')

        links = await pg.evaluate("() => [...document.querySelectorAll('#list a.go, #list a.extra')].map(a => [a.href, a.target, a.rel])")
        routes = await pg.evaluate("() => [...document.querySelectorAll('#list a.route')].map(a => [a.href, a.getAttribute('aria-label')])")
        await pg.click('.town button[data-town="xanten"]')
        links += await pg.evaluate("() => [...document.querySelectorAll('#list a.go, #list a.extra')].map(a => [a.href, a.target, a.rel])")
        routes += await pg.evaluate("() => [...document.querySelectorAll('#list a.route')].map(a => [a.href, a.getAttribute('aria-label')])")
        bad = [h for h, t, r in links if not re.match(OFFICIAL, h)]
        check('every flyer link goes to an official chain site', not bad, str(bad))
        check('links open in a new tab', all(t == '_blank' and 'noopener' in r for h, t, r in links))
        q = [urllib.parse.parse_qs(urllib.parse.urlparse(h).query).get('query', [''])[0] for h, _ in routes]
        check('route links: Google Maps search for chain, street and town', all(h.startswith('https://www.google.com/maps/search/?api=1&query=') for h, _ in routes)
              and 'ALDI SÜD, Sonsbecker Straße 21, Xanten' in q and 'REWE, Bislicher Straße 22, Wesel' in q and all(l.startswith('Маршрут: ') for _, l in routes), q[:3])

        # seen: a flyer opened this week gets a mark; next Monday it is gone
        await pg.click('.chain[data-chain="Lidl"] > a.go'); await pg.wait_for_timeout(250)
        await pg.click('.chain[data-chain="EDEKA"] .store a.go'); await pg.wait_for_timeout(250)
        x = {c['name']: c for c in await pg.evaluate(STATE)}
        lidl_btn = await pg.text_content('.chain[data-chain="Lidl"] > a.go')
        check('opened flyer: chain marked seen, button says so', x['Lidl']['seen'] and 'Переглянуто, відкрити' in lidl_btn and not x['EDEKA']['seen'], lidl_btn)
        check('one of two EDEKA flyers seen: the chain is not marked yet, the store button is', not x['EDEKA']['seen'] and 'переглянуто' in await pg.get_attribute('.chain[data-chain="EDEKA"] .store a.go', 'aria-label') and await pg.evaluate("document.querySelector('.chain[data-chain=EDEKA] .store a.go').classList.contains('seen')"))
        check('progress: 2 of 8', (await pg.evaluate(WEEK))['progress'] == 'Переглянуто 2 з 8 проспектів')
        await pg.reload(); await pg.wait_for_timeout(300)
        check('seen marks kept after reload', (await pg.evaluate(WEEK))['progress'] == 'Переглянуто 2 з 8 проспектів')

        # stars: own chains first, under "Мої магазини"
        await pg.click('.chain[data-chain="Netto"] .star'); await pg.wait_for_timeout(200)
        order = [c['name'] for c in await pg.evaluate(STATE)]
        groups = await pg.evaluate("() => [...document.querySelectorAll('#list .group')].map(g => g.textContent)")
        check('starred Netto moves to the top under "Мої магазини"', order[0] == 'Netto' and groups == ['Мої магазини', 'Інші магазини'] and
              await pg.get_attribute('.chain[data-chain="Netto"] .star', 'aria-pressed') == 'true', f'{order} {groups}')
        check('focus stays on the star', await pg.evaluate("document.activeElement.closest('.chain').dataset.chain") == 'Netto')
        await pg.reload(); await pg.wait_for_timeout(300)
        check('stars kept after reload', [c['name'] for c in await pg.evaluate(STATE)][0] == 'Netto')
        await pg.click('.chain[data-chain="Netto"] .star'); await pg.wait_for_timeout(200)
        check('unstarred: original order, no groups', [c['name'] for c in await pg.evaluate(STATE)][4] == 'Netto' and not await pg.evaluate("document.querySelectorAll('#list .group').length"))
        check('reminder outside Telegram: says where it can be switched on', 'через бота в Telegram' in await pg.text_content('#sw-state') and await pg.is_disabled('#sw'))
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'prospekty-light.png'), full_page=True)

        await pg.clock.set_fixed_time(at('2026-11-16', 8)); await pg.reload(); await pg.wait_for_timeout(300)
        check('next Monday: seen marks reset', (await pg.evaluate(WEEK))['progress'] == 'Переглянуто 0 з 8 проспектів')
        await ctx.close()

        # Sunday, Christmas week, a holiday today
        ctx, pg = await page(browser, url, at('2026-11-15'))
        w = await pg.evaluate(WEEK)
        check('Sunday: shops closed, next week shown (16–21, KW 47)', w['title'] == '16–21 листопада' and 'Наступний тиждень · KW 47' == w['kw'] and w['line'].startswith('Сьогодні неділя'), str(w))
        await pg.clock.set_fixed_time(at('2026-12-23')); await pg.reload(); await pg.wait_for_timeout(300)
        w = await pg.evaluate(WEEK)
        check('Christmas week: 24 short, 25 and 26 closed', [c.split(':')[0] for c in w['closed']] == ['short', 'closed', 'closed'] and 'до 14:00' in w['closed'][0] and 'Різдво (1. Weihnachtstag)' in w['closed'][1], str(w['closed']))
        await pg.clock.set_fixed_time(at('2026-12-25')); await pg.reload(); await pg.wait_for_timeout(300)
        w = await pg.evaluate(WEEK)
        check('on the holiday itself: said on top, only the next closed day listed', w['line'].startswith('Сьогодні свято, Різдво (1. Weihnachtstag)') and len(w['closed']) == 1 and '26 грудня' in w['closed'][0], str(w))
        await ctx.close()

        # inside Telegram: links open in the phone's browser, the reminder switch talks to the Worker
        calls = []
        async def worker(route):
            body = route.request.post_data or ''
            action = re.search(r'name="action"\r\n\r\n(\w+)', body); kind = re.search(r'name="kind"\r\n\r\n(\w+)', body)
            calls.append((action and action.group(1), kind and kind.group(1)))
            on = bool(action and action.group(1) == 'on')
            await route.fulfill(json={'ok': True, 'on': on, 'confirmed': on}, headers={'Access-Control-Allow-Origin': '*'})
        ctx, pg = await page(browser, url, at('2026-11-11'), tg=TG % 'query_id=AAH&user=%7B%22id%22%3A4242%7D&hash=00', width=390, worker=worker)
        await pg.wait_for_timeout(300)
        check('reminder: status asked for the flyer kind', calls[:1] == [('status', 'prospekty')] and not await pg.is_disabled('#sw'), str(calls))
        await pg.click('#sw'); await pg.wait_for_timeout(300)
        check('reminder: switched on, confirmation mentioned', calls[-1] == ('on', 'prospekty') and await pg.get_attribute('#sw', 'aria-checked') == 'true' and 'підтвердження' in await pg.text_content('#sw-state'), str(calls))
        href = await pg.get_attribute('.chain a.go', 'href')
        await pg.click('.chain a.go'); await pg.wait_for_timeout(300)
        check('inside Telegram: flyer opens in the phone browser, and counts as seen', await pg.evaluate('window.__opened') == href and pg.url == url and (await pg.evaluate(WEEK))['progress'].startswith('Переглянуто 1 '), href)
        r = await pg.get_attribute('.chain a.route', 'href')
        await pg.click('.chain a.route'); await pg.wait_for_timeout(200)
        check('inside Telegram: route opens outside too, not counted as a flyer', await pg.evaluate('window.__opened') == r and (await pg.evaluate(WEEK))['progress'].startswith('Переглянуто 1 '))
        await pg.emulate_media(color_scheme='dark'); await pg.evaluate("document.documentElement.setAttribute('data-theme','dark')")
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'prospekty-dark.png'), full_page=True)
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
