"""The family shopping list /spysok/ in headless Chrome: two phones (two Telegram users) on one list, against an
in-memory stand-in for the Worker that behaves like worker/list.js.

  python3 tests/spysok_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Covers: without Telegram it explains; adding with and without a shop, groups by shop, ticking (moves to «Куплено»),
removing, clearing what was bought; changes made without internet wait (shown, kept on the device) and go out when
the connection is back; invite code and sending it through Telegram; joining with the code on the second phone, both
see each other's changes within seconds; a wrong code; leaving; «+ До списку» on the flyers page; 340 px, dark theme.
Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, random, string, sys, threading, urllib.parse
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
    """worker/list.js in a few lines: lists, members, invite codes"""
    def __init__(self): self.lists, self.lm, self.inv, self.down = {}, {}, {}, set()
    def new(self):
        lid = ''.join(random.choices(string.ascii_lowercase, k=8)); self.lists[lid] = {'items': [], 'members': {}, 'v': 0}; return lid
    def out(self, l): return {'ok': True, 'items': l['items'], 'members': list(l['members'].values()), 'v': l['v']}
    async def route(self, route, who):
        if who in self.down: return await route.abort()
        req = route.request; f = multipart(req.post_data or '', req.headers.get('content-type', ''))
        user = json.loads(dict(urllib.parse.parse_qsl(f.get('initData', ''))).get('user', 'null') or 'null')
        if not user: return await route.fulfill(status=401, json={'ok': False})
        uid, name, action = user['id'], user['first_name'], f.get('action', 'get')
        if action == 'join':
            lid = self.inv.get(f.get('code', ''))
            if not lid: return await route.fulfill(status=404, json={'ok': False, 'error': 'bad_code'})
            old = self.lm.get(uid)
            if old and old != lid: self.lists[old]['members'].pop(uid, None)
            self.lm[uid] = lid; l = self.lists[lid]; l['members'][uid] = name; l['v'] += 1
            return await route.fulfill(json=self.out(l))
        if action == 'leave':
            old = self.lm.get(uid)
            if old: self.lists[old]['members'].pop(uid, None); self.lists[old]['v'] += 1
            self.lm[uid] = self.new()
        if uid not in self.lm: self.lm[uid] = self.new()
        l = self.lists[self.lm[uid]]; l['members'][uid] = name
        if action == 'invite':
            code = ''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', k=6)); self.inv[code] = self.lm[uid]
            return await route.fulfill(json={'ok': True, 'code': code})
        if action == 'add':
            l['items'].append({'id': ''.join(random.choices(string.ascii_uppercase, k=8)), 't': f['t'], 's': f.get('s', ''), 'u': f.get('u', ''), 'd': 0, 'by': name}); l['v'] += 1
        elif action == 'toggle':
            for it in l['items']:
                if it['id'] == f['id']: it['d'] = 0 if it['d'] else 1; it['dby'] = name
            l['v'] += 1
        elif action == 'remove': l['items'] = [x for x in l['items'] if x['id'] != f['id']]; l['v'] += 1
        elif action == 'clear': l['items'] = [x for x in l['items'] if not x['d']]; l['v'] += 1
        return await route.fulfill(json=self.out(l))

async def phone(browser, base, server, who, uid=None, name='', path='spysok/', width=390, scheme='light'):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg_js(uid, name) if uid else '', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    await ctx.route('**/*.workers.dev/list', lambda r: server.route(r, who))
    await ctx.route('**/*.workers.dev/reminders', lambda r: r.fulfill(json={'ok': True, 'on': False}))
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error ({who}): {e}'))
    await pg.clock.install(time='2026-11-11T14:00:00Z')
    await pg.goto(base + path); await pg.wait_for_timeout(500)
    return ctx, pg

ITEMS = """() => [...document.querySelectorAll('#list .group, #list .item')].map(e => e.classList.contains('group') ? '# ' + e.querySelector('h3').textContent
  : (e.classList.contains('done') ? '[x] ' : '[ ] ') + e.querySelector('.txt b').textContent + (e.classList.contains('pending') ? ' (pending)' : ''))"""

async def add(pg, text, shop=None):
    if shop is not None: await pg.click(f'#shops [data-shop="{shop}"]')
    await pg.fill('#t', text); await pg.press('#t', 'Enter'); await pg.wait_for_timeout(300)

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        server = Server()

        ctx, pg = await phone(browser, base, server, 'none')
        check('without Telegram: explains it works through the bot', await pg.is_visible('#notg') and await pg.is_hidden('#app'))
        await ctx.close()

        a_ctx, a = await phone(browser, base, server, 'stas', 4242, 'Стас')
        check('first visit: empty list of one\'s own, synced', 'Список порожній' in await a.text_content('#list') and await a.text_content('#sync') == 'Синхронізовано')
        await add(a, 'Milch', 'Lidl'); await add(a, 'Brot', '')
        items = await a.evaluate(ITEMS)
        check('add with and without a shop: grouped, "Будь-де" first', items == ['# Будь-де', '[ ] Brot', '# Lidl', '[ ] Milch'], str(items))
        await a.click('.item:has-text("Milch") .check'); await a.wait_for_timeout(300)
        items = await a.evaluate(ITEMS)
        check('ticking moves it to «Куплено»', items[-2:] == ['# Куплено', '[x] Milch'] and await a.is_visible('#clear'), str(items))
        await a.click('#clear'); await a.wait_for_timeout(300)
        check('«Прибрати куплене» removes only what was bought', await a.evaluate(ITEMS) == ['# Будь-де', '[ ] Brot'])
        again = "() => [...document.querySelectorAll('#again-list .chip')].map(b => b.textContent)"
        check('"buy again": what was bought and is gone is offered, with its shop; what is on the list is not', await a.is_visible('#again') and await a.evaluate(again) == ['MilchLidl'], str(await a.evaluate(again)))
        await a.click('#again-list .chip'); await a.wait_for_timeout(400)
        items = await a.evaluate(ITEMS)
        check('"buy again": one tap puts it back under its shop', items == ['# Будь-де', '[ ] Brot', '# Lidl', '[ ] Milch'] and await a.is_hidden('#again'), str(items))
        await a.click('.item:has-text("Milch") .del'); await a.wait_for_timeout(300)
        check('"buy again": removed from the list → offered again', await a.evaluate(again) == ['MilchLidl'])

        # no internet: the change waits, is kept, and goes out later
        server.down.add('stas')
        await add(a, 'Eier', 'ALDI')
        items = await a.evaluate(ITEMS)
        check('offline: the new thing shows at once, marked as on its way', '[ ] Eier (pending)' in items and 'Немає зв’язку' in await a.text_content('#sync'), str(items))
        check('offline: the waiting change is kept on the phone', 'Eier' in (await a.evaluate("localStorage.getItem('spysok-queue')") or ''))
        await a.reload(); await a.wait_for_timeout(500)
        check('after a reload without internet it is still there', '[ ] Eier (pending)' in await a.evaluate(ITEMS))
        server.down.discard('stas')
        await a.clock.run_for(5200); await a.wait_for_timeout(500)
        items = await a.evaluate(ITEMS)
        check('back online: sent, no longer waiting', '[ ] Eier' in items and not any('pending' in i for i in items) and await a.evaluate("JSON.parse(localStorage.getItem('spysok-queue')).length") == 0, str(items))

        # invite the family
        await a.click('#invite'); await a.wait_for_selector('#codebox:not([hidden])')
        shown = await a.text_content('#code'); code = shown.replace(' ', '')
        check('invite: a 6-letter code shown in two halves', len(code) == 6 and shown[3] == ' ', shown)
        await a.click('#sendcode')
        links = await a.evaluate('window.__links')
        check('the code goes through Telegram\'s share', links and links[-1].startswith('https://t.me/share/url') and code in urllib.parse.unquote(links[-1]), str(links))

        b_ctx, b = await phone(browser, base, server, 'mama', 5151, 'Наталія')
        await add(b, 'Kaffee')
        await b.click('#havecode'); await b.fill('#jcode', 'zzz999'); await b.press('#jcode', 'Enter'); await b.wait_for_timeout(300)
        check('a wrong code: explained', 'Код не підходить' in await b.text_content('#ferr'))
        await b.fill('#jcode', code.lower()); await b.press('#jcode', 'Enter'); await b.wait_for_timeout(500)
        items = await b.evaluate(ITEMS)
        check('joining with the code: the shared list, her own one left', '[ ] Brot' in items and '[ ] Eier' in items and not any('Kaffee' in i for i in items) and 'Готово' in await b.text_content('#fok'), str(items))
        check('both names shown', 'Стас' in await b.text_content('#who') and 'Наталія' in await b.text_content('#who'))
        await add(b, 'Käse', 'Lidl')
        await a.clock.run_for(5200); await a.wait_for_timeout(500)
        check('the other phone sees it within 5 s, with who added it', '[ ] Käse' in await a.evaluate(ITEMS) and 'додав(ла) Наталія' in await a.text_content('#list'))
        await a.click('.item:has-text("Käse") .check'); await a.wait_for_timeout(300)
        await b.clock.run_for(5200); await b.wait_for_timeout(500)
        check('a tick on one phone shows on the other, with who bought it', '[x] Käse' in await b.evaluate(ITEMS) and 'купив(ла) Стас' in await b.text_content('#list'))
        await b.click('.item:has-text("Brot") .del'); await b.wait_for_timeout(300)
        check('remove one thing', not any('Brot' in i for i in await b.evaluate(ITEMS)))
        check('fits 390 px', await b.evaluate('document.documentElement.scrollWidth') <= 390)
        if OUT: await b.screenshot(path=os.path.join(OUT, 'spysok-390.png'), full_page=True)
        await b.click('#leave'); await b.click('#leave'); await b.wait_for_timeout(400)
        check('leaving needs two taps, then an empty list of her own', 'Список порожній' in await b.text_content('#list') and 'лише твій' in await b.text_content('#who'))
        await a.clock.run_for(5200); await a.wait_for_timeout(500)
        check('the one who stays sees only themself', 'Наталія' not in await a.text_content('#who'))
        await a_ctx.close(); await b_ctx.close()

        # «+ До списку» on the flyers page
        f_ctx, f = await phone(browser, base, server, 'stas', 4242, 'Стас', path='prospekty/')
        await f.click('.chain[data-chain="Lidl"] [data-tolist]')
        check('flyers: «+ До списку» opens a field for this shop', await f.get_attribute('.chain[data-chain="Lidl"] .addrow input', 'placeholder') == 'Що купити в Lidl?')
        await f.fill('.chain[data-chain="Lidl"] .addrow input', 'Butter'); await f.press('.chain[data-chain="Lidl"] .addrow input', 'Enter'); await f.wait_for_timeout(400)
        lid = server.lm[4242]; added = [x for x in server.lists[lid]['items'] if x['t'] == 'Butter']
        check('flyers: added with the shop and until Saturday, confirmed', added and added[0]['s'] == 'Lidl' and added[0]['u'] == '2026-11-14' and '«Butter» у списку покупок' in await f.text_content('.chain[data-chain="Lidl"]'), str(added))
        await f_ctx.close()

        c_ctx, c = await phone(browser, base, server, 'stas', 4242, 'Стас', width=340, scheme='dark')
        check('340 px, dark: no sideways scrolling', await c.evaluate('document.documentElement.scrollWidth') <= 340)
        if OUT: await c.screenshot(path=os.path.join(OUT, 'spysok-340-dark.png'), full_page=True)
        await c_ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
