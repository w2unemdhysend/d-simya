"""«Місто» /misto/ in headless Chrome.

  python3 tests/misto_e2e.py     (CHROME=/path/to/chrome to use a system browser; SHOTS=dir for screenshots)

Covers: the offices with «зараз відчинено» by the Xanten clock (the phone in another time zone), today's hours
marked, how to book, phone and map links, the filter by town kept for next time; the events tab: by day, today and
tomorrow named, times, what runs on and what is weekly at the end, links to the city's pages; the city site down: a
clear message and a retry; 340 px without sideways scrolling, dark theme. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, os, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('SHOTS', '')
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

EV = lambda slug, title, **k: {'title': title, 'url': 'https://www.xanten.de/tourismus-freizeit/veranstaltungen/' + slug, 'teaser': k.get('teaser', ''),
    'dates': k.get('dates', []), 'range': k.get('range', False), 'when': k.get('when', ''), 'next': k['next'], 'time': k.get('time', ''),
    'ongoing': k.get('ongoing', False), 'regular': k.get('regular', False)}
EVENTS = {'ok': True, 'source': 'https://www.xanten.de/tourismus-freizeit/veranstaltungen', 'today': '2026-11-19', 'items': [
    EV('martin', 'St. Martins-Umzug in Vynen', dates=['2026-11-19T17:00:00+01:00'], next='2026-11-19', time='17:00'),
    EV('solar', 'SolarWerkstatt', dates=['2026-11-19T10:00:00+01:00'], next='2026-11-19', time='10:00', teaser='Balkonkraftwerk selbst bauen'),
    EV('markt', 'Weihnachtsmarkt', dates=['2026-11-20', '2026-12-23'], range=True, next='2026-11-20'),
    EV('auen', 'AuenBlicke', dates=['2026-11-14T14:00:00+01:00', '2026-11-22T14:00:00+01:00'], next='2026-11-22', time='14:00'),
    EV('spee', 'Sonderausstellung Friedrich Spee', dates=['2026-10-03', '2026-12-31'], range=True, next='2026-11-19', ongoing=True),
    EV('fuehrung', 'Offene Führungen durch das LVR-Römermuseum', when='Wöchentlich am Samstag und Sonntag um 12:00 Uhr', next='2026-11-19', regular=True),
]}

async def phone(browser, base, width=390, scheme='light', events_fail=None):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme, timezone_id='America/New_York')
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    state = {'fail': events_fail, 'calls': 0}
    async def ev(r):
        state['calls'] += 1
        if state['fail']: await r.fulfill(status=502, json={'ok': False, 'error': 'upstream'}, headers={'Access-Control-Allow-Origin': '*'})
        else: await r.fulfill(json=EVENTS, headers={'Access-Control-Allow-Origin': '*'})
    await ctx.route('**/*.workers.dev/events', ev)
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.install(time='2026-11-19T16:00:00Z')   # Thursday 17:00 in Xanten
    await pg.goto(base + 'misto/'); await pg.wait_for_timeout(400)
    return ctx, pg, state

OVERFLOW = "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        ctx, pg, state = await phone(browser, base)
        bb = await pg.text_content('#p-buergerbuero')
        check('Bürgerbüro on Thursday 17:00 Xanten time: open until 18:00 (the phone is in New York)', 'Зараз відчинено, до 18:00' in bb, bb[:300])
        check('…today\'s line marked', await pg.text_content('#p-buergerbuero dt.today') == 'Чт')
        check('…how to book, the online link and the phone', 'Записатися онлайн' in bb and await pg.get_attribute('#p-buergerbuero a[href^="tel:"]', 'href') == 'tel:+492801772350')
        check('…the address opens a map', 'openstreetmap.org' in (await pg.get_attribute('#p-buergerbuero .contact a', 'href') or ''))
        abh = await pg.text_content('#p-abh')
        check('Ausländerbehörde: only with an appointment, the booking link, the tip about the Bürgerbüro', 'тільки за записом' in abh and 'бюро громадян у Ксантені' in abh and await pg.locator('#p-abh a[href*="tevis.krzn.de"]').count() == 1)
        check('Standesamt on Thursday 17:00: closed', 'Зараз зачинено' in await pg.text_content('#p-standesamt'))
        check('the date of the check is shown', 'Перевірено на офіційних сайтах' in await pg.text_content('#view-places'))
        await pg.click('[data-city="Wesel"]'); await pg.wait_for_timeout(150)
        cities = await pg.eval_on_selector_all('#view-places article', 'a => a.map(x => x.dataset.city)')
        check('filter «Везель»: only Wesel', cities and set(cities) == {'Wesel'}, str(cities))
        await pg.reload(); await pg.wait_for_timeout(400)
        check('…kept after reload', await pg.get_attribute('[data-city="Wesel"]', 'aria-pressed') == 'true')
        await pg.click('[data-city="all"]')
        check('390 px «Установи»: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        # events
        await pg.click('#tab-events'); await pg.wait_for_timeout(500)
        heads = await pg.eval_on_selector_all('#view-events .day h2', 'h => h.map(x => x.textContent)')
        check('events by day: today, tomorrow, then the date; what runs on at the end', heads[:2] == ['Сьогодні', 'Завтра'] and 'листопада' in heads[2] and heads[-1] == 'Тривають зараз і щотижня', str(heads))
        first = await pg.evaluate("[...document.querySelectorAll('#view-events .day')][0].querySelectorAll('.ev b').length ? [...[...document.querySelectorAll('#view-events .day')][0].querySelectorAll('.ev b')].map(x => x.textContent) : []")
        check('…today in time order', first == ['SolarWerkstatt', 'St. Martins-Umzug in Vynen'], str(first))
        last = await pg.evaluate("[...document.querySelectorAll('#view-events .day')].pop().textContent")
        check('…the exhibition «триває до», the weekly tour with its text', 'триває до 31 грудня' in last and 'Wöchentlich am Samstag' in last, last)
        check('…each links to the city\'s page', await pg.get_attribute('#view-events .ev', 'href') == 'https://www.xanten.de/tourismus-freizeit/veranstaltungen/solar')
        check('…the source named, the Roman park programme linked', 'xanten.de' in await pg.text_content('#view-events') and await pg.locator('a[href*="archaeologischer-park-xanten/programm"]').count() == 1)
        check('…asked once', state['calls'] == 1)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'misto-events.png'), full_page=True)
        await ctx.close()

        ctx, pg, state = await phone(browser, base, width=340, scheme='dark', events_fail=True)
        await pg.click('#tab-events'); await pg.wait_for_timeout(400)
        check('city site down: a clear message', 'Не вдалося завантажити події' in await pg.text_content('#view-events'))
        state['fail'] = False
        await pg.click('#ev-again'); await pg.wait_for_timeout(400)
        check('…«Спробувати ще» loads them', await pg.locator('#view-events .ev').count() >= 5)
        for t in ('places', 'events'):
            await pg.click(f'#tab-{t}'); await pg.wait_for_timeout(300)
            check(f'340 px dark «{t}»: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'misto-dark-340.png'))
        await ctx.close()
        await browser.close()
    print('\n' + (f'{len(fails)} FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)

asyncio.run(main())
