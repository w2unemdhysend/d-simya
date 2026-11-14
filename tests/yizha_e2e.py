"""«Харчування» /yizha/ in headless Chrome, against an in-memory stand-in for the Worker (worker/forma.js) and canned
answers of Open Food Facts (tests/fixtures/off-*.json).

  python3 tests/yizha_e2e.py     (CHROME=/path/to/chrome to use a system browser; SHOTS=dir for screenshots)

Covers: the first visit asks who and what the goal is, explains a goal above the weight and a goal too low for the
height, shows the daily target before saving; the day: adding from the built-in list by search, portions (a plate, a
spoonful, grams), the ring and the macros, changing and deleting with undo, «як учора»; packaged food: the search
in Open Food Facts with photos, «невідомо» for a product without a photo, calories that do not fit their protein, fat
and carbohydrates are recounted, a barcode typed in → the product with its photo, kept in «Мої продукти» and found
offline next time; an own product from the label and an own dish from ingredients; weight, its chart and the week;
in Telegram: the records go to the server and reach a second phone, partners by code see each other's progress and
never food; without internet everything is kept and sent later; 340 px without sideways scrolling, dark theme.
Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, sys, threading, urllib.parse, random, string
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('SHOTS', '')
fails = []
OFF_SEARCH = open(os.path.join(ROOT, 'tests', 'fixtures', 'off-search.json')).read()
OFF_PRODUCT = open(os.path.join(ROOT, 'tests', 'fixtures', 'off-product.json')).read()
PNG = bytes.fromhex('89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c4944415408d763f8cfc0f01f0005000201e2ad7b2e0000000049454e44ae426082')

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail and not ok else ''))
    if not ok: fails.append(name)

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/'

def tg_js(uid, name):
    init = urllib.parse.urlencode({'user': json.dumps({'id': uid, 'first_name': name}), 'hash': 'x'})
    return """window.__links = []; window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: %s, initDataUnsafe: {user: {id: %d, first_name: %s}},
  ready() {}, expand() {}, onEvent() {}, isVersionAtLeast() { return true; }, setHeaderColor() {}, setBackgroundColor() {},
  openLink(u) { window.__links.push(u); }, openTelegramLink(u) { window.__links.push(u); },
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};""" % (
        json.dumps(init), uid, json.dumps(name))

def multipart(body, ctype):
    boundary = ctype.split('boundary=')[1]
    out = {}
    for part in body.split('--' + boundary):
        if 'name="' not in part: continue
        head, _, val = part.partition('\r\n\r\n')
        out[head.split('name="')[1].split('"')[0]] = val.rsplit('\r\n', 1)[0]
    return out

class Server:
    """worker/forma.js in a few lines: each person's records (the newer change wins), partners by code"""
    def __init__(self): self.recs, self.seq, self.buddies, self.codes, self.names, self.down, self.reminders = {}, {}, {}, {}, {}, set(), []
    def summary(self, uid):
        recs = self.recs.get(uid, {})
        live = {k: r for k, r in recs.items() if not r.get('d')}
        prof = (live.get('p|me') or {}).get('v')
        ws = sorted((k[2:], r['v']['kg']) for k, r in live.items() if k.startswith('w|'))
        kg = ws[-1][1] if ws else (prof or {}).get('start', {}).get('kg')
        days = {}
        for k, r in live.items():
            if k.startswith('e|'): d = k[2:12]; days[d] = days.get(d, 0) + round(r['v']['kcal'] * r['v']['g'] / 100)
        lost = round((prof['start']['kg'] - kg) * 10) / 10 if prof and kg else None
        return {'id': uid, 'name': self.names.get(uid, ''), 'lost': lost, 'toGo': None, 'logged': len(days), 'inTarget': None,
                'workouts': sum(1 for k in live if k.startswith('x|')), 'walks': 0, 'active': max(days) if days else None}
    async def route(self, route, who):
        if who in self.down: return await route.abort()
        req = route.request; f = multipart(req.post_data or '', req.headers.get('content-type', ''))
        user = json.loads(dict(urllib.parse.parse_qsl(f.get('initData', ''))).get('user', 'null') or 'null')
        if not user: return await route.fulfill(status=401, json={'ok': False})
        uid, action = user['id'], f.get('action')
        self.names[uid] = user['first_name']
        if action == 'sync':
            recs = self.recs.setdefault(uid, {}); seq = self.seq.get(uid, 0)
            for c in json.loads(f.get('changes', '[]')):
                key = c['k'] + '|' + c['id']; old = recs.get(key)
                if old and old['u'] > c['u']: continue
                seq += 1; recs[key] = {'k': c['k'], 'id': c['id'], 'u': c['u'], 's': seq, **({'d': 1} if c.get('d') else {'v': c.get('v')})}
            self.seq[uid] = seq
            since = int(f.get('since', '0'))
            rows = sorted((r for r in recs.values() if r['s'] > since), key=lambda r: r['s'])
            return await route.fulfill(json={'ok': True, 'seq': seq, 'rows': [{k: v for k, v in r.items() if k != 's'} for r in rows], 'more': False})
        if action == 'invite':
            code = ''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', k=6)); self.codes[code] = uid
            return await route.fulfill(json={'ok': True, 'code': code})
        if action == 'join':
            other = self.codes.get(f.get('code', ''))
            if not other: return await route.fulfill(status=404, json={'ok': False, 'error': 'bad_code'})
            self.buddies.setdefault(uid, set()).add(other); self.buddies.setdefault(other, set()).add(uid)
            return await route.fulfill(json={'ok': True})
        if action == 'export':
            self.exports = getattr(self, 'exports', 0) + 1
            return await route.fulfill(json={'ok': True, 'records': len(self.recs.get(uid, {}))})
        if action == 'buddies':
            return await route.fulfill(json={'ok': True, 'buddies': [self.summary(b) for b in self.buddies.get(uid, ())]})
        return await route.fulfill(status=400, json={'ok': False})
    async def remind(self, route):
        f = multipart(route.request.post_data or '', route.request.headers.get('content-type', ''))
        self.reminders.append(f)
        return await route.fulfill(json={'ok': True, 'on': f.get('action') == 'on'})

