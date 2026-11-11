"""End-to-end check of /smittia/ (waste collection) in headless Chrome, with the clock frozen.

  python3 tests/smittia_e2e.py          (CHROME=/path/to/chrome to use a system browser)

Covers: the first visit asks where you live; picking a place; the street search (a village street, a street
in the Xanten–Beek–Lüttingen area decided by distance, a border street, an unknown street, search down), each
with the right district and the hint how to check it; bins and grey-bin rhythm; the schedule for district 1
and 2; the choice kept on the device and taken from Telegram's cloud on a new device; the Biotonne guide;
the hazardous-waste date; reminders with the district sent along and updated when it changes; the switch
outside Telegram; and no sideways scrolling. Exits 1 if a check fails.
"""
import asyncio, datetime, functools, http.server, json, os, sys, threading, urllib.parse
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TG = """window.__cloud = %s;
window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '%s',
  ready() {}, expand() {}, onEvent() {}, setHeaderColor() {}, setBackgroundColor() {}, isVersionAtLeast() { return true; },
  CloudStorage: {getItem(k, cb) { setTimeout(() => cb(null, window.__cloud[k] || ''), 20); }, setItem(k, v) { window.__cloud[k] = v; }},
  HapticFeedback: {notificationOccurred() {}, selectionChanged() {}, impactOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};"""
NOW = datetime.datetime(2026, 11, 9, 19, 30, tzinfo=datetime.timezone(datetime.timedelta(hours=1)))   # Monday evening in Xanten
CENTRE = {'Xanten': (51.66152, 6.45432), 'Lüttingen': (51.67285, 6.46147)}
LUETT = {'suburb': 'Beek', 'village': 'Lüttingen', 'town': 'Xanten'}   # how OSM labels the whole Xanten–Beek–Lüttingen area
SEARCH = {   # street → Nominatim answer
    'Kalkarer Straße': [{'lat': '51.6990', 'lon': '6.3710', 'address': {'road': 'Kalkarer Straße', 'village': 'Marienbaum', 'town': 'Xanten'}}],
    'Lindenweg': [{'lat': str(CENTRE['Lüttingen'][0] + 0.0005), 'lon': str(CENTRE['Lüttingen'][1]), 'address': {'road': 'Lindenweg', **LUETT}}],
    'Kurfürstenstraße': [{'lat': str(CENTRE['Xanten'][0] + 0.0008), 'lon': str(CENTRE['Xanten'][1]), 'address': {'road': 'Kurfürstenstraße', **LUETT}}],
    'Grenzweg': [{'lat': '51.6655', 'lon': '6.4570', 'address': {'road': 'Grenzweg', **LUETT}}, {'lat': '51.6720', 'lon': '6.4610', 'address': {'road': 'Grenzweg', **LUETT}}],
    'Rheinberger Straße': [{'lat': '51.5', 'lon': '6.6', 'address': {'road': 'Rheinberger Straße', 'town': 'Rheinberg'}}],
}
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail else ''))
    if not ok: fails.append(name)

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/smittia/'

searches = []
async def nominatim(route):
    q = urllib.parse.parse_qs(urllib.parse.urlparse(route.request.url).query)
    street = q.get('street', [''])[0]; searches.append(street)
    if street == 'down': return await route.fulfill(status=503, body='')
    await route.fulfill(json=SEARCH.get(street, []), headers={'Access-Control-Allow-Origin': '*'})

async def page(browser, url, tg_script='', worker=None, width=390):
    ctx = await browser.new_context(viewport={'width': width, 'height': 844})
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg_script, content_type='text/javascript'))
    await ctx.route('https://nominatim.openstreetmap.org/**', nominatim)
    await ctx.route('**/*.workers.dev/**', worker or (lambda r: r.abort()))
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.set_fixed_time(NOW)
    await pg.goto(url); await pg.wait_for_function("document.querySelector('#places .chip') || !document.getElementById('where-sum').hidden", timeout=10000)
    return ctx, pg

async def search(pg, street):
    await pg.fill('#street', street); await pg.click('#find')
    await pg.wait_for_function("document.getElementById('find').textContent === 'Знайти' && document.querySelector('#found .found')", timeout=5000)
    return ' '.join((await pg.text_content('#found')).split())

async def chosen(pg):
    return await pg.evaluate("(() => { const c = document.querySelector('#places [aria-checked=\"true\"]'); return c ? c.dataset.place + ' ' + c.dataset.district : ''; })()")

