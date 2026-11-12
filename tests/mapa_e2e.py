"""The map page (mapa/) in headless Chrome, with the Worker's answers from tests/fixtures/map.json (their times moved
to now) and without map tiles (the base map stays empty; what the page draws on it is checked through MapLibre).

  python3 tests/mapa_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Covers: the stops around the phone with walking minutes and the map's stop layer; asking for the place when it is not
known yet; a stop (title, the address in the URL, departures, the walk with minutes and its path on the map, «Маршрут
сюди», «У мої зупинки» into Транспорт's list); a departure's course (where the bus is, when it comes to my stop, the
stops as a line with the bus between them, the road in two colours and the bus marker); the phone's Back and
Telegram's Back step back through the sheet; search for an address and its nearest stops; a connection from «Маршрут»
drawn with its legs; the sheet dragged and tapped; the theme switch keeps what is drawn; without WebGL the lists still
work; links from Транспорт and Маршрут; 360 px. Exits 1 if a check fails.
"""
import asyncio, datetime, functools, http.server, json, os, re, sys, threading
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FX = json.load(open(os.path.join(ROOT, 'tests', 'fixtures', 'map.json')))
T0 = datetime.datetime.fromisoformat(FX['_at'].replace('Z', '+00:00'))
ISO = re.compile(r'"(20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z)"')
TG = """window.__back = null;
window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '', ready() {}, expand() {}, onEvent() {}, disableVerticalSwipes() { window.__noswipe = true; },
  setHeaderColor() {}, setBackgroundColor() {}, isVersionAtLeast() { return true; },
  CloudStorage: {getItem(k, cb) { cb(null, ''); }, setItem(k, v, cb) { (window.__cloud = window.__cloud || {})[k] = v; cb && cb(null, true); }},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}},
  BackButton: {shown: false, show() { this.shown = true; }, hide() { this.shown = false; }, onClick(f) { window.__back = f; }}}};"""
HERE = {'latitude': 51.6617, 'longitude': 6.4525}
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

def moved(obj):
    """the fixture with every time moved by as much as has passed since it was recorded"""
    shift = datetime.datetime.now(datetime.timezone.utc) - T0
    def fix(m):
        t = datetime.datetime.fromisoformat(m.group(1).replace('Z', '+00:00')) + shift
        return '"' + t.astimezone(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ') + '"'
    return ISO.sub(fix, json.dumps(obj, ensure_ascii=False))

class Worker:
    def __init__(self): self.calls = []
    async def __call__(self, route):
        u = urlparse(route.request.url); q = parse_qs(u.query); self.calls.append((u.path, q))
        key = {'/transit/area': 'area', '/transit/departures': 'deps', '/transit/course': 'course', '/transit/walk': 'walk', '/transit/stops': 'search', '/transit/trip': 'trip'}.get(u.path)
        if not key: return await route.fulfill(status=404, body='{"ok":false}', content_type='application/json')
        await route.fulfill(body=moved(FX[key]), content_type='application/json', headers={'Access-Control-Allow-Origin': '*'})

# no base map in tests: an empty TileJSON, empty tiles, no glyphs (the names are not drawn, nothing else changes)
TILEJSON = json.dumps({'tilejson': '3.0.0', 'tiles': ['https://tiles.openfreemap.org/planet/t/{z}/{x}/{y}.pbf'], 'minzoom': 0, 'maxzoom': 14, 'vector_layers': []})
async def tiles(route):
    u = route.request.url
    if u.rstrip('/').endswith('/planet'): return await route.fulfill(body=TILEJSON, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'})
    await route.fulfill(status=204, body='', headers={'Access-Control-Allow-Origin': '*'})

async def page(browser, url, geo=True, store=None, w=None):
    ctx = await browser.new_context(viewport={'width': 360, 'height': 760}, **({'geolocation': HERE, 'permissions': ['geolocation']} if geo else {}))
    w = w or Worker()
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG, content_type='text/javascript'))
    await ctx.route('**/*.workers.dev/**', w)
    await ctx.route('**/tiles.openfreemap.org/**', tiles)
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    if store: await ctx.add_init_script('(' + json.dumps(store) + ').forEach(([k, v]) => localStorage.setItem(k, v));')
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.goto(url)
    return ctx, pg, w

