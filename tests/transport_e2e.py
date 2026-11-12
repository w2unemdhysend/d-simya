"""The Транспорт page /transport/ in headless Chrome, with the Worker answers taken from tests/fixtures
(recorded from VRR and Open-Meteo on 11.11.2026) and the clock frozen at that moment.

  python3 tests/transport_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Covers: the D-Ticket button per platform (Android → Google Play, iPhone → App Store, computer → both, inside
Telegram through openLink) and that nothing about the ticket is stored; the weather line for the household's
place; departures with minutes to go, delays, cancelled trips, platforms, rail replacement buses and the
TaxiBus hint; trains/buses filter; "show more"; VRR notices with a Ukrainian headline and translation; adding,
switching and removing stops (kept on the device and in the Telegram cloud); pinning stops for the bot's /bus (sent to
the Worker only when they change, up to four); errors; 340 px and dark theme.
Exits 1 if a check fails.
"""
import asyncio, copy, functools, http.server, json, os, re, sys, threading, urllib.parse
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FX = lambda n: json.load(open(os.path.join(ROOT, 'tests', 'fixtures', n)))
DEP, STOPS, WX = FX('departures.json'), FX('stops.json'), FX('weather.json')
NEAR_ADDR, NEAR_STREET, NEAR_HERE = FX('near-address.json'), FX('near-street.json'), FX('near-here.json')
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
    return f'http://127.0.0.1:{srv.server_address[1]}/transport/'

def tg_js(platform='android', init='', cloud=None):
    return """window.__cloud = %s; window.Telegram = {WebApp: {platform: '%s', colorScheme: 'light', initData: '%s', ready() {}, expand() {}, onEvent() {},
  isVersionAtLeast() { return true; }, setHeaderColor() {}, setBackgroundColor() {}, openLink(u) { (window.__opened = window.__opened || []).push(u); },
  CloudStorage: {getItem(k, cb) { setTimeout(() => cb(null, window.__cloud[k] || ''), 50); }, setItem(k, v) { window.__cloud[k] = v; }},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};""" % (
        json.dumps(cloud or {}), platform, init)

def departures():
    """The recorded answer plus a cancelled trip, a delay and a TaxiBus hint, so every kind of row is on screen."""
    d = copy.deepcopy(DEP)
    bus = next(x for x in d['deps'] if x['line'] == 'X28')
    bus['live'] = True; bus['est'] = bus['plan'][:14] + '%02d' % (int(bus['plan'][14:16]) + 4) + ':00Z'
    gone = next(x for x in d['deps'] if x['line'] == 'SL40'); gone['gone'] = True
    d['hints'].append('Linie 41: TaxiBus - nur nach Voranmeldung 30 Min. vor Abfahrt')
    taxi = next(x for x in d['deps'] if x['line'] == '41'); taxi['hints'] = [len(d['hints']) - 1]
    return d

class Worker:
    def __init__(self, fail=False, slow=0):
        self.calls, self.fail, self.slow = [], fail, slow
    async def __call__(self, route):
        req = route.request; u = urllib.parse.urlparse(req.url); q = urllib.parse.parse_qs(u.query)
        self.calls.append((u.path, q, req.method, req.post_data if req.method == 'POST' else None))
        if self.slow and u.path == '/transit/departures' and sum(1 for c in self.calls if c[0] == u.path) == 1: await asyncio.sleep(self.slow)
        if self.fail and u.path != '/weather':
            return await route.fulfill(status=502, json={'ok': False, 'error': 'upstream'})
        if u.path == '/transit/departures':
            d = departures(); d['stop'] = {'id': q['stop'][0], 'name': DEP['stop']['name'] if q['stop'][0] == DEP['stop']['id'] else 'Xanten, Hagelkreuzstraße'}
            return await route.fulfill(json=d)
        if u.path == '/transit/stops':
            if 'lat' in q: return await route.fulfill(json=NEAR_HERE)
            text = q.get('q', [''])[0]
            if any(ch.isdigit() for ch in text): return await route.fulfill(json=NEAR_ADDR)
            if text == 'Xanten Sonsbecker Straße': return await route.fulfill(json=NEAR_STREET)
            return await route.fulfill(json=STOPS)
        if u.path == '/weather':
            return await route.fulfill(json=WX)
        if u.path == '/stops':
            return await route.fulfill(json={'ok': True})
        if u.path == '/translate':
            return await route.fulfill(json={'ok': True, 'text': 'У середу, 11 листопада, з 16:30 до 19:30 центр Гельдерна закрито через ходу святого Мартина.'})
        await route.fulfill(status=404, json={'ok': False})