async def main():
    url = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        ctx, pg = await page(browser, url)
        check('first visit: asks where you live, no schedule yet', await pg.is_visible('#where-form') and await pg.is_visible('#where-intro') and await pg.is_hidden('#next') and await pg.is_hidden('#days-sec') and await pg.is_disabled('#where-save'))
        f = await search(pg, 'Kalkarer Straße')
        check('village street: Marienbaum, district 2, chosen at once', 'Marienbaum, район 2' in f and 'Як перевірити' not in f and await chosen(pg) == 'Marienbaum 2', f)
        f = await search(pg, 'Lindenweg')
        check('street by Lüttingen centre: probably district 2, says how to check, offers district 1', 'найімовірніше це район 2' in f and 'Як перевірити' in f and 'Район 1' in f and await chosen(pg) == 'Lüttingen 2', f)
        f = await search(pg, 'Kurfürstenstraße')
        check('street in the town centre: probably district 1 (Xanten)', 'центру Ксантена' in f and 'район 1' in f and await chosen(pg) == 'Xanten 1', f)
        f = await search(pg, 'Grenzweg')
        check('street across the border: both districts offered, nothing chosen for you', 'на межі районів' in f and ('у пʼятницю' in f or 'у четвер' in f or 'у вівторок' in f) and 'Район 1' in f and 'Район 2' in f and 'Як перевірити' in f and await chosen(pg) == 'Xanten 1', f)
        await pg.click('#found [data-pick="2"]')
        check('picking district 2 from the result', await chosen(pg) == 'Lüttingen 2')
        f = await search(pg, 'Rheinberger Straße')
        check('a street outside Xanten is not taken', 'Не знайшов' in f, f)
        f = await search(pg, 'down')
        check('search down: says so, the place list still works', 'не відповідає' in f, f)
        await pg.click('#binsel [data-bin="bio"]')
        await pg.click('#where-save')
        await pg.wait_for_function("!document.getElementById('next').hidden")
        nxt = ' '.join((await pg.text_content('#next')).split())
        check('district 2 without a Biotonne: next pickup Thursday, yellow bin', 'Четвер' in nxt and '12 листопада' in nxt and 'Жовтий бак' in nxt and 'Сірий' not in nxt, nxt)
        days = ' '.join((await pg.text_content('#days')).split())
        check('coming pickups in order, no brown bin', days.index('17 листопада') < days.index('20 листопада') < days.index('26 листопада') and 'лише двотижневі' in days and 'Коричневий' not in days, days[:160])
        check('hint how to find out the grey bin rhythm', '17 листопада забирають лише' in await pg.text_content('#rhythm') and await pg.is_visible('#rhythm'))
        check('summary: the street, district 2 and the bins', await pg.text_content('#h-where') == 'Grenzweg' and 'Район 2: Lüttingen' in await pg.text_content('#where-note') and 'коричневий' not in await pg.text_content('#where-note'))
        check('eyebrow and footer name district 2', await pg.text_content('#eyebrow') == 'Xanten · район 2' and 'район 2: Lüttingen' in await pg.text_content('#foot'))
        check('no Biotonne: food scraps go to the grey bin', await pg.evaluate("!document.getElementById('rest-food').hidden && document.getElementById('bio-guide').hidden"))
        check('hazardous waste: next Schadstoffmobil date', '21 листопада' in await pg.text_content('#schadstoff'))
        check('outside Telegram: switch off and explained', await pg.is_disabled('#sw') and 'через бота в Telegram' in await pg.text_content('#sw-state'))
        check('no horizontal scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= 390)
        await pg.reload(); await pg.wait_for_function("!document.getElementById('next').hidden")
        check('kept after reload: summary shown, form closed', await pg.is_hidden('#where-form') and await pg.text_content('#h-where') == 'Grenzweg')

        # change to district 1 (Beek) with a Biotonne, grey bin every 2 weeks
        await pg.click('#where-edit')
        check('"Змінити" opens the form with the current choice', await pg.is_visible('#where-form') and await chosen(pg) == 'Lüttingen 2' and await pg.text_content('#where-edit') == 'Скасувати')
        await pg.click('#places [data-place="Beek"]'); await pg.click('#binsel [data-bin="bio"]'); await pg.click('[data-rhythm="14"]')
        await pg.click('#where-save'); await pg.wait_for_timeout(200)
        nxt1 = ' '.join((await pg.text_content('#next')).split()); days1 = ' '.join((await pg.text_content('#days')).split())
        check('district 1: other dates (blue bin on 17.11), brown bin listed, no rhythm hint', await pg.text_content('#eyebrow') == 'Xanten · район 1' and 'Синій бак 17 листопада' not in days1 and 'Коричневий' in nxt1 + days1 and await pg.is_hidden('#rhythm'), (nxt1 + ' | ' + days1)[:200])
        check('with a Biotonne: its guide shows, scraps no longer in grey', await pg.evaluate("document.getElementById('rest-food').hidden && !document.getElementById('bio-guide').hidden"))
        await ctx.close()

        # Telegram: reminders carry the district; changing it updates them; another device takes the choice from the cloud
        calls, state = [], {'on': False, 'fail': False, 'blocked': False}
        async def worker(route):
            body = route.request.post_data or ''
            get = lambda k: (body.split(f'name="{k}"\r\n\r\n', 1)[1].split('\r\n', 1)[0] if f'name="{k}"' in body else None)
            action = get('action'); calls.append({k: get(k) for k in ('action', 'district', 'bins', 'rhythm')} | {'signed': 'query_id=AAH' in body})
            hdr = {'Access-Control-Allow-Origin': '*'}
            if state['fail'] and action in ('on', 'off'): return await route.fulfill(status=500, headers=hdr, json={'ok': False})
            if state['blocked'] and action == 'on': return await route.fulfill(headers=hdr, json={'ok': False, 'on': False, 'error': 'bot_blocked'})
            if action in ('on', 'off'): state['on'] = action == 'on'
            await route.fulfill(headers=hdr, json={'ok': True, 'on': state['on'], 'confirmed': True})
        saved = {'district': '2', 'place': 'Lüttingen', 'street': '', 'bins': ['rest', 'papier', 'gelb'], 'rhythm': 'unknown'}
        ctx, pg = await page(browser, url, TG % (json.dumps({'smittia': json.dumps(saved)}), 'query_id=AAH&hash=00'), worker)
        await pg.wait_for_function("!document.getElementById('sw').disabled", timeout=10000)
        check('new device: the choice comes from Telegram cloud, schedule shown at once', await pg.is_hidden('#where-form') and await pg.text_content('#h-where') == 'Lüttingen' and await pg.is_visible('#next'))
        check('telegram: status asked with signed data', calls and calls[0]['action'] == 'status' and calls[0]['signed'], str(calls[:1]))
        await pg.click('#sw')
        await pg.wait_for_function("document.getElementById('sw').getAttribute('aria-checked') === 'true' && !document.getElementById('sw').disabled", timeout=10000)
        check('switching on sends district, bins and rhythm, never the street', calls[-1] == {'action': 'on', 'district': '2', 'bins': 'rest,papier,gelb', 'rhythm': 'unknown', 'signed': True} and 'надіслав підтвердження' in await pg.text_content('#sw-state'), str(calls[-1]))
        await pg.click('#where-edit'); await pg.click('#places [data-place="Birten"]'); await pg.click('#where-save'); await pg.wait_for_timeout(300)
        check('changing the district while on: the bot is told quietly', calls[-1]['action'] == 'prefs' and calls[-1]['district'] == '1', str(calls[-1]))
        check('the cloud copy follows', json.loads(await pg.evaluate("window.__cloud.smittia"))['place'] == 'Birten')
        await pg.click('#sw')
        await pg.wait_for_function("document.getElementById('sw').getAttribute('aria-checked') === 'false' && !document.getElementById('sw').disabled", timeout=10000)
        check('telegram: switching off', not state['on'] and 'Вимкнено' in await pg.text_content('#sw-state'))
        state['fail'] = True
        await pg.click('#sw')
        await pg.wait_for_function("(document.getElementById('sw-state').textContent || '').includes('Не вдалося')", timeout=10000)
        check('telegram: Worker error keeps the switch as it was', await pg.get_attribute('#sw', 'aria-checked') == 'false')
        state['fail'] = False; state['blocked'] = True
        await pg.click('#sw')
        await pg.wait_for_function("(document.getElementById('sw-state').textContent || '').includes('Бот не може')", timeout=10000)
        check('telegram: bot may not write yet, says to press Start', await pg.get_attribute('#sw', 'aria-checked') == 'false' and 'Start' in await pg.text_content('#sw-state'))
        check('one search request per search, none typed ahead', all(s for s in searches) and len(searches) == 6, str(searches))
        await ctx.close()
        await browser.close()

asyncio.run(main())
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
