"""Usability guard for every page, in headless Chrome as a Telegram Mini App on a 360 px Android phone.

  python3 tests/ux_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Per page: the heading says what the menu calls the section (the home page and the map excepted); nothing scrolls
sideways at 360 px; zoom is not blocked; no control is smaller than 24 px (links inside a sentence and file inputs
behind their buttons excepted); every button and link has a name; switches and the map's sheet handle answer a tap
just outside their drawn edge (their touch area is larger than they look); keyboard focus is visible on the controls
reached first with Tab. External requests are blocked, so pages show their no-data state. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, os, re, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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

TG = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: 'user=%7B%22id%22%3A1%7D&hash=x', initDataUnsafe: {user: {id: 1}},
  ready() {}, expand() {}, onEvent() {}, offEvent() {}, isVersionAtLeast() { return true; }, setHeaderColor() {}, setBackgroundColor() {}, openLink() {},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}, offClick() {}},
  CloudStorage: {getItem(k, cb) { cb && cb(null, ''); }, setItem(k, v, cb) { cb && cb(null, true); }, getItems(k, cb) { cb && cb(null, {}); }}}};"""

# the menu (assets/ui.js): path → name
UI = open(os.path.join(ROOT, 'assets', 'ui.js'), encoding='utf-8').read()
MENU = dict(re.findall(r"\['([a-z0-9/]*)', '([^']+)', '[^']*', '[a-z]+'\]", UI))

PROBE = r"""() => {
  const vis = (el) => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !el.closest('[hidden],[inert],[aria-hidden="true"]'); };
  const inText = (el) => el.tagName === 'A' && getComputedStyle(el).display === 'inline';
  const ctrls = [...document.querySelectorAll('a[href],button,input:not([type=hidden]):not([type=file]),select,textarea,summary,[role=button],[role=switch],[role=tab]')].filter(vis);
  const tiny = ctrls.filter((el) => !inText(el)).map((el) => [el, el.getBoundingClientRect()]).filter(([, r]) => r.width < 24 || r.height < 24)
    .map(([el, r]) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} ${Math.round(r.width)}×${Math.round(r.height)}`);
  const nameOf = (el) => (el.getAttribute('aria-label') || el.innerText || el.value || el.title || el.getAttribute('placeholder') || '').trim()
    || (el.getAttribute('aria-labelledby') || '').split(' ').map((id) => (document.getElementById(id) || {}).textContent || '').join('').trim()
    || (el.id && document.querySelector(`label[for="${el.id}"]`) ? 'label' : '') || [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('');
  const nameless = ctrls.filter((el) => !nameOf(el)).map((el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`);
  const vp = (document.querySelector('meta[name=viewport]') || {}).content || '';
  return {h1: [...document.querySelectorAll('h1')].filter(vis).map((h) => h.innerText.trim()), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    zoomBlocked: /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(vp), tiny, nameless};
}"""

# a tap a few px outside the drawn control still hits it
EDGE = """([sel, dy]) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect();
  const at = document.elementFromPoint(r.left + r.width / 2, (dy < 0 ? r.top : r.bottom) + dy); return !!at && (at === el || el.contains(at)); }"""

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        bad = {'heading': [], 'overflow': [], 'zoom': [], 'tiny': [], 'nameless': [], 'focus': []}
        for path, name in MENU.items():
            ctx = await browser.new_context(viewport={'width': 360, 'height': 780}, service_workers='block')
            async def route(r):
                u = r.request.url
                if u.startswith(base): return await r.continue_()
                if 'telegram.org' in u: return await r.fulfill(body=TG, content_type='text/javascript')
                await r.abort()
            await ctx.route('**/*', route)
            pg = await ctx.new_page()
            await pg.goto(base + path); await pg.wait_for_timeout(900)
            r = await pg.evaluate(PROBE)
            if path not in ('', 'mapa/') and r['h1'] != [name]: bad['heading'].append(f"{path}: {r['h1']} ≠ «{name}»")
            if r['overflow'] > 0: bad['overflow'].append(f"{path}: {r['overflow']} px")
            if r['zoomBlocked']: bad['zoom'].append(path or '/')
            if r['tiny']: bad['tiny'].append(f"{path or '/'}: {', '.join(r['tiny'][:4])}")
            if r['nameless']: bad['nameless'].append(f"{path or '/'}: {', '.join(r['nameless'][:4])}")
            for _ in range(8):
                await pg.keyboard.press('Tab')
                ring = await pg.evaluate("""() => { const el = document.activeElement; if (!el || el === document.body) return true; const s = getComputedStyle(el);
                  return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none'); }""")
                if not ring: bad['focus'].append(f"{path or '/'}: {await pg.evaluate('document.activeElement.outerHTML.slice(0, 60)')}")
            await ctx.close()
        check('every section is headed by the name the menu gives it', not bad['heading'], '; '.join(bad['heading']))
        check('nothing scrolls sideways at 360 px', not bad['overflow'], '; '.join(bad['overflow']))
        check('zoom is never blocked', not bad['zoom'], ', '.join(bad['zoom']))
        check('no control smaller than 24 px', not bad['tiny'], '; '.join(bad['tiny']))
        check('every button and link has a name', not bad['nameless'], '; '.join(bad['nameless']))
        check('keyboard focus is visible', not bad['focus'], '; '.join(bad['focus'][:5]))

        ctx = await browser.new_context(viewport={'width': 360, 'height': 780}, service_workers='block')
        async def route2(r):
            if r.request.url.startswith(base): return await r.continue_()
            if 'telegram.org' in r.request.url: return await r.fulfill(body=TG, content_type='text/javascript')
            await r.abort()
        await ctx.route('**/*', route2)
        pg = await ctx.new_page()
        edges = []
        for page, sel, dy in [('bot/', '#sw-brief', -3), ('pogoda/', '#sw', -3), ('marshrut/', '#dt', 3), ('mapa/', '#grip', -9)]:
            await pg.goto(base + page); await pg.wait_for_timeout(800)
            if not await pg.evaluate(EDGE, [sel, dy]): edges.append(page + sel)
        check('switches and the map handle: a tap just outside the drawn edge still hits them', not edges, ', '.join(edges))
        await pg.goto(base + 'misto/'); await pg.wait_for_timeout(800)
        rows = await pg.evaluate("[...document.querySelectorAll('.contact a')].slice(0, 6).map(a => Math.round(a.getBoundingClientRect().height))")
        check('addresses, phones and mail of the offices are rows of finger size (44 px)', rows and min(rows) >= 44, str(rows))
        await ctx.close()
        await browser.close()
    print('\n' + (f'{len(fails)} FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)

asyncio.run(main())
