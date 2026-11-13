"""The map page (mapa/) in headless Chrome, with the Worker's answers from tests/fixtures/map.json (their times moved
to now) and without map tiles (the base map stays empty; what the page draws on it is checked through MapLibre).

  python3 tests/mapa_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Covers: the stops around the phone with walking minutes and the map's stop layer; asking for the place when it is not
known yet; a stop (title, the address in the URL, departures, the walk with minutes and its path on the map, «Маршрут
сюди», «У мої зупинки» into Транспорт's list); a departure's course (where the bus is, when it comes to my stop, the
stops as a line with the bus between them, the road in two colours and the bus marker, arrows along it, where to wait
for it and for the way back; the way back in its own colour only when it takes other streets); the phone's Back and
Telegram's Back step back through the sheet; search for an address and its nearest stops; a connection from «Маршрут»
drawn with its legs; the sheet dragged and tapped; the theme switch keeps what is drawn; a line number from Транспорт:
this very bus, which of its stops to walk to and whether there is time, the button back after the whole road, the bus
gliding; my places (add with the pin, the chip and the sign, its nearest stops, remove); the town map saved for
offline; without WebGL the lists still work; links from Транспорт and Маршрут; 360 px. Exits 1 if a check fails.
"""
import asyncio, datetime, functools, http.server, json, os, re, sys, threading
from urllib.parse import urlparse, parse_qs, urlencode
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
    """the Worker's answers; twin=False: the stop has no departure of the line the other way (the way back then comes
    from the line's roads)"""
    def __init__(self, twin=True): self.calls = []; self.twin = twin
    async def __call__(self, route):
        u = urlparse(route.request.url); q = parse_qs(u.query); self.calls.append((u.path, q))
        key = {'/transit/area': 'area', '/transit/departures': 'deps', '/transit/course': 'course', '/transit/line': 'line', '/transit/walk': 'walk', '/transit/stops': 'search', '/transit/trip': 'trip'}.get(u.path)
        if not key: return await route.fulfill(status=404, body='{"ok":false}', content_type='application/json')
        data = FX[key]
        if key == 'course' and q.get('line', [''])[0] != FX['course_ref']: data = FX['course_back']
        if key == 'deps' and not self.twin:
            data = {**data, 'deps': [x for x in data['deps'] if not (x.get('ref') and x['line'] == FX['course']['line'] and x['ref']['line'] != FX['course_ref'])]}
        await route.fulfill(body=moved(data), content_type='application/json', headers={'Access-Control-Allow-Origin': '*'})