async def text(pg, s): return (await pg.text_content(s) or '').strip()
async def src(pg, sid): return await pg.evaluate(f"(() => {{ const m = window.__mapa.map(); const s = m && m.getSource('{sid}'); return s ? (s._data && s._data.features ? s._data.features.length : (s.serialize().data.features || []).length) : -1; }})()")
async def settle(pg, ms=700): await pg.wait_for_timeout(ms)

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None,
                                          args=['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'])

        # ---------------- stops around me ----------------
        ctx, pg, w = await page(browser, base + 'mapa/', store=[['mapa-loc', '1']])
        await pg.wait_for_function('window.__mapa && window.__mapa.me() && document.querySelectorAll("#nearlist .row").length > 0', timeout=15000)
        await settle(pg)
        gl = await pg.evaluate('!!window.__mapa.map()')
        print('(map drawn with WebGL)' if gl else '(no WebGL here: the map checks are skipped, the lists are checked)')
        near = await pg.evaluate("""[...document.querySelectorAll('#nearlist .row')].map(r => [r.querySelector('.t b').textContent, r.querySelector('.end b').textContent, parseInt(r.querySelector('.end small').textContent)])""")
        check('near: up to eight stops, nearest first, with walking minutes and metres', 4 <= len(near) <= 8 and all(n[1].startswith('≈ ') and n[1].endswith(' хв') for n in near)
              and all(near[i][2] <= near[i + 1][2] for i in range(len(near) - 1)) and near[0][0] == 'Dom', str(near))
        check('near: title and the place known', await text(pg, '#stitle') == 'Зупинки поруч' and 'Біля тебе' in await text(pg, '#ssub') and not await pg.is_visible('#askloc'))
        check('near: stops are asked by grid cells of the map', any(c[0] == '/transit/area' and re.fullmatch(r'\d+\.\d\d', c[1]['lat'][0]) for c in w.calls))
        check('Telegram: vertical swipes off (the map moves instead), no Back on the first view', await pg.evaluate('!!window.__noswipe') and not await pg.evaluate('Telegram.WebApp.BackButton.shown'))
        if gl:
            check('map: every stop of the area on the stop layer, the phone\'s place marked', await src(pg, 'stops') == len(FX['area']['stops']) and await pg.evaluate("!!document.querySelector('.me')"), await src(pg, 'stops'))
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'map-near.png'))

        # ---------------- a stop ----------------
        await pg.click('#nearlist .row'); await settle(pg, 1000)
        dom = next(s for s in FX['area']['stops'] if s['name'] == 'Dom')
        check('stop: its name, the address in the URL, Back shown, Telegram Back', await text(pg, '#stitle') == 'Xanten Dom' and f"?stop={dom['id']}" in pg.url.replace('%3A', ':')
              and await pg.is_visible('#sback') and await pg.evaluate('Telegram.WebApp.BackButton.shown'))
        deps = await pg.evaluate("[...document.querySelectorAll('#deps .dep')].map(b => [b.querySelector('.line').textContent, b.querySelector('.dest').textContent, b.disabled])")
        check('stop: departures with line and destination, each can show where it is', 3 <= len(deps) <= 12 and all(d[0] and d[1] and not d[2] for d in deps), str(deps[:4]))
        wb = await text(pg, '#walkbtn')
        check('stop: the walk from here, minutes and metres from the router', wb == f"{FX['walk']['min']} хв пішки · {FX['walk']['m'] // 10 * 10 if FX['walk']['m'] % 10 < 5 else (FX['walk']['m'] // 10 + 1) * 10} м", wb)
        wc = next(c for c in w.calls if c[0] == '/transit/walk')
        check('stop: the walk asks with five decimals, from me to the stop', wc[1]['from'][0] == '51.66170,6.45250' and wc[1]['to'][0] == f"{dom['coord'][0]},{dom['coord'][1]}", str(wc))
        if gl: check('map: the chosen stop marked, the walk drawn', await src(pg, 'sel') == 1 and await src(pg, 'walk') == 1)
        href = await pg.get_attribute('.acts a[href*="marshrut"]', 'href')
        check('stop: «Маршрут сюди» opens Маршрут with this stop as the end', href.startswith('../marshrut/?to=' + dom['id'].replace(':', '%3A')) and 'toName=Xanten%20Dom' in href, href)
        await pg.click('#addmine'); await settle(pg, 300)
        mine = await pg.evaluate("JSON.parse(localStorage.getItem('transport-stops'))")
        check('«У мої зупинки»: first in Транспорт\'s list and chosen there, also in Telegram', mine['list'][0] == {'id': dom['id'], 'name': 'Xanten, Dom'} and mine['active'] == dom['id']
              and len(mine['list']) == 2 and 'Dom' in await pg.evaluate("window.__cloud.transport || ''") and await pg.is_visible('.act.done'), json.dumps(mine))
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'map-stop.png'))

        # ---------------- where the bus is ----------------
        first = await pg.evaluate("[...document.querySelectorAll('#deps .dep')].findIndex(b => b.querySelector('.line').textContent === %s)" % json.dumps(FX['course']['line']))
        await pg.click(f'#deps li:nth-child({first + 1}) .dep'); await settle(pg, 1500)
        now = await text(pg, '#now')
        check('course: title with the line, direction', await text(pg, '#stitle') == f"Лінія {FX['course']['line']}" and FX['course']['dest'] in await text(pg, '#ssub'), await text(pg, '#stitle'))
        check('course: where it is and when it comes to my stop', ('Зараз' in now or 'Ще не виїхав' in now) and ('«Xanten Dom»' in now), now)
        rows = await pg.evaluate("({cs: document.querySelectorAll('#course .cs').length, mine: (document.querySelector('#course .cs.mine .nm') || {}).textContent, bus: !!document.querySelector('#busrow'), past: document.querySelectorAll('#course .cs.past').length})")
        check('course: every stop as a line, mine marked, the bus between them', rows['cs'] == len(FX['course']['stops']) and 'Xanten Dom' in rows['mine'] and rows['bus'], str(rows))
        cq = next(c for c in w.calls if c[0] == '/transit/course')
        check('course: asked with line, trip, my stop and its planned time in Xanten time', re.fullmatch(r'20\d\d-\d\d-\d\dT\d\d:\d\d', cq[1]['when'][0]) and cq[1]['stop'][0] == dom['id'] and cq[1]['line'][0] and cq[1]['trip'][0], str(cq))
        if gl: check('map: the road in two parts (driven, ahead), its stops, the bus marker', await src(pg, 'route') == 2 and await src(pg, 'routestops') == len(FX['course']['stops']) and await pg.evaluate("!!document.querySelector('.busmk')"))
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'map-course.png'))

        # ---------------- Back ----------------
        await pg.go_back(); await settle(pg, 600)
        check("phone's Back: from the course to the stop", await text(pg, '#stitle') == 'Xanten Dom' and await pg.evaluate("!document.querySelector('.busmk')") and len(await pg.query_selector_all('#deps .dep')) >= 3)
        await pg.evaluate('window.__back()'); await settle(pg, 600)
        check("Telegram's Back: to the stops around, Back hidden again", await text(pg, '#stitle') == 'Зупинки поруч' and not await pg.evaluate('Telegram.WebApp.BackButton.shown') and await pg.is_hidden('#sback'))

        # ---------------- search: an address ----------------
        await pg.click('#q'); await pg.fill('#q', 'Xanten Marsstraße 5'); await settle(pg, 900)
        check('search: the sheet opens high, the address found', await text(pg, '#stitle') == 'Пошук' and await pg.is_visible('[data-place]'))
        await pg.press('#q', 'Enter'); await settle(pg, 900)
        pl = await pg.evaluate("[...document.querySelectorAll('#sbody .rows .row')].map(r => r.querySelector('.end small').textContent)")
        check('address: its nearest stops, metres from the address, the walk from me', await text(pg, '#stitle') == 'Xanten, Marsstraße 5' and len(pl) >= 3 and all('від адреси' in x for x in pl) and 'хв пішки' in await text(pg, '#walkbtn'), str(pl))
        if gl: check('map: the address pinned', await pg.evaluate("!!document.querySelector('.pin')"))
        await ctx.close()

        # ---------------- the place not known yet ----------------
        ctx, pg, w = await page(browser, base + 'mapa/', geo=False)
        await pg.wait_for_function('document.querySelectorAll("#nearlist .row").length > 0', timeout=15000)
        check('no place yet: the sheet asks, the list is around the middle of the map', await pg.is_visible('#askloc') and await text(pg, '#ssub') == 'Біля середини мапи')
        await ctx.close()

        # ---------------- a connection from Маршрут ----------------
        t = FX['trip']['trips'][0]
        ctx, pg, w = await page(browser, base + f"mapa/?from=de:05170:36244&to=de:05170:36918&when=2026-11-12T15:50&dep={t['dep']}")
        await pg.wait_for_function('document.querySelectorAll(".leg").length > 0', timeout=15000); await settle(pg)
        tq = next(c for c in w.calls if c[0] == '/transit/trip')
        check('connection: asked with paths, its legs listed', tq[1].get('paths') == ['1'] and len(await pg.query_selector_all('.leg')) == len(t['legs']) and '→' in await text(pg, '#ssub'), str(tq))
        if gl: check('map: every leg drawn', await src(pg, 'route') == len([l for l in t['legs'] if len(l.get('path') or []) > 1]))

        # ---------------- the sheet ----------------
        h0 = await pg.evaluate("document.getElementById('sheet').getBoundingClientRect().height")
        g = await pg.query_selector('#grip'); box = await g.bounding_box()
        await pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + 8); await pg.mouse.down()
        for k in range(1, 9): await pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + 8 - k * 40)
        await pg.mouse.up(); await settle(pg, 500)
        h1 = await pg.evaluate("document.getElementById('sheet').getBoundingClientRect().height")
        check('sheet: dragged up it stays high', h1 > h0 + 150, f'{h0} → {h1}')
        await pg.click('#grip'); await settle(pg, 500)
        h2 = await pg.evaluate("document.getElementById('sheet').getBoundingClientRect().height")
        check('sheet: a tap on the handle brings it back to half', abs(h2 - h0) < 4, f'{h2} vs {h0}')
        check('sheet: nothing sticks out sideways at 360 px', await pg.evaluate("document.getElementById('sbody').scrollWidth <= document.getElementById('sbody').clientWidth && document.documentElement.scrollWidth <= 360"))

        # ---------------- theme ----------------
        if gl:
            before = await src(pg, 'route')
            await pg.click('#themebtn'); await settle(pg, 1200)
            check('theme: the map turns dark and keeps the connection', await pg.evaluate("window.__mapa.map().getStyle().name") == 'd-simya-dark' and await src(pg, 'route') == before)
        await ctx.close()

        # ---------------- links into the map ----------------
        ctx, pg, w = await page(browser, base + 'transport/')
        await settle(pg, 600)
        check('Транспорт: the chosen stop opens on the map', (await pg.get_attribute('#onmap', 'href')).startswith('../mapa/?stop=de%3A05170%3A37032'))
        await ctx.close()
        await browser.close()

        # ---------------- without WebGL ----------------
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox', '--disable-webgl', '--disable-3d-apis', '--disable-gpu'])
        ctx, pg, w = await page(browser, base + 'mapa/', store=[['mapa-loc', '1']])
        await pg.wait_for_function('document.querySelectorAll("#nearlist .row").length > 0', timeout=15000); await settle(pg)
        check('no WebGL: says so, the stops around still listed and open', await pg.is_visible('#mapfail') and not await pg.evaluate('!!window.__mapa.map()'))
        await pg.click('#nearlist .row'); await settle(pg, 900)
        check('no WebGL: a stop with its departures', len(await pg.query_selector_all('#deps .dep')) >= 3)
        await ctx.close()
        await browser.close()

    print(f'\n{len(fails)} failed' if fails else '\nall passed')
    for f in fails: print('  -', f)
    sys.exit(1 if fails else 0)

asyncio.run(main())