async def page(browser, url, tg='', width=390, worker=None, prefs=None, scheme='light', stops=None, ua=None, geo=None):
    extra = {'user_agent': ua} if ua else {}
    if geo: extra.update(geolocation=geo, permissions=['geolocation'])
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme, **extra)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg, content_type='text/javascript'))
    w = worker or Worker()
    await ctx.route('**/*.workers.dev/**', w)
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    init = ''
    if prefs: init += f"localStorage.setItem('smittia-prefs', {json.dumps(json.dumps(prefs))});"
    if stops: init += f"localStorage.setItem('transport-stops', {json.dumps(json.dumps(stops))});"
    if init: await ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ {init} sessionStorage.setItem('seeded', '1'); }}")
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.install(time=DEP['at'])
    await pg.goto(url)
    await pg.wait_for_selector('#deps li, #dep-empty:not([hidden])', timeout=8000)
    await pg.wait_for_timeout(200)
    return ctx, pg, w

ROWS = """() => [...document.querySelectorAll('#deps li')].map(li => ({t: li.querySelector('.t b').textContent, s: (li.querySelector('.t small')||{}).textContent || '',
  line: li.querySelector('.line').textContent, dest: li.querySelector('.dest').textContent, l2: li.querySelector('.l2').textContent,
  gone: li.classList.contains('gone'), hint: (li.querySelector('.hint')||{}).textContent || '', label: li.getAttribute('aria-label')}))"""

