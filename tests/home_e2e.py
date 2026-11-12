"""The home screen (site root) in headless Chrome, with the clock frozen and the Worker answers from tests/fixtures.

  python3 tests/home_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Covers: greeting by Xanten time, today's date; weather for the household's place; the next waste pickup (tomorrow:
highlighted, "put the bins out tonight"; later: weekday and date; no district yet: asks to choose); three departures
from the chosen stop with live marks; this week's flyers with seen count and holidays; the D-Ticket tile per platform
(through Telegram openLink); every card and tile leads to its section; instructions and the bot last; 340 px and dark theme.
Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, sys, threading, datetime, urllib.parse
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FX = lambda n: json.load(open(os.path.join(ROOT, 'tests', 'fixtures', n)))
DEP, WX = FX('departures.json'), FX('weather.json')
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

def tg_js(platform):
    return """window.Telegram = {WebApp: {platform: '%s', colorScheme: 'light', initData: 'user=%%7B%%22id%%22%%3A1%%7D&hash=x', initDataUnsafe: {user: {id: 1, first_name: 'Стас'}}, ready() {}, expand() {}, onEvent() {},
  isVersionAtLeast() { return true; }, setHeaderColor() {}, setBackgroundColor() {}, openLink(u) { (window.__opened = window.__opened || []).push(u); },
  CloudStorage: {getItem(k, cb) { setTimeout(() => cb(null, ''), 20); }, setItem() {}},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};""" % platform

class Worker:
    def __init__(self, warnings=None):
        self.calls, self.warnings = [], warnings or []
    async def __call__(self, route):
        u = urllib.parse.urlparse(route.request.url); q = urllib.parse.parse_qs(u.query)
        self.calls.append((u.path, q))
        if u.path == '/weather': return await route.fulfill(json=WX)
        if u.path == '/warnings': return await route.fulfill(json={'ok': True, 'place': 'Xanten', 'warnings': self.warnings})
        if u.path == '/list': return await route.fulfill(json={'ok': True, 'v': 3, 'members': ['Стас', 'Наталія'], 'items': [
            {'id': 'a', 't': 'Milch', 's': 'Lidl', 'd': 0}, {'id': 'b', 't': 'Brot', 's': '', 'd': 0}, {'id': 'c', 't': 'Eier', 's': 'ALDI', 'd': 1}]})
        if u.path == '/transit/departures':
            d = dict(DEP); d['stop'] = {'id': q['stop'][0], 'name': 'Xanten, Bahnhof'}
            return await route.fulfill(json=d)
        await route.fulfill(status=404, json={'ok': False})

async def page(browser, url, when=DEP['at'], store=None, tg='', width=390, scheme='light', worker=None):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg, content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    w = worker or Worker(); await ctx.route('**/*.workers.dev/**', w)
    if store:
        sets = ''.join(f"localStorage.setItem({json.dumps(k)}, {json.dumps(json.dumps(v))});" for k, v in store.items())
        await ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ {sets} sessionStorage.setItem('seeded', '1'); }}")
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.install(time=when)
    await pg.goto(url)
    await pg.wait_for_selector('#dep-body .deps, #dep-body .sub', timeout=8000)
    await pg.wait_for_selector('#waste-body .big', timeout=8000)
    await pg.wait_for_timeout(250)
    return ctx, pg, w

TEXT = "s => document.querySelector(s).textContent.replace(/\\s+/g, ' ').trim()"

async def main():
    url = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        # a household in Lüttingen (district 2) that picked a stop and saw two flyers; Wednesday 11.11.2026, 14:26
        ctx, pg, w = await page(browser, url, store={
            'smittia-prefs': {'district': '2', 'place': 'Lüttingen', 'bins': ['rest', 'papier', 'gelb'], 'rhythm': 'unknown'},
            'transport-stops': {'list': [{'id': 'de:05170:37032', 'name': 'Xanten, Bahnhof'}], 'active': 'de:05170:37032'},
            'prospekty-seen': {'week': '2026-11-09', 'urls': ['https://www.lidl.de/x', 'https://www.penny.de/angebote']}})
        check('greeting by Xanten time (14:26): Добрий день', await pg.evaluate(TEXT, '#hello') == 'Добрий день')
        check('today: середа, 11 листопада', await pg.evaluate(TEXT, '#today') == 'середа, 11 листопада · Xanten', await pg.evaluate(TEXT, '#today'))
        await pg.wait_for_selector('#wx-body .wx')
        wx = await pg.evaluate(TEXT, '#c-wx')
        check('weather: household place, 5°, words, advice', 'Погода · Lüttingen' in wx and '5°' in wx and 'Хмарно' in wx and 'Можливий дощ' in wx, wx)
        check('weather asked for Lüttingen, rounded', ('/weather', {'lat': ['51.67'], 'lon': ['6.46']}) in w.calls, str(w.calls))
        waste = await pg.evaluate(TEXT, '#c-waste')
        check('waste: tomorrow, 12 листопада, yellow bin, "виставити баки"', 'Завтра, 12 листопада' in waste and 'Сьогодні ввечері виставити баки' in waste and 'Жовтий' in waste, waste)
        check('waste: tomorrow is highlighted', 'soon' in await pg.get_attribute('#c-waste', 'class'))
        deps = await pg.evaluate("() => [...document.querySelectorAll('#dep-body li')].map(li => li.textContent.replace(/\\s+/g, ' ').trim())")
        check('departures: three, minutes first', len(deps) == 3 and deps[0].startswith('1 хв') and 'BSO' in deps[0], str(deps))
        check('departures: delay shown (+3)', any('+3' in d for d in deps), str(deps))
        check('departures: stop name and "наживо" in the card head', 'Транспорт · Xanten Bahnhof' in await pg.evaluate(TEXT, '#dep-lab') and await pg.is_visible('#dep-live'))
        fly = await pg.evaluate(TEXT, '#c-fly')
        check('flyers: KW 46, until Saturday 14 November, 2 seen', 'KW 46' in fly and 'Акції до суботи, 14 листопада' in fly and 'Переглянуто 2 проспекти' in fly, fly)
        links = await pg.evaluate("() => [...document.querySelectorAll('main a')].map(a => a.getAttribute('href'))")
        check('cards and tiles lead to every section; help, then instructions, the bot last', links[:5] == ['pogoda/', 'smittia/', 'transport/', 'prospekty/', 'spysok/'] and links[6:] == ['scan/', 'ekstreno/', 'rozmovnyk/', 'a1/', 'pralka/', 'sushka/', 'bot/'], str(links))
        check('D-Ticket on a computer: Google Play in a new tab', links[5].startswith('https://play.google.com/store/apps/details?id=mentz.com.vrr_cibo_app') and await pg.get_attribute('#t-dticket', 'target') == '_blank')
        check('shopping list outside Telegram: says it works through the bot', 'через бота' in await pg.evaluate(TEXT, '#c-list'))
        check('no DWD warning: no warning line', await pg.locator('.dwd').count() == 0)
        groups = await pg.evaluate("[...document.querySelectorAll('main .group')].map(g => g.textContent)")
        check('"Навчання" above the course tile, "Інструкції" above the appliance tiles', groups == ['Навчання', 'Інструкції', 'Telegram'], str(groups))
        check('course tile without progress: what it holds', await pg.text_content('#a1-sub') == 'Граматика, словник з озвученням, вправи')
        check('fits 390 px', await pg.evaluate('document.documentElement.scrollWidth') <= 390)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'home-390.png'), full_page=True)

        # minutes count down, data refreshes every 30 s
        n0 = sum(1 for c in w.calls if c[0] == '/transit/departures')
        await pg.clock.run_for(31000); await pg.wait_for_timeout(200)
        check('departures refresh every 30 s', sum(1 for c in w.calls if c[0] == '/transit/departures') == n0 + 1)
        await pg.click('#c-waste'); await pg.wait_for_url('**/smittia/')
        check('tapping the waste card opens Сміття', (await pg.text_content('h1')) == 'Сміття')
        await ctx.close()

        # no district yet, a later day, at night
        ctx, pg, w = await page(browser, url, when='2026-11-13T22:30:00Z')
        check('night greeting at 23:30', await pg.evaluate(TEXT, '#hello') == 'Доброї ночі')
        check('no district: asks to choose', 'Вибери свій район' in await pg.evaluate(TEXT, '#c-waste'))
        check('no stop chosen: Xanten Bahnhof', 'Xanten Bahnhof' in await pg.evaluate(TEXT, '#dep-lab'))
        check('weather for Xanten when no place is chosen', ('/weather', {'lat': ['51.66'], 'lon': ['6.45']}) in w.calls)
        fly = await pg.evaluate(TEXT, '#c-fly')
        check('flyers: nothing seen yet', 'Цього тижня ще нічого не переглянуто' in fly, fly)
        await ctx.close()

        ctx, pg, w = await page(browser, url, when='2026-11-13T09:00:00Z', store={'smittia-prefs': {'district': '2', 'place': 'Wardt', 'bins': ['rest', 'papier', 'gelb'], 'rhythm': 'unknown'}})
        waste = await pg.evaluate(TEXT, '#c-waste')
        check('waste later: "У вівторок", 17 листопада, grey (2 тижні), not highlighted', 'У вівторок' in waste and '17 листопада' in waste and 'Сірий (2 тижні)' in waste and 'soon' not in await pg.get_attribute('#c-waste', 'class'), waste)
        check('morning greeting at 10:00', await pg.evaluate(TEXT, '#hello') == 'Доброго ранку')
        await ctx.close()

        # Christmas week: closed days on the flyers card
        ctx, pg, w = await page(browser, url, when='2026-12-21T09:00:00Z')
        fly = await pg.evaluate(TEXT, '#c-fly')
        check('flyers: Christmas closures listed', 'Різдво' in fly or 'Святвечір' in fly or 'зачинені' in fly, fly)
        await ctx.close()

        # iPhone in Telegram: App Store through openLink; the shared list and an official warning on the cards
        ctx, pg, w = await page(browser, url, tg=tg_js('ios'), worker=Worker(warnings=[{'level': 2, 'uk': 'ожеледь', 'onset': '2026-11-11T18:00:00Z', 'expires': '2026-11-12T08:00:00Z'},
                                                                                     {'level': 1, 'uk': 'мороз', 'onset': None, 'expires': '2026-11-11T20:00:00Z'}]))
        await pg.wait_for_selector('#list-body .big'); await pg.wait_for_selector('.dwd')
        lst = await pg.evaluate(TEXT, '#c-list')
        check('shopping list in Telegram: what is left to buy, names and shops', '2 речі купити' in lst and 'Milch, Brot' in lst and 'Lidl' in lst and 'Eier' not in lst, lst)
        dwd = await pg.evaluate(TEXT, '.dwd')
        check('weather card: the strongest DWD warning with its level and time, and how many more', 'DWD: ожеледь' in dwd and 'рівень 2 з 4' in dwd and 'з ср, 11.11, 19:00' in dwd and 'ще 1' in dwd and 'lv2' in await pg.get_attribute('.dwd', 'class'), dwd)
        check('the list was cached for the next visit', 'Milch' in (await pg.evaluate("localStorage.getItem('spysok-cache')") or ''))
        check('iPhone: App Store link', (await pg.get_attribute('#t-dticket', 'href')).startswith('https://apps.apple.com/de/app/'))
        await pg.click('#t-dticket')
        opened = await pg.evaluate('window.__opened')
        check('D-Ticket opens through Telegram, the home screen stays', opened and opened[-1].startswith('https://apps.apple.com/') and pg.url == url, str(opened))
        await ctx.close()

        ctx, pg, w = await page(browser, url, width=340, scheme='dark', store={'smittia-prefs': {'district': '2', 'place': 'Obermörmter', 'bins': ['rest', 'papier', 'gelb', 'bio'], 'rhythm': '14'}})
        check('340 px, long place name: no sideways scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= 340, await pg.evaluate('document.documentElement.scrollWidth'))
        small = await pg.evaluate("() => [...document.querySelectorAll('a, button')].filter(b => b.offsetParent && b.getBoundingClientRect().height < 44).map(b => b.className + ':' + b.textContent.trim().slice(0, 20))")
        check('tap targets at least 44 px', not small, str(small))
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'home-340-dark.png'), full_page=True)
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