# no base map in tests: an empty TileJSON, empty tiles, no glyphs (the names are not drawn, nothing else changes)
TILEJSON = json.dumps({'tilejson': '3.0.0', 'tiles': ['https://tiles.openfreemap.org/planet/t/{z}/{x}/{y}.pbf'], 'minzoom': 0, 'maxzoom': 14, 'vector_layers': []})
async def tiles(route):
    u = route.request.url.split('?')[0]
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
        PICK = "[...document.querySelectorAll('#deps .dep')].findIndex(b => b.querySelector('.line').textContent === %s && b.querySelector('.dest').textContent === %s)" % (json.dumps(FX['course']['line']), json.dumps(FX['course']['dest']))
        first = await pg.evaluate(PICK)
        await pg.click(f'#deps li:nth-child({first + 1}) .dep'); await settle(pg, 1500)
        now = await text(pg, '#now')
        check('course: title with the line, direction', await text(pg, '#stitle') == f"Лінія {FX['course']['line']}" and FX['course']['dest'] in await text(pg, '#ssub'), await text(pg, '#stitle'))
        check('course: where it is and when it comes to my stop', ('Зараз' in now or 'Ще не виїхав' in now) and ('«Xanten Dom»' in now), now)
        rows = await pg.evaluate("({cs: document.querySelectorAll('#course .cs').length, mine: (document.querySelector('#course .cs.mine .nm') || {}).textContent, bus: !!document.querySelector('#busrow'), past: document.querySelectorAll('#course .cs.past').length})")
        check('course: every stop as a line, mine marked, the bus between them', rows['cs'] == len(FX['course']['stops']) and 'Xanten Dom' in rows['mine'] and rows['bus'], str(rows))
        cq = next(c for c in w.calls if c[0] == '/transit/course')
        check('course: asked with line, trip, my stop and its planned time in Xanten time', re.fullmatch(r'20\d\d-\d\d-\d\dT\d\d:\d\d', cq[1]['when'][0]) and cq[1]['stop'][0] == dom['id'] and cq[1]['line'][0] and cq[1]['trip'][0], str(cq))
        if gl: check('map: the road in two parts (driven, ahead), its stops, the bus marker', await src(pg, 'route') == 2 and await src(pg, 'routestops') == len(FX['course']['stops']) and await pg.evaluate("!!document.querySelector('.busmk')"))
        await pg.wait_for_selector('#legend:not([hidden])', timeout=8000)
        mine_plat = next(x['plat'] for x in FX['course']['stops'] if x['id'] == dom['id'])
        back_plat = next(x['plat'] for x in FX['course_back']['stops'] if x['id'] == dom['id'])
        lg = await text(pg, '#legend'); sn = await text(pg, '#standnote')
        check('way back by this stop\'s departure the other way: the same streets, one colour, said so', 'тими самими вулицями' in lg and any(c[0] == '/transit/course' and c[1]['line'][0] != FX['course_ref'] for c in w.calls), lg)
        check('where to wait: the platform for this way and for the way back', f'стоянка {mine_plat}' in sn and f'стоянка {back_plat}' in sn and 'Назад' in sn, sn)
        if gl:
            marks = await pg.evaluate("[...document.querySelectorAll('.stand')].map(m => [m.textContent, !!m.querySelector('.dir'), m.className])")
            check('map: «Стій тут» and «Назад» marks with arrows, growing away from each other; the same streets: no second colour',
                  [m[0] for m in marks] == [f'Стій тут · {mine_plat}', f'Назад · {back_plat}'] and all(m[1] for m in marks) and marks[0][2] != marks[1][2] and await src(pg, 'back') == 0, str(marks))
            check('map: arrows along the road say which way it goes', await pg.evaluate("!!window.__mapa.map().getLayer('route-arrows') && window.__mapa.map().hasImage('arrow')"))
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

        # ---------------- the way back along other streets ----------------
        ctx, pg, w = await page(browser, base + f"mapa/?stop={dom['id']}", w=Worker(twin=False), store=[['mapa-loc', '1']])
        await pg.wait_for_function('document.querySelectorAll("#deps .dep").length > 0', timeout=15000)
        first = await pg.evaluate(PICK)
        await pg.click(f'#deps li:nth-child({first + 1}) .dep')
        await pg.wait_for_selector('#legend:not([hidden])', timeout=8000); await settle(pg)
        lg = await text(pg, '#legend')
        lq = [c for c in w.calls if c[0] == '/transit/line']
        check('no departure the other way here: the line\'s roads that way are asked for (the other direction letter)', lq and lq[0][1]['line'][0].split(':')[3] != FX['course_ref'].split(':')[3]
              and lq[0][1]['line'][0].split(':')[:3] == FX['course_ref'].split(':')[:3], str(lq))
        check('the way back takes other streets near here: two colours, both named', 'туди: цей рейс' in lg and 'назад' in lg and 'іншими вулицями' in lg, lg)
        if gl: check('map: the way back drawn in its own colour, one «Стій тут» mark', await src(pg, 'back') > 0 and await pg.evaluate("document.querySelectorAll('.stand').length") == 1)
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'map-back.png'))
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
        if gl:
            check('map: every leg drawn', await src(pg, 'route') == len([l for l in t['legs'] if len(l.get('path') or []) > 1]))
            rides = [l for l in t['legs'] if not l['walk'] and l.get('on')]
            marks = await pg.evaluate("[...document.querySelectorAll('.stand')].map(m => m.textContent)")
            check('map: where to get on each bus, then where to change', len(marks) == len(rides) and marks[0].startswith('Сідай: ' + rides[0]['line']) and all(m.startswith('Пересадка: ') for m in marks[1:]), str(marks))

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

        # ---------------- a line number from «Транспорт»: this very bus, where I am, which of its stops to walk to ----------------
        x = next(d for d in FX['deps']['deps'] if d.get('ref') and d['ref']['line'] == FX['course_ref'])
        now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        link = base + 'mapa/?' + urlencode({'line': x['ref']['line'], 'trip': x['ref']['trip'], 'at': FX['deps']['stop']['id'], 'plan': now, 'ln': x['line'], 'dest': x['dest'], 'mode': 'bus', 'sn': 'Xanten, Dom'})
        ctx, pg, w = await page(browser, link, store=[['mapa-loc', '1']])
        await pg.wait_for_function("document.querySelector('#catch .catch') && document.querySelectorAll('#course .cs').length > 0", timeout=15000)
        await pg.wait_for_function("document.querySelector('#catch p') && !/Показати, де я/.test(document.querySelector('#catch').textContent)", timeout=15000); await settle(pg, 900)
        st = await pg.evaluate("({title: document.querySelector('#stitle').textContent, sub: document.querySelector('#ssub').textContent, catch: document.querySelector('#catch').textContent, back: !!document.querySelector('#sback:not([hidden])')})")
        cq = next(c for c in w.calls if c[0] == '/transit/course')
        check('line from a link: this very bus is asked for (line, trip, the stop, the time) and shown', cq[1]['line'] == [x['ref']['line']] and cq[1]['trip'] == [x['ref']['trip']] and cq[1]['stop'] == [FX['deps']['stop']['id']]
              and st['title'] == 'Лінія SL42' and 'Xanten Bahnhof' in st['sub'] and st['back'], str(st))
        check('«Хочу на цей автобус»: the nearest of its stops ahead, minutes on foot, when it is there, whether there is time', 'Хочу на цей автобус' in st['catch'] and 'хв пішки' in st['catch'] and re.search(r'о \d\d:\d\d', st['catch'])
              and ('Встигаєш' in st['catch'] or 'Встигнеш на' in st['catch'] or 'не встигнеш' in st['catch']), st['catch'])
        wq = [c for c in w.calls if c[0] == '/transit/walk']
        check('… the walk there from the walking router, from where I am', wq and wq[-1][1]['from'][0].startswith('51.6617'), str(wq[-1:] if wq else 'none'))
        if gl:
            check('map: the walk drawn, the bus on its road', await src(pg, 'walk') == 1 and await src(pg, 'route') >= 1 and await pg.evaluate("!!document.querySelector('.busmk')"))
            r0 = await pg.evaluate("document.querySelector('#refocus').classList.contains('on')")
            await pg.click('#fitall'); await settle(pg, 900)
            z1 = await pg.evaluate("window.__mapa.map().getZoom()")
            r1 = await pg.evaluate("({on: document.querySelector('#refocus').classList.contains('on'), t: document.querySelector('#refocus').textContent.trim()})")
            check('«Увесь маршрут» zooms out and brings up «Наблизити назад» over the map', not r0 and r1['on'] and r1['t'] == 'Наблизити назад', f'{r0} {r1}')
            await pg.click('#refocus'); await settle(pg, 1000)
            z2 = await pg.evaluate("window.__mapa.map().getZoom()")
            check('… which zooms back in to the stop, me and the bus, and goes away', z2 > z1 + 0.5 and not await pg.evaluate("document.querySelector('#refocus').classList.contains('on')"), f'{z1} → {z2}')
            b0 = await pg.evaluate("(() => { const m = document.querySelector('.busmk'); return m ? m.style.transform : ''; })()"); await settle(pg, 1200)
            b1 = await pg.evaluate("(() => { const m = document.querySelector('.busmk'); return m ? m.style.transform : ''; })()")
            check('the bus glides: its place changes between the once-a-second updates', b0 and b1 and b0 != b1, f'{b0} | {b1}')
        await pg.evaluate("window.__back()"); await settle(pg, 500)
        check('Back from a link: the stops around', await text(pg, '#stitle') == 'Зупинки поруч')
        await ctx.close()

        # ---------------- my places ----------------
        ctx, pg, w = await page(browser, base + 'mapa/', store=[['mapa-loc', '1']])
        await pg.wait_for_function('window.__mapa && window.__mapa.me() && document.querySelectorAll("#nearlist .row").length > 0', timeout=15000); await settle(pg)
        check('my places: offered at the top of the stops around', await pg.is_visible('#addplace') and 'дім, робота' in await text(pg, '#addplace'))
        await pg.click('#addplace'); await settle(pg, 700)
        st = await pg.evaluate("({title: document.querySelector('#stitle').textContent, pin: getComputedStyle(document.querySelector('#pickpin')).display, kinds: document.querySelectorAll('.pkinds [data-kind]').length, home: document.querySelector('.pkinds [data-kind=home]').getAttribute('aria-checked')})")
        check('a new place: a pin in the middle of the map, six kinds, «Дім» first', st['title'] == 'Нове місце' and st['pin'] == 'block' and st['kinds'] == 6 and st['home'] == 'true', str(st))
        await pg.click('#picksave'); await settle(pg, 700)
        pl = await pg.evaluate("JSON.parse(localStorage.getItem('mapa-places') || '[]')")
        check('saved: «Дім» where the pin was, kept on the phone and in Telegram; the chip in the list', len(pl) == 1 and pl[0]['name'] == 'Дім' and pl[0]['kind'] == 'home' and abs(pl[0]['coord'][0] - 51.6617) < 0.01
              and 'places' in await pg.evaluate("Object.keys(window.__cloud || {})") and await text(pg, '#stitle') == 'Зупинки поруч' and await pg.locator('.pchip[data-pl]').count() == 1, str(pl))
        if gl: check('… and a sign on the map', await pg.locator('.myplace').count() == 1)
        await pg.click('.pchip[data-pl]'); await pg.wait_for_function("document.querySelectorAll('#sbody .rows .row').length > 0", timeout=8000)
        st = await pg.evaluate("({title: document.querySelector('#stitle').textContent, sub: document.querySelector('#ssub').textContent, route: !!document.querySelector('#sbody a[href*=\"marshrut/?to=\"]'), del: !!document.querySelector('#delplace')})")
        sq = [c for c in w.calls if c[0] == '/transit/stops' and 'lat' in c[1]]
        check('a place of mine: the nearest stops (asked by its point only), the way there, change or remove', st['title'] == 'Дім' and 'Моє місце' in st['sub'] and st['route'] and st['del'] and sq, str(st))
        await pg.click('#delplace'); await settle(pg, 600)
        check('removed: gone from the list and the phone', await pg.locator('.pchip[data-pl]').count() == 0 and await pg.evaluate("JSON.parse(localStorage.getItem('mapa-places')).length") == 0)

        # ---------------- the map of the town without internet ----------------
        await pg.wait_for_function("localStorage.getItem('mapa-city')", timeout=20000); await settle(pg, 300)
        kept = await pg.evaluate("caches.open('dsimya-city').then(c => c.keys()).then(k => k.map(r => r.url))")
        city = await text(pg, '#city')
        check('the town map is saved by itself (wi-fi): the tiles of Xanten and towards Wesel, letters, under names without the weekly version',
              len(kept) >= 150 and any('/__tile/14/' in u for u in kept) and not any('/planet/t/' in u for u in kept) and any('/fonts/' in u for u in kept) and 'без інтернету' in city, f'{len(kept)} {city}')
        await ctx.close()

        # ---------------- links into the map ----------------
        ctx, pg, w = await page(browser, base + 'transport/')
        await settle(pg, 600)
        check('Транспорт: the chosen stop opens on the map', (await pg.get_attribute('#onmap', 'href')).startswith('../mapa/?stop=de%3A05170%3A37032'))
        hrefs = await pg.evaluate("[...document.querySelectorAll('#deps a.deplink')].map(a => a.getAttribute('href'))")
        check('Транспорт: a departure (its line number) opens that very bus on the map', hrefs and all(h.startswith('../mapa/?line=') and '&at=' in h and '&plan=' in h and '&ln=' in h for h in hrefs), str(hrefs[:2]))
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
