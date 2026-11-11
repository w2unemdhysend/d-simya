"""The Маршрут page (connections between two stops) in headless Chrome.

  python3 tests/marshrut_e2e.py     (CHROME=/path/to/chrome to use a system browser; SHOTS=dir for screenshots)

Covers: the start is the saved stop, the destination is asked for; choosing by search; the request carries both ids,
no time for "now", the chosen time for "later", long=1 only when "D-Ticket only" is off; connections with times in
Xanten time, duration, changes, line badges; legs with platform, direction and the time to change; "Пізніші" asks
from the last departure on and adds without doubles; saving a route and using it; swapping; errors. 340 px.
Exits 1 if a check fails.
"""
import asyncio, copy, functools, http.server, json, os, re, sys, threading, urllib.parse
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('SHOTS', '')
FX = lambda n: json.load(open(os.path.join(ROOT, 'tests', 'fixtures', n)))
TRIP, STOPS = FX('trip.json'), FX('stops.json')
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

class Worker:
    def __init__(self): self.calls, self.fail = [], False
    async def __call__(self, route):
        u = urllib.parse.urlparse(route.request.url); q = {k: v[0] for k, v in urllib.parse.parse_qs(u.query).items()}
        self.calls.append((u.path, q)); cors = {'Access-Control-Allow-Origin': '*'}
        if self.fail: return await route.fulfill(status=502, json={'ok': False, 'error': 'upstream'}, headers=cors)
        if u.path == '/transit/stops':
            return await route.fulfill(json={'ok': True, 'stops': [{'id': 'de:05112:16032', 'name': 'Duisburg Hbf', 'full': 'Duisburg, Duisburg Hbf', 'place': 'Duisburg'},
                                                                    {'id': 'de:05112:16078', 'name': 'Hbf Osteingang', 'full': 'Duisburg, Hbf Osteingang', 'place': 'Duisburg'}] if 'Duisburg' in q.get('q', '') else [], 'near': None}, headers=cors)
        if u.path == '/transit/trip':
            d = copy.deepcopy(TRIP)
            if q.get('when') and q['when'] > '2026-11-12T08:00':   # asked for later ones: the last known again plus a new one
                d['trips'] = [d['trips'][2], {**copy.deepcopy(d['trips'][1]), 'dep': '2026-11-12T08:09:00Z', 'depEst': '2026-11-12T08:09:00Z', 'arr': '2026-11-12T09:46:00Z', 'arrEst': '2026-11-12T09:46:00Z'}]
            return await route.fulfill(json=d, headers=cors)
        await route.fulfill(status=404, json={'ok': False}, headers=cors)

async def page(browser, base, store=None, width=340):
    ctx = await browser.new_context(viewport={'width': width, 'height': 820}, timezone_id='America/New_York')   # a phone set to another zone still shows Xanten time
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    w = Worker(); await ctx.route('**/*.workers.dev/**', w)
    if store: await ctx.add_init_script("if (!sessionStorage.getItem('seeded')) {" + ''.join(f"localStorage.setItem({json.dumps(k)}, {json.dumps(json.dumps(v))});" for k, v in store.items()) + "sessionStorage.setItem('seeded', '1'); }")
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.install(time='2026-11-12T06:00:00Z')
    await pg.goto(base + 'marshrut/'); await pg.wait_for_timeout(400)
    return ctx, pg, w