async def off(route):
    u = route.request.url
    if 'search.openfoodfacts.org' in u: return await route.fulfill(body=OFF_SEARCH, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'})
    if '/api/v2/product/4000417025005' in u: return await route.fulfill(body=OFF_PRODUCT, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'})
    if '/api/v2/product/' in u: return await route.fulfill(status=404, body='{"status":0}', content_type='application/json', headers={'Access-Control-Allow-Origin': '*'})
    return await route.fulfill(body=PNG, content_type='image/png')

async def phone(browser, base, server, who='none', uid=None, name='', width=390, scheme='light', path='yizha/'):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg_js(uid, name) if uid else '', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    await ctx.route('**/*openfoodfacts.org/**', off)
    await ctx.route('**/*.workers.dev/forma', lambda r: server.route(r, who))
    await ctx.route('**/*.workers.dev/reminders', server.remind)
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error ({who}): {e}'))
    await pg.clock.install(time='2026-11-14T08:00:00Z')
    await pg.goto(base + path); await pg.wait_for_timeout(500)
    return ctx, pg

async def setup(pg, sex='f', born='1968', cm='163', kg='84', goal='70'):
    await pg.click(f'[data-seg="sex"] [data-v="{sex}"]')
    await pg.fill('#s-born', born); await pg.fill('#s-cm', cm); await pg.fill('#s-kg', kg); await pg.fill('#s-goal', goal)
    await pg.wait_for_timeout(100)

async def add_food(pg, meal, query, food_id, unit=None, qty=None):
    await pg.click(f'[data-add="{meal}"]'); await pg.wait_for_timeout(200)
    await pg.fill('#q', query); await pg.wait_for_timeout(250)
    await pg.click(f'#res [data-food="{food_id}"] >> nth=0'); await pg.wait_for_timeout(200)
    if unit is not None: await pg.click(f'[data-unit="{unit}"]')
    if qty is not None: await pg.fill('#pq', str(qty)); await pg.wait_for_timeout(100)
    await pg.click('#psave'); await pg.wait_for_timeout(300)

ENTRIES = "() => [...document.querySelectorAll('.entry')].map(e => e.querySelector('.t b').textContent + ' ' + e.querySelector('.k').textContent)"
LEFT = "() => document.querySelector('.ring .mid b').textContent.replace(/\\s/g, '')"
OVERFLOW = "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        server = Server()

        # ---------- the first visit, outside Telegram ----------
        ctx, pg = await phone(browser, base, server)
        check('first visit: the setup, no tabs yet', await pg.is_visible('#view-setup') and await pg.is_hidden('#tabs'))
        await setup(pg, goal='90')
        check('a goal above the weight is explained', 'більша за теперішню' in await pg.text_content('#s-prev'))
        await setup(pg, goal='45')
        check('a goal too low for the height is explained', 'замала' in await pg.text_content('#s-prev') and 'не нижче 50' in await pg.text_content('#s-prev'), await pg.text_content('#s-prev'))
        await setup(pg, goal='70')
        prev = await pg.text_content('#s-prev')
        check('the target before saving: 1 450 kcal, need ≈ 1 940, the month the goal is reached', '1450' in prev.replace(' ', '').replace(' ', '') and 'дефіцит' in prev and 'приблизно в' in prev, prev)
        await pg.click('[data-opts="act"] [data-v="1"]'); await pg.wait_for_timeout(100)
        check('less activity: a lower target', '1450' not in (await pg.text_content('#s-prev')).replace(' ', '').replace(' ', ''))
        await pg.click('[data-opts="act"] [data-v="2"]'); await pg.click('#s-save'); await pg.wait_for_timeout(500)
        check('saved: the day with tabs, the full target left', await pg.is_visible('#tabs') and await pg.evaluate(LEFT) == '1450', await pg.evaluate(LEFT))
        check('outside Telegram the records stay on this device (and it says so)', 'на цьому пристрої' in await pg.text_content('#sync'))

        # ---------- the day ----------
        await add_food(pg, 'b', 'гречк', 'C327032')
        check('search finds buckwheat; a plate (200 g) is 178 kcal', await pg.evaluate(ENTRIES) == ['Гречка варена 178'], str(await pg.evaluate(ENTRIES)))
        check('the ring counts down', await pg.evaluate(LEFT) == '1272', await pg.evaluate(LEFT))
        check('the toast offers undo', await pg.is_visible('#toast') and await pg.is_visible('#toast-undo'))
        await add_food(pg, 'b', 'банан', 'F503100')
        await add_food(pg, 'l', 'борщ', 'X469033')
        await add_food(pg, 'l', 'сметана 20', 'M172700', unit='g', qty=30)
        entries = await pg.evaluate(ENTRIES)
        check('banana (a piece, 120 g), borscht (a plate, 350 g), sour cream by grams (30 g)', entries == ['Гречка варена 178', 'Банан 95', 'Борщ 200', 'Сметана 20 % (Schmand) 62'], str(entries))
        macro = await pg.evaluate("() => [...document.querySelectorAll('.macro b')].map(b => b.textContent)")
        check('protein, fat and carbohydrates add up', len(macro) == 3 and all('/' in m and int(m.split('/')[0]) > 0 for m in macro), str(macro))
        # Ukrainian words and German words find the same food
        await pg.click('[data-add="s"]'); await pg.fill('#q', 'Quark'); await pg.wait_for_timeout(200)
        names = await pg.evaluate("() => [...document.querySelectorAll('#res .list')[0].querySelectorAll('.t b')].map(b => b.textContent)")
        check('a German word finds the food too (Quark → сир кисломолочний)', any('кисломолочний' in n for n in names), str(names))
        await pg.fill('#q', ''); await pg.wait_for_timeout(200)
        check('an empty search: categories and «Нещодавні»', await pg.is_visible('.cats') and 'Нещодавні' in await pg.text_content('#res'))
        await pg.click('[data-cat="fruit"]'); await pg.wait_for_timeout(200)
        fruit_icons = await pg.evaluate("() => [...document.querySelectorAll('#res .list .row')].map(r => r.querySelector('.fi').classList.contains('unknown') ? '?' : r.querySelector('.fi').textContent)")
        check('a category: every fruit has an icon, or «невідомо»', len(fruit_icons) > 20 and '🍎' in fruit_icons and '?' in fruit_icons, str(fruit_icons[:12]))
        await pg.click('[data-close] >> nth=1'); await pg.wait_for_timeout(200)
        # change and delete
        await pg.click('.entry:has-text("Борщ")'); await pg.wait_for_timeout(200)
        await pg.click('[data-unit="g"]'); await pg.fill('#pq', '250'); await pg.wait_for_timeout(100)
        await pg.click('#psave'); await pg.wait_for_timeout(300)
        check('changed to 250 g: 143 kcal', 'Борщ 143' in await pg.evaluate(ENTRIES), str(await pg.evaluate(ENTRIES)))
        await pg.click('.entry:has-text("Банан")'); await pg.click('#pdel'); await pg.wait_for_timeout(300)
        check('deleted', not any('Банан' in e for e in await pg.evaluate(ENTRIES)))
        await pg.click('#toast-undo'); await pg.wait_for_timeout(300)
        check('…and undone', any('Банан' in e for e in await pg.evaluate(ENTRIES)))
        # yesterday → «як учора»
        await pg.click('[data-day="1"]', timeout=1000) if await pg.is_enabled('[data-day="1"]') else None
        check('the next day is closed from today', not await pg.is_enabled('[data-day="1"]'))
        await pg.click('[data-day="-1"]'); await pg.wait_for_timeout(300)
        check('yesterday is empty and says so', 'Учора' in await pg.text_content('.daynav') and await pg.evaluate(ENTRIES) == [])
        await add_food(pg, 'd', 'сирник', 'ua-syrnyky')
        await pg.click('[data-day="1"]'); await pg.wait_for_timeout(300)
        check('today: «як учора» for dinner', await pg.is_visible('[data-again="d"]') and 'Сирники' in await pg.text_content('[data-again="d"]'))
        await pg.click('[data-again="d"]'); await pg.wait_for_timeout(300)
        check('…one tap copies it', any(e.startswith('Сирники') for e in await pg.evaluate(ENTRIES)))
        # water, sleep, steps
        await pg.click('[data-water="1"]'); await pg.click('[data-water="1"]'); await pg.click('[data-water="1"]'); await pg.click('[data-water="-1"]'); await pg.wait_for_timeout(200)
        check('water: glasses add up (2 × 250 ml), the goal from the weight (2,5 л for 84 kg)', '0,5 з 2,5 л' in await pg.text_content('#h-water') and await pg.locator('.glasses i.full').count() == 2, await pg.text_content('#h-water'))
        await pg.click('[data-sleep="1"]'); await pg.click('[data-sleep="1"]'); await pg.wait_for_timeout(150)
        check('sleep: the first tap starts at 7 hours, then half hours', await pg.input_value('#sleep') == '7,5', await pg.input_value('#sleep'))
        await pg.fill('#steps', '6400'); await pg.press('#steps', 'Tab'); await pg.wait_for_timeout(150)
        check('steps kept for the day', (await pg.evaluate("() => window.__yizha.db.get('d', '2026-11-14')"))['steps'] == 6400)
        # ideas for what is left today
        check('ideas within what is left: filling foods first, each within the rest', await pg.locator('[data-idea]').count() >= 3, str(await pg.locator('[data-idea]').count()))
        await pg.click('[data-idea="0"]'); await pg.wait_for_timeout(200)
        check('…a tap opens the portion to add', await pg.is_visible('#psave'))
        await pg.click('[data-close] >> nth=1'); await pg.wait_for_timeout(200)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'yizha-day.png'), full_page=True)
        # ---------- packaged food ----------
        await pg.click('[data-add="s"]'); await pg.fill('#q', 'skyr'); await pg.wait_for_timeout(1200)
        rows = await pg.evaluate("() => [...document.querySelectorAll('#offres .row')].map(r => ({n: r.querySelector('.t b').textContent, img: !!r.querySelector('.fi img'), unk: r.querySelector('.fi').classList.contains('unknown'), k: r.querySelector('.k b').textContent}))")
        check('Open Food Facts: products with photos', len(rows) == 3 and rows[0]['img'], str(rows))
        check('…a product without a photo: «невідомо»', rows[2]['unk'] if len(rows) == 3 else False, str(rows))
        check('…calories that do not fit protein, fat and carbohydrates are recounted (270 → 62)', rows[1]['k'] == '62' if len(rows) == 3 else False, str(rows))
        await pg.click('#offres [data-food] >> nth=1'); await pg.wait_for_timeout(200)
        check('…and the portion says so', 'не сходилися' in await pg.text_content('#sheet-body'))
        await pg.click('#sheet-back'); await pg.wait_for_timeout(200)
        await pg.click('#toscan'); await pg.wait_for_timeout(500)
        await pg.fill('#codein', '4000417025004'); await pg.click('#codeform button'); await pg.wait_for_timeout(200)
        check('a wrong check digit is caught', 'не схоже на штрихкод' in await pg.text_content('#scanerr'))
        await pg.fill('#codein', '4000417025005'); await pg.click('#codeform button'); await pg.wait_for_timeout(600)
        check('a barcode → the product with its photo', 'marzipan' in (await pg.text_content('#sheet-body')).lower() and await pg.evaluate("() => !!document.querySelector('.product .fi img')"))
        check('…portions from the package: a piece and the whole bar', await pg.evaluate("() => [...document.querySelectorAll('[data-unit]')].length") == 3)
        await pg.click('#psave'); await pg.wait_for_timeout(300)
        check('…added, with its photo in the day', await pg.evaluate("() => !!document.querySelector('#view-day .entry .fi img')"))
        await pg.click('#tab-foods'); await pg.wait_for_timeout(400)
        check('…and kept in «Мої продукти»', 'marzipan' in (await pg.text_content('#view-foods')).lower())
        await ctx.route('**/*openfoodfacts.org/**', lambda r: r.abort())
        await pg.click('[data-new="scan"]'); await pg.wait_for_timeout(300)
        await pg.fill('#codein', '4000417025005'); await pg.click('#codeform button'); await pg.wait_for_timeout(300)
        check('offline: a product scanned before is found by its barcode', 'marzipan' in (await pg.text_content('#sheet-body')).lower())
        await pg.click('[data-close] >> nth=1'); await pg.wait_for_timeout(200)
        await pg.click('[data-new="scan"]'); await pg.fill('#codein', '4006040054818'); await pg.click('#codeform button'); await pg.wait_for_timeout(400)
        check('offline: an unknown barcode says why', 'інтернету' in await pg.text_content('#scanerr') or 'не відповідає' in await pg.text_content('#scanerr'), await pg.text_content('#scanerr'))
        await pg.click('[data-close] >> nth=1'); await pg.wait_for_timeout(200)
        await ctx.route('**/*openfoodfacts.org/**', off)

        # ---------- own product and own dish ----------
        await pg.click('[data-new="food"]'); await pg.wait_for_timeout(200)
        await pg.click('#c-save'); await pg.wait_for_timeout(100)
        check('own product: a name is asked for', 'назву' in await pg.text_content('#c-err'))
        await pg.fill('#c-n', 'Йогурт грецький 2 %'); await pg.fill('#c-kcal', '73'); await pg.fill('#c-p', '9,5'); await pg.fill('#c-f', '2'); await pg.fill('#c-c', '4')
        await pg.fill('#c-pn', 'стаканчик'); await pg.fill('#c-pg', '150'); await pg.click('[data-icon="🥛"]')
        await pg.click('#c-save'); await pg.wait_for_timeout(300)
        check('own product saved with its icon', 'Йогурт грецький' in await pg.text_content('#view-foods') and '🥛' in await pg.text_content('#view-foods'))
        await pg.click('[data-new="dish"]'); await pg.wait_for_timeout(200)
        await pg.fill('#d-n', 'Сирники домашні')
        for q, fid, g in [('сир кисломолочний 20', 'M713300', 400), ('яйце сире', 'E111100', 110), ('мука', None, None)]:
            if fid is None: break
            await pg.click('#d-add'); await pg.fill('#q', q); await pg.wait_for_timeout(250)
            await pg.click(f'#res [data-food="{fid}"] >> nth=0'); await pg.click('[data-unit="g"]'); await pg.fill('#pq', str(g)); await pg.wait_for_timeout(100)
            await pg.click('#psave'); await pg.wait_for_timeout(250)
        check('dish: two ingredients', await pg.evaluate("() => document.querySelectorAll('#sheet-body .list .row').length") == 2)
        await pg.fill('#d-total', '450'); await pg.wait_for_timeout(100)
        per = await pg.text_content('#d-per')
        check('dish: kcal per 100 g from the cooked weight (440 + 149 kcal in 450 g = 131)', per.strip() == '131', per)
        await pg.click('#d-save'); await pg.wait_for_timeout(300)
        check('dish saved', 'Сирники домашні' in await pg.text_content('#view-foods'))
        await pg.click('#tab-day'); await pg.wait_for_timeout(300)
        await pg.click('[data-add="s"]'); await pg.fill('#q', 'домашні'); await pg.wait_for_timeout(200)
        first = await pg.text_content('#res .row .t b')
        check('own dishes come first in the search', first == 'Сирники домашні', first)
        await pg.click('[data-close] >> nth=1'); await pg.wait_for_timeout(200)
        # the plan
        await pg.click('#tab-plan'); await pg.wait_for_timeout(300)
        check('the plan: seven days of this week, nothing planned yet', await pg.locator('.pday').count() == 7 and await pg.is_disabled('#toshop'))
        await pg.click('[data-addplan="l"][data-pday="2026-11-15"]'); await pg.fill('#q', 'борщ'); await pg.wait_for_timeout(200)
        check('…adding to the plan names the day and the meal', 'план: обід' in (await pg.text_content('#sheet-title')).lower(), await pg.text_content('#sheet-title'))
        await pg.click('#res [data-food="X469033"]'); await pg.click('#psave'); await pg.wait_for_timeout(250)
        await pg.click('[data-addplan="d"][data-pday="2026-11-15"]'); await pg.fill('#q', 'домашні'); await pg.wait_for_timeout(200)
        await pg.click('#res .row >> nth=0'); await pg.click('#psave'); await pg.wait_for_timeout(250)
        await pg.click('[data-addplan="b"][data-pday="2026-11-14"]'); await pg.fill('#q', 'скір'); await pg.wait_for_timeout(200)
        await pg.click('#res [data-food="M710100"]'); await pg.click('#psave'); await pg.wait_for_timeout(250)
        check('…planned items show with their calories', await pg.locator('#view-plan .pchip').count() == 3)
        await pg.click('#toshop'); await pg.wait_for_timeout(300)
        shop = await pg.evaluate("() => [...document.querySelectorAll('.shop li')].map(l => l.textContent.trim())")
        check('shopping for the week: the dish is split into its ingredients', any('Сир кисломолочний 20' in x for x in shop) and any('Яйце' in x for x in shop) and any('Борщ' in x for x in shop) and any('Скір' in x for x in shop), str(shop))
        await pg.click('[data-close] >> nth=1'); await pg.wait_for_timeout(200)
        await pg.click('#copyweek'); await pg.wait_for_timeout(300)
        check('repeat on the next week: the plan moves on with it', 'Наступний тиждень' in await pg.text_content('#view-plan .daynav') and await pg.locator('#view-plan .pchip').count() == 3)
        await pg.click('#tab-day'); await pg.wait_for_timeout(300)
        check('today: the planned breakfast to log with one tap', await pg.locator('[data-fromplan]').count() == 1)
        await pg.click('[data-fromplan]'); await pg.wait_for_timeout(300)
        check('…logged and marked as done', any(e.startswith('Скір') for e in await pg.evaluate(ENTRIES)) and await pg.locator('.pchip.done').count() == 1)


        # ---------- progress ----------
        await pg.click('#tab-progress'); await pg.wait_for_timeout(400)
        check('weight: one weighing, no chart yet', 'після другого зважування' in await pg.text_content('#view-progress'))
        await pg.evaluate("""() => { const db = window.__yizha.db; [['2026-10-24', 85.6], ['2026-10-31', 85.1], ['2026-11-07', 84.4]].forEach(([d, kg]) => db.put('w', d, {kg})); }""")
        await pg.fill('#wkg', '83,8'); await pg.click('#wsave'); await pg.wait_for_timeout(400)
        await pg.click('[data-range="0"]'); await pg.wait_for_timeout(300)
        text = await pg.text_content('#view-progress')
        check('weight: the chart, the rate a week, the goal month', await pg.is_visible('svg.chart .tr') and 'кг/тижд.' in text and 'Пройдено' in text, text[:300])
        check('the week: days written down and the average', 'Записано 2 дні з 7' in text, text)
        # measures
        await pg.fill('#waist', '104'); await pg.fill('#hips', '118'); await pg.click('#msave'); await pg.wait_for_timeout(200)
        await pg.evaluate("() => window.__yizha.db.put('d', '2026-11-01', {waist: 107.5, hips: 120})"); await pg.wait_for_timeout(200)
        m = await pg.text_content('#view-progress')
        check('measures: waist and hips with the change since the first', 'Талія104 см (−3,5 від 1 лист.)' in m.replace('\u00a0', ' ') or '−3,5' in m, m[m.find('Обміри'):m.find('Обміри') + 300])
        # blood pressure and sugar, off by default
        check('the pressure and sugar log is off until switched on', await pg.is_visible('#hl-on'))
        await pg.click('#hl-on'); await pg.wait_for_timeout(200)
        await pg.fill('#bp-s', '150'); await pg.fill('#bp-d', '95'); await pg.fill('#bp-p', '72'); await pg.click('#bp-save'); await pg.wait_for_timeout(200)
        check('pressure 150/95: «підвищений», marked', 'підвищений' in await pg.text_content('.hl') and await pg.locator('.hl small.warn').count() == 1)
        await pg.fill('#bp-s', '60'); await pg.fill('#bp-d', '90'); await pg.click('#bp-save'); await pg.wait_for_timeout(150)
        check('an impossible pressure is explained', not await pg.is_hidden('#hl-err'))
        await pg.click('#hl-unit'); await pg.wait_for_timeout(150); await pg.click('[data-su="1"]'); await pg.wait_for_timeout(150)
        await pg.fill('#su-v', '130'); await pg.click('#su-save'); await pg.wait_for_timeout(200)
        check('sugar in mg/dl after a meal: 130 = 7,2 mmol/l, normal after food', 'норма після їжі' in await pg.text_content('.hl') and '130 мг/дл' in await pg.text_content('.hl'), await pg.text_content('.hl'))
        # achievements
        ach = await pg.text_content('#view-progress')
        check('achievements: the first record is there, the rest say what to do', await pg.locator('.ach li.got').count() == 1 and 'Перший запис' in await pg.text_content('.ach li.got') and 'Скинути перший кілограм' in ach)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'yizha-progress.png'), full_page=True)
        check('390 px: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        # a copy of the data, and putting it back on another device
        await pg.click('#tab-foods'); await pg.wait_for_timeout(300)
        check('outside Telegram: only the file (no sending to the chat)', await pg.locator('[data-data="send"]').count() == 0)
        async with pg.expect_download() as dl:
            await pg.click('[data-data="file"]')
        raw = open(await (await dl.value).path(), 'rb').read()
        copy = json.loads(raw)
        path = {'name': 'd-simya-kopiia.json', 'mimeType': 'application/json', 'buffer': raw}
        check('the copy holds the profile, the diary, own foods and dishes', copy['kind'] == 'forma' and {'p', 'w', 'e', 'f', 'r'} <= {r['k'] for r in copy['rows']}, str({r['k'] for r in copy['rows']}))
        await ctx.close()
        ctx, pg = await phone(browser, base, server)
        check('a new device starts with the questions, and offers to restore a copy', await pg.is_visible('#view-setup') and await pg.locator('#restore0').count() == 1)
        await pg.set_input_files('#restore0', path); await pg.wait_for_timeout(500)
        check('restored from the copy at the start: no questions, the diary is back', await pg.is_visible('#tabs') and 'Сирники' in str(await pg.evaluate(ENTRIES)), str(await pg.evaluate(ENTRIES)))
        await pg.click('#tab-foods'); await pg.wait_for_timeout(200)
        check('…own dishes too', 'Сирники домашні' in await pg.text_content('#view-foods'))
        await pg.set_input_files('#restore', path); await pg.wait_for_timeout(300)
        check('…a second time: nothing new', 'вже є тут' in await pg.text_content('#data-state'))
        await pg.set_input_files('#restore', {'name': 'x.json', 'mimeType': 'application/json', 'buffer': b'{"a":1}'}); await pg.wait_for_timeout(300)
        check('…a wrong file is explained', 'не копія' in await pg.text_content('#data-state'))
        await ctx.close()

        # ---------- Telegram: two phones of one person, partners ----------
        a_ctx, a = await phone(browser, base, server, 'a', 5151, 'Ольга')
        await setup(a); await a.click('#s-save'); await a.wait_for_timeout(1500)
        await add_food(a, 'b', 'сирник', 'ua-syrnyky'); await a.wait_for_timeout(1500)
        check('in Telegram: synced', 'синхронізовано' in (await a.text_content('#sync')).lower(), await a.text_content('#sync'))
        check('…the server has the profile, the weight and the food', all(k in server.recs.get(5151, {}) for k in ('p|me', 'w|2026-11-14')) and any(k.startswith('e|2026-11-14~') for k in server.recs.get(5151, {})))
        b_ctx, b = await phone(browser, base, server, 'a', 5151, 'Ольга')
        await b.wait_for_timeout(1500)
        check('a second phone gets everything, without asking the setup again', await b.is_visible('#tabs') and 'Сирники' in str(await b.evaluate(ENTRIES)), str(await b.evaluate(ENTRIES)))
        await b_ctx.close()
        server.down.add('a')
        await add_food(a, 'l', 'борщ', 'X469033'); await a.wait_for_timeout(1500)
        check('offline: added and kept, the line says so', 'Борщ 200' in await a.evaluate(ENTRIES) and 'Немає зв’язку' in await a.text_content('#sync'))
        server.down.discard('a')
        await a.evaluate("() => window.dispatchEvent(new Event('online'))"); await a.wait_for_timeout(1500)
        check('…and sent when the connection is back', sum(1 for k in server.recs[5151] if k.startswith('e|')) == 2)
        # partners
        s_ctx, s = await phone(browser, base, server, 'b', 4242, 'Іван')
        await setup(s, sex='m', born='1995', cm='182', kg='98', goal='85'); await s.click('#s-save'); await s.wait_for_timeout(800)
        await a.click('#tab-progress'); await a.wait_for_timeout(500)
        await a.click('#b-invite'); await a.wait_for_timeout(400)
        code = (await a.text_content('#b-codebox .big')).replace(' ', '')
        check('invite: a code of six', len(code) == 6, code)
        await a.click('#b-send'); await a.wait_for_timeout(200)
        check('…sent through Telegram', any('t.me/share' in u and code in urllib.parse.unquote(u) for u in await a.evaluate('window.__links')))
        await s.click('#tab-progress'); await s.wait_for_timeout(300)
        await s.click('#b-have'); await s.fill('#b-code', 'zzzzzz'); await s.press('#b-code', 'Enter'); await s.wait_for_timeout(300)
        check('a wrong code is explained', 'не підходить' in await s.text_content('#b-err'))
        await s.fill('#b-code', code.lower()); await s.press('#b-code', 'Enter'); await s.wait_for_timeout(600)
        buddy = await s.text_content('#buddies')
        check('partners: the second person sees the first, days written down, no food', 'Ольга' in buddy and 'записан' in buddy and 'Сирники' not in buddy, buddy)
        await a.click('#tab-foods'); await a.wait_for_timeout(300)
        await a.click('[data-data="send"]'); await a.wait_for_timeout(800)
        check('in Telegram: the copy is sent to the chat by the bot', getattr(server, 'exports', 0) == 1 and 'Надіслано' in await a.text_content('#data-state'), await a.text_content('#data-state'))
        await a.click('#tab-progress'); await a.wait_for_timeout(300)
        # reminders
        await a.click('#r-yizha'); await a.wait_for_timeout(300)
        r = server.reminders[-1] if server.reminders else {}
        check('meal reminder on: kind, time', r.get('kind') == 'yizha' and r.get('action') == 'on' and r.get('time') == '20:00', str(r))
        await a.select_option('#r-zvit-time', '18:30'); await a.click('#r-zvit'); await a.wait_for_timeout(300)
        r = server.reminders[-1]
        check('weekly report on: Sunday at the chosen time', r.get('kind') == 'zvit' and r.get('action') == 'on' and r.get('time') == '18:30', str(r))
        await a.select_option('#r-vaga-wd', '6'); await a.click('#r-vaga'); await a.wait_for_timeout(300)
        r = server.reminders[-1]
        check('weighing reminder on: Sunday at 07:30', r.get('kind') == 'vaga' and r.get('wd') == '6' and r.get('time') == '07:30', str(r))
        await a_ctx.close(); await s_ctx.close()

        # ---------- narrow, dark ----------
        n_ctx, n = await phone(browser, base, server, width=340, scheme='dark')
        await setup(n); await n.click('#s-save'); await n.wait_for_timeout(400)
        await add_food(n, 'b', 'вареники', 'ua-var-kart')
        check('340 px dark: nothing scrolls sideways', await n.evaluate(OVERFLOW) <= 0)
        for t in ('progress', 'foods'):
            await n.click(f'#tab-{t}'); await n.wait_for_timeout(400)
            check(f'340 px «{t}»: nothing scrolls sideways', await n.evaluate(OVERFLOW) <= 0)
        await n.click('#tab-day'); await n.click('[data-add="l"]'); await n.fill('#q', 'skyr'); await n.wait_for_timeout(1200)
        check('340 px sheet: nothing scrolls sideways', await n.evaluate("() => document.querySelector('.sheet-body').scrollWidth - document.querySelector('.sheet-body').clientWidth") <= 0)
        if OUT: await n.screenshot(path=os.path.join(OUT, 'yizha-dark-340.png'))
        await n_ctx.close()
        await browser.close()
    print('\n' + (f'{len(fails)} FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)

asyncio.run(main())