async def main():
    url = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        # computer, no Telegram, a household in Lüttingen
        ctx, pg, w = await page(browser, url, prefs={'district': '2', 'place': 'Lüttingen', 'bins': ['rest'], 'rhythm': 'unknown'})
        how = await pg.inner_html('#tk-how')
        check('D-Ticket on a computer: both store links', 'play.google.com/store/apps/details?id=mentz.com.vrr_cibo_app' in how and 'apps.apple.com/de/app/' in how and 'id1491339288' in how, how)
        check('D-Ticket: button opens a store page in a new tab', await pg.get_attribute('#tk-open', 'target') == '_blank' and (await pg.get_attribute('#tk-open', 'href')).startswith('https://play.google.com/'))
        facts = await pg.evaluate("document.querySelector('.facts').textContent")
        check('D-Ticket facts: 63 €, cancel by the 10th, ICE/IC not, ID, screenshot', all(x in facts for x in ['63 €', 'до 10-го', 'ICE', 'посвідчення', 'Скриншот']), facts)
        await pg.wait_for_selector('#wxmini:not([hidden])', timeout=4000)
        wx = await pg.inner_text('#wxmini')
        check('weather line: household place, temperature, words', wx.startswith('Lüttingen: 5°, хмарно'), wx)
        check('weather line asked for Lüttingen, rounded', any(c[0] == '/weather' and c[1].get('lat') == ['51.67'] and c[1].get('lon') == ['6.46'] for c in w.calls), str(w.calls))
        check('weather line leads to the weather page', (await pg.get_attribute('#wxmini', 'href')) == '../pogoda/')

        check('default stop is Xanten Bahnhof', await pg.inner_text('#dep-title') == 'Xanten Bahnhof' and w.calls[0][0] in ('/transit/departures', '/weather'))
        rows = await pg.evaluate(ROWS)
        check('first 12 departures shown', len(rows) == 12, len(rows))
        first = rows[0]
        check('first row: minutes to go and the clock in Xanten time (13:27 UTC → 14:27)', first['t'] == '1 хв' and first['s'] == '14:27' and first['line'] == 'BSO', str(first))
        late = next((r for r in rows if '+4 хв' in r['l2']), None)
        check('delay shown as +4 хв with the planned time', late is not None and '+4 хв, за розкладом' in late['l2'], str([r['l2'] for r in rows]))
        gone = [r for r in rows if r['gone']]
        check('cancelled trip struck through and said', len(gone) >= 1 and 'скасовано' in gone[0]['l2'] and 'скасовано' in gone[0]['label'], str(gone))
        sev = [r for r in rows if r['line'].startswith('SEV')]
        check('rail replacement: "SEV 31", bus instead of a train', sev and sev[0]['line'] == 'SEV 31' and 'автобус замість потяга' in sev[0]['l2'], str(sev))
        check('platform as "стоянка N" for buses', any('стоянка ' in r['l2'] for r in rows))
        check('live trips "вчасно", planned-only "за розкладом"', any('вчасно' in r['l2'] for r in rows) and any(r['l2'].endswith('за розкладом') for r in rows), str([r['l2'] for r in rows]))
        check('live marker in the header', await pg.locator('#dep-meta .live').count() == 1 and 'оновлено о 14:26' in await pg.inner_text('#dep-meta'), await pg.inner_text('#dep-meta'))

        # filter
        check('trains/buses filter shown (SEV counts as train)', not await pg.is_hidden('#modes'))
        await pg.click('#modes [data-mode="train"]')
        tr = await pg.evaluate(ROWS)
        check('"Потяги" shows only the rail replacement', tr and all(r['line'].startswith('SEV') for r in tr), str([r['line'] for r in tr]))
        await pg.click('#modes [data-mode="bus"]')
        bu = await pg.evaluate(ROWS)
        check('"Автобуси" hides the rail replacement', bu and not any(r['line'].startswith('SEV') for r in bu))
        await pg.click('#modes [data-mode="all"]')
        await pg.click('#more')
        check('"Показати ще" adds more rows', len(await pg.evaluate(ROWS)) > 12)

        # TaxiBus hint
        allrows = await pg.evaluate(ROWS)
        taxi = next((r for r in allrows if r['line'] == '41'), None)
        check('TaxiBus: "Лише за викликом" with the German line', taxi and 'Лише за викликом' in taxi['hint'] and 'Voranmeldung' in taxi['hint'], str(taxi))

        # notices
        heads = await pg.evaluate("() => [...document.querySelectorAll('.notice summary b')].map(b => b.textContent)")
        check('notices: Ukrainian headline for "Linie 36 - Umleitung - … Grund: Veranstaltung"', 'Лінія 36: обʼїзд (захід)' in heads, str(heads))
        check('notices: "Лінія 41: зупинки не обслуговуються (будівельні роботи)"', 'Лінія 41: зупинки не обслуговуються (будівельні роботи)' in heads, str(heads))
        await pg.click('.notice summary')
        body = await pg.inner_text('.notice[open] .body')
        check('notice opens: not in the times yet, German text, link to vrr.de', 'Цих змін ще немає' in body and 'Martin' in body and await pg.locator('.notice[open] a[href^="https://ems.vrr.de/"]').count() == 1, body[:200])
        check('no translate button outside Telegram', await pg.locator('[data-tr]').count() == 0)
        check('fits 390 px', await pg.evaluate('document.documentElement.scrollWidth') <= 390)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'transport-390.png'), full_page=True)

        # add a stop through the finder; the look-alike shows its other name
        await pg.click('#addstop')
        check('finder opens with the field focused', not await pg.is_hidden('#finder') and await pg.evaluate("document.activeElement.id") == 'q')
        await pg.fill('#q', 'X'); await pg.press('#q', 'Enter')
        check('one letter: asks for two', 'дві літери' in await pg.inner_text('#ferr'))
        await pg.fill('#q', 'Xanten Lüttingen'); await pg.press('#q', 'Enter')
        await pg.wait_for_selector('#results li')
        res = await pg.evaluate("() => [...document.querySelectorAll('#results button')].map(b => b.textContent)")
        check('results: Hagelkreuzstraße, also known as Lüttingen Schule, with where buses go', any('Hagelkreuzstraße' in r and 'також «Lüttingen Schule»' in r and 'у бік' in r for r in res), str(res))
        await pg.click('#results button[data-add="de:05170:36229"]')
        await pg.wait_for_timeout(300)
        chips = await pg.evaluate("() => [...document.querySelectorAll('#stops [data-stop]')].map(b => [b.textContent, b.getAttribute('aria-pressed')])")
        check('new stop first and active, finder closed', chips[0] == ['Xanten Hagelkreuzstraße', 'true'] and len(chips) == 2 and await pg.is_hidden('#finder'), str(chips))
        check('departures asked for the new stop', any(c[0] == '/transit/departures' and c[1]['stop'] == ['de:05170:36229'] for c in w.calls))
        saved = json.loads(await pg.evaluate("localStorage.getItem('transport-stops')"))
        check('stops kept on the device, with ids and names only', saved['active'] == 'de:05170:36229' and all(set(s) == {'id', 'name'} for s in saved['list']), str(saved))
        await pg.reload(); await pg.wait_for_selector('#deps li')
        check('after reload the chosen stop is still active', await pg.inner_text('#dep-title') == 'Xanten Hagelkreuzstraße')
        await pg.click('#remove'); await pg.wait_for_timeout(200)
        check('remove: back to one stop, no remove link', len(await pg.locator('#stops [data-stop]').all()) == 1 and await pg.is_hidden('#remove'))

        # a street with no stop of that name: the nearest stops, nearest first, with distance and walking time
        await pg.click('#addstop'); await pg.fill('#q', 'Xanten Sonsbecker Straße'); await pg.press('#q', 'Enter')
        await pg.wait_for_selector('#results h3')
        head = await pg.text_content('#results h3')
        items = await pg.evaluate("() => [...document.querySelectorAll('#results button')].map(b => b.textContent)")
        check('street: "Найближчі до «Sonsbecker Straße»", nearest first and marked', head == 'Найближчі до «Sonsbecker Straße»' and 'Найближча' in items[0] and 'Einkaufsmärkte' in items[0] and 'Найближча' not in items[1], f'{head} {items[:2]}')
        check('street: distance and walking time (305 m → 310 м, ≈ 5 хв пішки)', '310 м' in items[0] and '≈ 5 хв пішки' in items[0], items[0])
        check('street: tip to add a house number', 'Додай номер будинку' in await pg.inner_text('#results'))
        check('street: no error line', await pg.is_hidden('#ferr'))
        # an address with a house number
        await pg.fill('#q', 'Xanten Kalkarer Straße 17'); await pg.press('#q', 'Enter')
        await pg.wait_for_function("document.querySelector('#results h3').textContent.includes('Kalkarer')")
        items = await pg.evaluate("() => [...document.querySelectorAll('#results button')].map(b => b.textContent)")
        check('address: nearest stops, km for the far ones, no house-number tip', 'Marienb. Kirche' in items[0] and '500 м' in items[0] and any('2,6 км' in i for i in items) and 'Додай номер' not in await pg.inner_text('#results'), str(items))
        await pg.click('#results button >> nth=0'); await pg.wait_for_timeout(300)
        check('address: tapping the nearest stop adds it and shows its departures', (await pg.evaluate("JSON.parse(localStorage.getItem('transport-stops')).active")) == NEAR_ADDR['near']['stops'][0]['id'] and await pg.is_hidden('#finder'))
        saved = await pg.evaluate("localStorage.getItem('transport-stops')")
        check('the address itself is not kept on the device', 'Kalkarer' not in saved and 'Sonsbecker' not in saved, saved)
        await ctx.close()

        # nearest to the phone: the spot is rounded to three decimals before it is sent
        ctx, pg, w = await page(browser, url, geo={'latitude': 51.66158, 'longitude': 6.45437})
        await pg.click('#addstop'); await pg.click('#nearme')
        await pg.wait_for_selector('#results h3')
        call = next(c for c in w.calls if c[0] == '/transit/stops' and 'lat' in c[1])
        check('near me: asks with the spot rounded to ~100 m', call[1]['lat'] == ['51.662'] and call[1]['lon'] == ['6.454'], str(call[1]))
        check('near me: "Найближчі до тебе", nearest first', await pg.text_content('#results h3') == 'Найближчі до тебе' and 'Rathaus' in await pg.text_content('#results button'))
        check('near me: the button is back for another try', await pg.is_enabled('#nearme') and 'Найближчі до мене' in await pg.inner_text('#nearme'))
        await ctx.close()

        # Android inside Telegram: Play link through openLink, notices translatable, cloud gets the stops
        ctx, pg, w = await page(browser, url, tg=tg_js('android', 'user=%7B%22id%22%3A1%7D&hash=x'))
        how = await pg.inner_text('#tk-how')
        check('Android: Google Play, with the labels as on the phone («Відкрити» in the store, «My tickets» in the VRR App)', 'Google Play' in how and '«Відкрити»' in how and '«My tickets»' in how
              and 'Öffnen' not in how and (await pg.get_attribute('#tk-open', 'href')).startswith('https://play.google.com/'), how)
        await pg.click('#tk-open')
        opened = await pg.evaluate('window.__opened')
        check('Android: the button goes through Telegram openLink, page stays', opened and opened[-1].startswith('https://play.google.com/') and pg.url.endswith('/transport/'), str(opened))
        await pg.click('.notice summary')
        await pg.click('.notice[open] [data-tr]')
        await pg.wait_for_selector('.notice .tr')
        tr = await pg.inner_text('.notice .tr')
        post = next(c for c in w.calls if c[0] == '/translate')
        check('translate: German notice → Ukrainian text, marked as automatic', 'Гельдерна' in tr and 'автоматичний' in tr and 'de-uk' in post[3] and 'initData' in post[3], tr)
        await pg.click('#addstop'); await pg.fill('#q', 'Xanten'); await pg.press('#q', 'Enter'); await pg.wait_for_selector('#results li')
        await pg.click('#results button[data-add="de:05170:36246"]'); await pg.wait_for_timeout(200)
        cloud = await pg.evaluate("JSON.parse(window.__cloud.transport || 'null')")
        check('Telegram cloud gets the stops too', cloud and cloud['active'] == 'de:05170:36246', str(cloud))
        stored = await pg.evaluate("Object.keys(localStorage).join(',') + '|' + Object.keys(window.__cloud).join(',')")
        check('nothing about the ticket is stored', 'ticket' not in stored.lower() and 'vrr' not in stored.lower(), stored)

        # pinning stops for the bot
        field = lambda body, name: (re.search(r'name="%s"\r\n\r\n(.*?)\r\n--' % name, body or '', re.S) or [None, None])[1]
        sent = lambda: [json.loads(field(c[3], 'stops') or 'null') for c in w.calls if c[0] == '/stops']
        check('pin: nothing pinned yet, nothing sent', await pg.get_attribute('#pin', 'aria-pressed') == 'false' and 'Закріпити для бота' in await pg.inner_text('#pin') and not sent())
        await pg.click('#pin'); await pg.wait_for_timeout(200)
        check('pin: the open stop is pinned, marked on its chip', await pg.get_attribute('#pin', 'aria-pressed') == 'true' and await pg.locator('#stops [data-stop="de:05170:36246"] svg.pinned').count() == 1
              and 'Закріплено для бота' in await pg.inner_text('#pin'))
        posts = [c for c in w.calls if c[0] == '/stops']
        title = await pg.inner_text('#dep-title')
        check('pin: the bot gets it (signed, id and the name as shown)', len(posts) == 1 and field(posts[0][3], 'initData') and sent() == [[{'id': 'de:05170:36246', 'name': title}]], f'{sent()} {title}')
        await pg.click('#stops [data-stop="de:05170:37032"]'); await pg.wait_for_timeout(200)
        check('pin: another stop shows unpinned', await pg.get_attribute('#pin', 'aria-pressed') == 'false')
        await pg.click('#pin'); await pg.wait_for_timeout(200)
        note = await pg.inner_text('#pin-note')
        check('pin: two pinned, in the order pinned; the note names them', [x['id'] for x in sent()[-1]] == ['de:05170:36246', 'de:05170:37032'] and f'{title}, Xanten Bahnhof' in note, note)
        saved = json.loads(await pg.evaluate("localStorage.getItem('transport-stops')"))
        check('pin: kept with the stops (device and Telegram cloud)', saved['pins'] == ['de:05170:36246', 'de:05170:37032'] and json.loads(await pg.evaluate('window.__cloud.transport'))['pins'] == saved['pins'], str(saved))
        n = len(sent())
        await pg.reload(); await pg.wait_for_timeout(500)
        check('pin: opening the page again sends nothing new', len(sent()) == n, str(sent()))
        await pg.click('#remove'); await pg.wait_for_timeout(200)
        check('pin: removing a pinned stop unpins it for the bot too', [x['id'] for x in sent()[-1]] == ['de:05170:36246'], str(sent()[-1]))
        await pg.click('#pin'); await pg.wait_for_timeout(200)
        check('pin: unpinned all: the bot gets an empty list', sent()[-1] == [] and await pg.locator('#stops svg.pinned').count() == 0)
        await ctx.close()

        # up to four pins; outside Telegram they stay on the device until the page is opened in Telegram
        five = {'list': [{'id': f'de:05170:3703{k}', 'name': f'Xanten, Stop {k}'} for k in range(5)], 'active': 'de:05170:37034', 'pins': [f'de:05170:3703{k}' for k in range(4)]}
        ctx, pg, w = await page(browser, url, stops=five)
        await pg.click('#pin'); await pg.wait_for_timeout(100)
        note = await pg.inner_text('#pin-note')
        check('pin: a fifth is refused with a reason', await pg.get_attribute('#pin', 'aria-pressed') == 'false' and 'до 4' in note and json.loads(await pg.evaluate("localStorage.getItem('transport-stops')"))['pins'] == five['pins'], note)
        await pg.click('#stops [data-stop="de:05170:37030"]'); await pg.wait_for_timeout(100)
        note = await pg.inner_text('#pin-note')
        check('pin: outside Telegram nothing is sent, the note says when the bot learns them', not any(c[0] == '/stops' for c in w.calls) and 'у Telegram' in note, note)
        await ctx.close()

        # a new phone in Telegram: the pins come from the cloud and are not sent back
        ctx, pg, w = await page(browser, url, tg=tg_js('android', 'user=%7B%22id%22%3A1%7D&hash=x', {'transport': json.dumps({'list': [{'id': 'de:05170:36229', 'name': 'Xanten, Hagelkreuzstraße'}], 'active': 'de:05170:36229', 'pins': ['de:05170:36229']})}))
        try: await pg.wait_for_function("document.getElementById('pin').getAttribute('aria-pressed') === 'true'", timeout=4000)
        except Exception: pass
        check('new phone: pins from the cloud shown, nothing sent', await pg.get_attribute('#pin', 'aria-pressed') == 'true' and not any(c[0] == '/stops' for c in w.calls))
        await ctx.close()

        # a new phone: stops come from the Telegram cloud (while the suggested stop is still loading)
        ctx, pg, w = await page(browser, url, tg=tg_js('ios', '', {'transport': json.dumps({'list': [{'id': 'de:05170:36229', 'name': 'Xanten, Hagelkreuzstraße'}], 'active': 'de:05170:36229'})}), worker=Worker(slow=0.6))
        await pg.wait_for_timeout(400)
        check('iPhone: App Store link', (await pg.get_attribute('#tk-open', 'href')).startswith('https://apps.apple.com/de/app/') and 'App Store' in await pg.inner_text('#tk-how'))
        await pg.wait_for_timeout(900)
        check('new phone: stops from the cloud replace the suggestion, even while it was still loading', await pg.inner_text('#dep-title') == 'Xanten Hagelkreuzstraße', await pg.inner_text('#dep-title'))
        await ctx.close()

        # the Worker is down
        ctx, pg, w = await page(browser, url, worker=Worker(fail=True))
        msg = await pg.inner_text('#dep-empty')
        check('departures fail: clear message and the refresh button', 'Не вдалося завантажити' in msg and await pg.is_visible('#refresh'), msg)
        await pg.click('#addstop'); await pg.fill('#q', 'Wesel'); await pg.press('#q', 'Enter'); await pg.wait_for_selector('#ferr:not([hidden])')
        check('search fails: says so', 'Не вдалося знайти' in await pg.inner_text('#ferr'))
        await ctx.close()

        # live updates: after 30 s it asks again, minutes count down
        ctx, pg, w = await page(browser, url)
        before = (await pg.evaluate(ROWS))[0]['t']
        n0 = sum(1 for c in w.calls if c[0] == '/transit/departures')
        await pg.clock.run_for(31000); await pg.wait_for_timeout(200)
        n1 = sum(1 for c in w.calls if c[0] == '/transit/departures')
        after = (await pg.evaluate(ROWS))[0]['t']
        check('refreshes every 30 s while open', n1 == n0 + 1, f'{n0} → {n1}')
        check('minutes count down', before != after or before == 'зараз', f'{before} → {after}')
        await ctx.close()

        # small screen, dark theme
        ctx, pg, w = await page(browser, url, width=340, scheme='dark', prefs={'place': 'Xanten', 'district': '1'})
        await pg.click('#more'); await pg.click('.notice summary')
        check('fits 340 px with everything open', await pg.evaluate('document.documentElement.scrollWidth') <= 340, await pg.evaluate('document.documentElement.scrollWidth'))
        small = await pg.evaluate("() => [...document.querySelectorAll('button, a.go, .chip, .ghost')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 40).map(b => b.className + ':' + b.textContent.slice(0,20))")
        check('tap targets at least 40 px high', not small, str(small))
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'transport-340-dark.png'), full_page=True)
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