TRIPS = "() => [...document.querySelectorAll('.trip')].map(t => ({times: t.querySelector('.times span').textContent, sub: t.querySelector('.times small').textContent, lines: [...t.querySelectorAll('.lines .ln')].map(l => l.textContent), open: t.open}))"

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        ctx, pg, w = await page(browser, base, store={'transport-stops': {'list': [{'id': 'de:05170:37032', 'name': 'Xanten, Bahnhof'}, {'id': 'de:05170:36229', 'name': 'Xanten, Hagelkreuzstraße'}], 'active': 'de:05170:37032'}})
        check('start: from the saved stop, the destination is asked for at once', await pg.text_content('#from-name') == 'Xanten Bahnhof' and await pg.is_visible('#pick') and await pg.text_content('#pick-lab') == 'Куди їдемо' and await pg.is_disabled('#go'))
        check('picker: the other saved stop is offered, the start itself is not', await pg.locator('#mine .chip').all_text_contents() == ['Xanten Hagelkreuzstraße'])
        await pg.fill('#q', 'Duisburg Hbf'); await pg.click('#fgo'); await pg.wait_for_selector('#found button')
        check('search: stops found by name', await pg.locator('#found b').all_text_contents() == ['Duisburg Hbf', 'Duisburg Hbf Osteingang'] and w.calls[-1] == ('/transit/stops', {'q': 'Duisburg Hbf'}), str(w.calls[-1]))
        await pg.click('#found button >> nth=0'); await pg.wait_for_timeout(100)
        check('chosen: both ends set, the picker closes, the button is ready', await pg.text_content('#to-name') == 'Duisburg Hbf' and await pg.is_hidden('#pick') and await pg.is_enabled('#go'))
        await pg.click('#go'); await pg.wait_for_selector('.trip')
        call = [c for c in w.calls if c[0] == '/transit/trip'][-1][1]
        check('request: both ids, no time for "now", no long-distance trains', call == {'from': 'de:05170:37032', 'to': 'de:05112:16032'}, str(call))
        t = await pg.evaluate(TRIPS)
        check('three connections, times in Xanten time whatever the phone\'s zone', [x['times'] for x in t] == ['07:29 → 09:40', '08:09 → 09:46', '08:29 → 10:40'], str(t))
        check('each says how long and how many changes', t[0]['sub'] == '2 год 11 хв · 2 пересадки' and t[1]['sub'] == '1 год 37 хв · 1 пересадка', str([x['sub'] for x in t]))
        check('lines as badges in order; the rail replacement bus is marked', t[0]['lines'] == ['X28', 'SEV 19X', 'RE5'] and await pg.locator('.trip >> nth=0 >> .lines .ln.sev').count() == 1 and await pg.locator('.trip >> nth=0 >> .lines .ln.train').count() == 1, str(t[0]['lines']))
        check('the first connection is open, the others closed', [x['open'] for x in t] == [True, False, False])
        legs = re.sub(r'\s+', ' ', await pg.inner_text('.trip >> nth=0 >> .legs'))
        check('legs: stop with platform, line, direction, duration and stops', 'Xanten Bahnhof стоянка 2' in legs and 'автобус у бік Wesel Bahnhof' in legs and '29 хв, 16 зупинок' in legs and 'Duisburg Hbf' in legs, legs[:300])
        check('legs: the change with its minutes and the walk', 'Пересадка: 30 хв, з них 8 хв пішки' in legs, legs)
        check('"now" does not send the phone\'s own clock', 'when' not in call)
        await pg.click('#later'); await pg.wait_for_function("document.querySelectorAll('.trip').length === 4")
        call = [c for c in w.calls if c[0] == '/transit/trip'][-1][1]
        check('"Пізніші": asks from one minute after the last departure, in Xanten time', call.get('when') == '2026-11-12T08:30', str(call))
        times = [x['times'] for x in await pg.evaluate(TRIPS)]
        check('… and adds only what is new', times == ['07:29 → 09:40', '08:09 → 09:46', '08:29 → 10:40', '09:09 → 10:46'], str(times))
        await pg.click('#save'); await pg.wait_for_timeout(100)
        check('save: the route appears under "Мої маршрути", the button says so', await pg.locator('#routes .chip').all_text_contents() == ['Xanten Bahnhof → Duisburg Hbf'] and await pg.text_content('#save') == 'Збережено')
        await pg.click('#swap'); await pg.wait_for_timeout(100)
        check('swap: the ends change places', await pg.text_content('#from-name') == 'Duisburg Hbf' and await pg.text_content('#to-name') == 'Xanten Bahnhof')
        await pg.click('#when [data-when="at"]'); await pg.wait_for_timeout(100)
        check('"Пізніше": a date and time field appears, set an hour ahead in Xanten time', await pg.is_visible('#at') and await pg.input_value('#at') == '2026-11-12T08:00', await pg.input_value('#at'))
        await pg.fill('#at', '2026-11-13T06:45'); await pg.click('#dt'); await pg.click('#go'); await pg.wait_for_timeout(400)
        call = [c for c in w.calls if c[0] == '/transit/trip'][-1][1]
        check('request with a chosen time, swapped ends and long-distance trains allowed', call == {'from': 'de:05112:16032', 'to': 'de:05170:37032', 'when': '2026-11-13T06:45', 'long': '1'}, str(call))
        await pg.reload(); await pg.wait_for_timeout(400)
        check('after reload: the last pair, the saved route and the D-Ticket choice are remembered', await pg.text_content('#from-name') == 'Duisburg Hbf' and await pg.locator('#routes .chip').count() == 1
              and await pg.get_attribute('#dt', 'aria-checked') == 'false' and await pg.is_hidden('#pick'))
        await pg.click('#routes .chip'); await pg.wait_for_selector('.trip')
        check('a saved route: one tap searches it', await pg.text_content('#res-title') == 'Xanten Bahnhof → Duisburg Hbf' and await pg.text_content('#save') == 'Збережено')
        check('fits 340 px with results open', await pg.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'marshrut.png'), full_page=True)
        await pg.click('#routes .x'); await pg.wait_for_timeout(100)
        check('a saved route can be removed', await pg.is_hidden('#saved') and await pg.text_content('#save') == 'Зберегти')
        w.fail = True
        await pg.click('#go'); await pg.wait_for_selector('#rmsg.err')
        check('VRR down: a clear message, the button works again', 'Не вдалося знайти маршрут' in await pg.text_content('#rmsg') and await pg.is_enabled('#go'))
        await ctx.close()

        ctx, pg, w = await page(browser, base)
        check('nothing saved: starts from Xanten Bahnhof', await pg.text_content('#from-name') == 'Xanten Bahnhof' and await pg.is_visible('#pick'))
        await pg.fill('#q', 'Nirgendwo'); await pg.click('#fgo'); await pg.wait_for_selector('#fmsg:not([hidden])')
        check('search without a match: says how to write it', 'Такої зупинки не знайшов' in await pg.text_content('#fmsg'))
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
