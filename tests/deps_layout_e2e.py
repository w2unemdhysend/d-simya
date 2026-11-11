"""Departure rows with the real fonts (Unbounded, Onest from tests/fixtures/fonts, OFL), home card and Transport page.

  python3 tests/deps_layout_e2e.py     (CHROME=/path/to/chrome to use a system browser; OUT=dir for screenshots)

Covers: the time ("зараз", "1 хв", "30 хв", "59 хв", "14:45", a cancelled one) stays on one line and never runs into
the line badge; the badges and the destinations start at the same place in every row; the destination keeps room to be
read; at 320, 360 and 412 px. Exits 1 if a check fails.
"""
import asyncio, copy, functools, http.server, json, os, sys, threading
from datetime import datetime, timedelta, timezone
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('OUT')
DEP = json.load(open(os.path.join(ROOT, 'tests', 'fixtures', 'departures.json')))
WX = json.load(open(os.path.join(ROOT, 'tests', 'fixtures', 'weather.json')))
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

AT = datetime(2026, 11, 11, 13, 30, 0, tzinfo=timezone.utc)
iso = lambda m: (AT + timedelta(minutes=m)).strftime('%Y-%m-%dT%H:%M:%SZ')
def deps():
    base = DEP['deps'][1]
    rows = [(0, 'X28', 'Goch Bahnhof', 2, False), (0, 'X28', 'Wesel Bahnhof', 0, False), (1, 'SL40', 'Xanten Landwehr', 0, False),
            (30, 'X27', 'Wesel Bahnhof', 0, False), (59, 'SEV RB 31', 'Moers Bahnhof', 0, False), (75, 'RE19', 'Düsseldorf Hbf', 4, False),
            (40, '36', 'Sonsbeck Gaststätte Plooheide', 0, True)]
    out = []
    for m, line, dest, late, gone in rows:
        d = copy.deepcopy(base)
        d.update(line=line, dest=dest, plan=iso(m - late), est=None if gone else iso(m), gone=gone, live=not gone, notes=[], hints=[],
                 mode='train' if line.startswith('RE') else 'bus', kind='Ersatzverkehr' if line.startswith('SEV') else d['kind'])
        out.append(d)
    return {**DEP, 'at': iso(0), 'deps': out, 'notices': [], 'hints': []}

def font_css(base):
    faces = []
    for fam, file, weights in [('Unbounded', 'unbounded', (600, 700)), ('Onest', 'onest', (400, 600, 700))]:
        for w in weights:
            for sub, rng in [('cyrillic', 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'), ('latin', 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD')]:
                faces.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:block;src:url({base}tests/fixtures/fonts/{file}-{sub}-{w}-normal.woff2) format('woff2');unicode-range:{rng}}}")
    return '\n'.join(faces)

async def page(browser, base, path, width, back=0):
    ctx = await browser.new_context(viewport={'width': width, 'height': 900}, device_scale_factor=2 if OUT else 1)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body=font_css(base), content_type='text/css'))
    async def worker(route):
        p = route.request.url.split('?')[0]
        if p.endswith('/transit/departures'): return await route.fulfill(json=deps())
        if p.endswith('/weather'): return await route.fulfill(json=WX)
        await route.fulfill(status=404, json={'ok': False})
    await ctx.route('**/*.workers.dev/**', worker)
    await ctx.add_init_script("localStorage.setItem('transport-stops', JSON.stringify({list: [{id: 'de:05170:37032', name: 'Xanten, Bahnhof'}], active: 'de:05170:37032'}));")
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.install(time=AT.timestamp() - back * 60)   # earlier: the same rows read "29 хв", "58 хв" or a clock time
    await pg.goto(base + path)
    await pg.wait_for_function("document.fonts.check('700 16px Unbounded', 'зараз') && document.fonts.status === 'loaded'", timeout=8000)
    return ctx, pg

# per row: the time box (as drawn: its text), the badge, the destination; lines the time takes
MEASURE = """([row, time, badge, dest]) => [...document.querySelectorAll(row)].map((r) => {
  const t = r.querySelector(time), b = r.querySelector(badge), d = r.querySelector(dest);
  const range = document.createRange(); range.selectNodeContents(t);
  const tr = range.getBoundingClientRect(), br = b.getBoundingClientRect(), dr = d.getBoundingClientRect();
  const lines = new Set([...range.getClientRects()].map((x) => Math.round(x.top))).size;
  return { text: t.textContent, timeRight: tr.right, lines, badgeLeft: br.left, badgeRight: br.right, destLeft: dr.left, destWidth: dr.width };
})"""

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        for path, name, sel in [('', 'home card', ['#dep-body .deps li', '.m', '.ln', '.ds']),
                                ('transport/', 'Transport page', ['#deps .dep', '.t b', '.line', '.dest'])]:
            # the home card shows the next three only: three moments give "зараз", two-digit minutes and clock times
            for width, back in [(w, b) for w in [320, 360, 412] for b in ([0, 29, 70] if not path else [0])]:
                ctx, pg = await page(browser, base, path, width, back)
                await pg.wait_for_selector(sel[0], timeout=8000)
                rows = await pg.evaluate(MEASURE, sel)
                texts = [r['text'] for r in rows]
                tag = f'{name}, {width} px' + (f', {texts[0]}' if not path else '')
                want = {0: lambda: 'зараз' in texts and '1 хв' in texts and (path == '' or ('30 хв' in texts and any(':' in t for t in texts))),
                        29: lambda: '29 хв' in texts and '30 хв' in texts, 70: lambda: all(':' in t for t in texts)}[back]
                check(f'{tag}: the rows show what this run is for', want(), str(texts))
                bad = [(r['text'], round(r['timeRight'] - r['badgeLeft'], 1)) for r in rows if r['timeRight'] > r['badgeLeft'] - 4]
                check(f'{tag}: the time never runs into the line badge (4 px gap at least)', not bad, str(bad))
                check(f'{tag}: the time stays on one line ("30 хв", not "30" over "хв")', all(r['lines'] == 1 for r in rows), str([(r['text'], r['lines']) for r in rows if r['lines'] != 1]))
                lefts = {round(r['badgeLeft']) for r in rows}
                check(f'{tag}: badges start at the same place in every row', max(lefts) - min(lefts) <= 1, str(sorted(lefts)))
                if not path:   # on the Transport page the name follows its own badge (badges differ: X28, SEV 31, RE19)
                    dl = {round(r['destLeft']) for r in rows}
                    check(f'{tag}: destinations start at the same place in every row', max(dl) - min(dl) <= 1, str(sorted(dl)))
                check(f'{tag}: the destination keeps room to be read (≥ 90 px)', min(r['destWidth'] for r in rows) >= 90, str([round(r['destWidth']) for r in rows]))
                check(f'{tag}: no sideways scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= width)
                if OUT:
                    box = await pg.locator(sel[0]).first.evaluate("e => e.closest('.card, section, main').getBoundingClientRect().toJSON()")
                    await pg.screenshot(path=os.path.join(OUT, f'deps-{"home" if not path else "transport"}-{width}-{back}.png'), clip={'x': 0, 'y': box['y'] - 8, 'width': width, 'height': min(box['height'] + 16, 700)})
                await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
