"""«Пригоди шкарпетки», the 2.5D platformer among the games (a side view drawn in 3D as pixel art), in headless Chrome
(WebGL in software).

  python3 tests/hop_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Covers: the card on the games menu and its status, the list of levels (the first open, the rest locked), a phone or
browser without WebGL 2 (a calm note, no play button, no errors), a level that starts: the picture is drawn as pixel art
(a small picture enlarged by whole pixels, covering the screen), the word being collected with its article, the clock;
Telegram's vertical swipes off while playing and on again after; the stick (sideways) and the jump by touch (each half
of the screen) and by keys; the pause (button, Escape, Telegram's Back) with the clock standing still; Back from the
pause to the levels; a level played to the end by the pilot (the real rules, the real page): the stars, the time, the
word with its translation, saved progress, the next level unlocked, the word planted in the garden when every letter was
found; full screen from the pause (the top bar then below Telegram's buttons); every one of the six places drawn.
Exits 1 if a check fails.
"""
import asyncio, functools, http.server, io, json, os, sys, threading
from PIL import Image
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.environ.get('SHOTS', '/tmp')
TG = """window.__back = null; window.__vs = null;
window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '', ready() {}, expand() {}, onEvent() {},
  setHeaderColor() {}, setBackgroundColor() {}, isVersionAtLeast() { return true; },
  CloudStorage: {getItem(k, cb) { setTimeout(() => cb(null, ''), 10); }, setItem(k, v, cb) { cb && cb(null, true); }},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}},
  disableVerticalSwipes() { window.__vs = false; }, enableVerticalSwipes() { window.__vs = true; },
  BackButton: {shown: false, show() { this.shown = true; }, hide() { this.shown = false; }, onClick(f) { window.__back = f; }}}};"""
NO_WEBGL = """(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (k, ...a) { return /webgl/i.test(k) ? null : g.call(this, k, ...a); }; })();"""
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail else ''))
    if not ok: fails.append(name)

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/'

async def context(browser, tg=True, webgl=True, touch=True, dark=False):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 780}, has_touch=touch, color_scheme='dark' if dark else 'light')
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG if tg else '', content_type='text/javascript'))
    await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
    if not webgl: await ctx.add_init_script(NO_WEBGL)
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    return ctx, pg

async def ready(pg, timeout=20000):
    await pg.wait_for_function("window.__hop && window.__hop.engine && window.__hop.state() === 'play' && document.querySelector('#hp-load').hidden", timeout=timeout)

async def painted(pg):   # how much the 3D picture varies (the middle of the screen, without the buttons): an empty canvas is one colour
    im = Image.open(io.BytesIO(await pg.screenshot(clip={'x': 40, 'y': 120, 'width': 310, 'height': 440}))).convert('RGB').resize((62, 88))
    b = im.tobytes()
    return len({(b[i] >> 4, b[i + 1] >> 4, b[i + 2] >> 4) for i in range(0, len(b), 3)})

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None,
            args=['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'])

        # the card on the games menu and the list of levels
        ctx, pg = await context(browser)
        await pg.goto(base + 'igry/'); await pg.wait_for_timeout(500)
        card = await pg.evaluate("""() => { const c = document.querySelector('#h-hop'); return {big: c.querySelector('.big').textContent, sub: c.querySelector('[data-status="hop"]').textContent,
          art: !!c.querySelector('svg.hop-art'), group: c.previousElementSibling.textContent}; }""")
        check('menu: the 2.5D game is a big card under «Для перерви», with its status', card['big'] == 'Пригоди шкарпетки' and card['sub'] == '2.5D-платформер · 6 рівнів' and card['art'] and card['group'] == 'Для перерви', str(card))
        await pg.click('#h-hop'); await pg.wait_for_timeout(500)
        lst = await pg.evaluate("""() => ({title: document.querySelector('#title').textContent, url: location.search, go: document.querySelector('#hp-go').textContent,
          open: [...document.querySelectorAll('.hop-lv')].map(b => !b.disabled), names: [...document.querySelectorAll('.hop-lv b')].map(b => b.textContent),
          lock: document.querySelectorAll('.hop-lv.locked').length, no: document.querySelector('#hp-no').hidden, keys: document.querySelector('#hp-keys').textContent})""")
        check('levels: six, the first open, the rest locked until the one before is done', lst['title'] == 'Пригоди шкарпетки' and lst['url'] == '?tab=hop' and lst['open'] == [True] + [False] * 5 and lst['lock'] == 5
              and lst['names'] == ['Пральня', 'Двір', 'Вулиця', 'Рейн', 'Римський парк', 'Вітряк'] and lst['go'] == 'Почати: Пральня' and lst['no'], str(lst))
        check('levels: how to play, for a touch screen', 'ліворуч або праворуч у лівій половині' in lst['keys'], lst['keys'])
        await pg.screenshot(path=os.path.join(SHOTS, 'hop-list.png'), full_page=True)
        gl = await pg.evaluate("window.__games.hop.canPlay()")
        await ctx.close()

        # no WebGL: a calm note instead of a play button
        ctx, pg = await context(browser, webgl=False)
        await pg.goto(base + 'igry/?tab=hop'); await pg.wait_for_timeout(500)
        st = await pg.evaluate("() => ({no: !document.querySelector('#hp-no').hidden, go: document.querySelector('#hp-go').disabled, lv: document.querySelector('.hop-lv').disabled})")
        check('without WebGL: a note that the game does not run here, nothing to start', st['no'] and st['go'] and st['lv'], str(st))
        await ctx.close()

        if not gl:   # a browser without WebGL even in software: only what such a phone sees can be checked
            print('(no WebGL 2 in this browser: the game checks are skipped)')
            await browser.close()
            print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
            sys.exit(1 if fails else 0)

        # a level
        ctx, pg = await context(browser)
        await pg.goto(base + 'igry/?tab=hop'); await pg.wait_for_timeout(500)
        await pg.click('#hp-go'); await ready(pg)
        await pg.wait_for_timeout(1200)
        st = await pg.evaluate("""() => ({stage: !document.querySelector('#hop-stage').hidden, cls: document.documentElement.classList.contains('hop-on'), vs: window.__vs,
          art: document.querySelector('#hp-word .art').textContent, slots: document.querySelectorAll('#hp-word i').length, hint: !document.querySelector('#hp-hint').hidden,
          touch: document.querySelector('#hop-stage').classList.contains('touch'), back: window.Telegram.WebApp.BackButton.shown, hist: history.state && history.state.hopLevel})""")
        check('level 1: the game covers the page, Telegram\'s swipe-to-close is off', st['stage'] and st['cls'] and st['vs'] is False and st['back'], str(st))
        check('level 1: the word to collect is shown: die and five empty letters; the hint for the first time', st['art'] == 'die' and st['slots'] == 5 and st['hint'] and st['touch'] and st['hist'] == 0, str(st))
        colours = await painted(pg)
        check('the picture is drawn (many colours, not an empty canvas)', colours > 25, colours)
        pix = await pg.evaluate("""() => { const c = document.querySelector('#hp-cv'), r = c.getBoundingClientRect(), s = document.querySelector('#hop-stage').getBoundingClientRect(), i = window.__hop.engine.info();
          return {buf: [c.width, c.height], css: [r.width, r.height], cover: r.left <= s.left + 0.01 && r.top <= s.top + 0.01 && r.right >= s.right - 0.01 && r.bottom >= s.bottom - 0.01, px: i.px, dpr: devicePixelRatio,
            render: getComputedStyle(c).imageRendering}; }""")
        short = min(pix['buf'])
        check('pixel art: a small picture (about 220 pixels on its short side) enlarged by whole pixels with hard edges, covering the screen',
              150 <= short <= 300 and abs(pix['buf'][0] * pix['px'] / pix['dpr'] - pix['css'][0]) < 0.01 and pix['render'] == 'pixelated' and pix['cover'], str(pix))
        await pg.screenshot(path=os.path.join(SHOTS, 'hop-level1.png'))

        # touch: the left half moves (sideways), the right half jumps
        x0 = await pg.evaluate("window.__hop.engine.world.p.x")
        cdp = await ctx.new_cdp_session(pg)
        async def touches(kind, pts):
            await cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': x, 'y': y, 'id': i} for i, (x, y) in pts]})
        await touches('touchStart', [(0, (90, 600))]); await pg.wait_for_timeout(50)
        for k in range(1, 3): await touches('touchMove', [(0, (90 + k * 12, 600))]); await pg.wait_for_timeout(20)
        await pg.wait_for_timeout(250)   # a small push: a slow walk, so a slow software picture cannot run it off the start platform
        mid = await pg.evaluate("({x: window.__hop.engine.world.p.x, joy: document.querySelector('#hp-joy').classList.contains('on')})")
        await touches('touchMove', [(0, (90, 600))]); await pg.wait_for_timeout(350)   # the first finger stays, the stick back in the middle: the sock stops
        await touches('touchStart', [(0, (90, 600)), (1, (320, 600))]); await pg.wait_for_timeout(250)
        jumped = await pg.evaluate("({j: window.__hop.engine.world.jumps, btn: document.querySelector('#hp-jump').classList.contains('on')})")
        await touches('touchEnd', []); await pg.wait_for_timeout(700)
        after = await pg.evaluate("({x: window.__hop.engine.world.p.x, joy: document.querySelector('#hp-joy').classList.contains('on'), hint: document.querySelector('#hp-hint').hidden})")
        check('touch: a finger dragged right on the left half walks right, the stick shows under it', mid['x'] > x0 + 0.2 and mid['joy'], f'{x0} → {mid}')
        check('touch: a second finger on the right jumps, the button shows it; letting go stops', jumped['j'] >= 1 and jumped['btn'] and not after['joy'], f'{jumped} {after}')
        check('the hint goes after the first jump', after['hint'], str(after))

        # keys
        await pg.evaluate("window.__hop.begin(0)"); await pg.wait_for_timeout(500)
        x0 = await pg.evaluate("window.__hop.engine.world.p.x")
        await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(500); await pg.keyboard.up('ArrowRight')
        await pg.keyboard.down('Space'); await pg.wait_for_timeout(120); await pg.keyboard.up('Space'); await pg.wait_for_timeout(300)
        k = await pg.evaluate("({x: window.__hop.engine.world.p.x, j: window.__hop.engine.world.jumps})")
        await pg.keyboard.down('ArrowUp'); await pg.wait_for_timeout(120); await pg.keyboard.up('ArrowUp'); await pg.wait_for_timeout(700)
        k2 = await pg.evaluate("window.__hop.engine.world.jumps")
        check('keys: an arrow runs, the space bar jumps, the up arrow too', k['x'] > x0 + 1 and k['j'] == 1 and k2 == 2, f'{x0} → {k} {k2}')

        # pause: the button, Escape, Telegram's Back; the clock stands still
        await pg.click('#hp-pause'); await pg.wait_for_timeout(300)
        t1 = await pg.evaluate("window.__hop.engine.world.t"); await pg.wait_for_timeout(700)
        st = await pg.evaluate("({t: window.__hop.engine.world.t, box: !document.querySelector('#hp-pausebox').hidden, info: document.querySelector('#hp-pinfo').textContent, state: window.__hop.state()})")
        check('pause: the button stops the game and the clock, says where you are', st['box'] and st['t'] == t1 and st['state'] == 'pause' and st['info'].startswith('1. Пральня'), str(st))
        await pg.screenshot(path=os.path.join(SHOTS, 'hop-pause.png'))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(500)
        st = await pg.evaluate("({t: window.__hop.engine.world.t, box: document.querySelector('#hp-pausebox').hidden, state: window.__hop.state()})")
        check('Escape goes on with the game', st['box'] and st['state'] == 'play' and st['t'] > t1, str(st))
        await pg.evaluate("window.__back()"); await pg.wait_for_timeout(300)
        check('Telegram\'s Back during a level pauses it first', await pg.evaluate("window.__hop.state()") == 'pause')
        await pg.evaluate("window.__back()"); await pg.wait_for_timeout(600)
        st = await pg.evaluate("({stage: document.querySelector('#hop-stage').hidden, cls: document.documentElement.classList.contains('hop-on'), vs: window.__vs, title: document.querySelector('#title').textContent, hist: history.state && history.state.hopLevel})")
        check('… and on the pause, back to the levels; swipes are on again', st['stage'] and not st['cls'] and st['vs'] is True and st['title'] == 'Пригоди шкарпетки' and st['hist'] is None, str(st))

        # the whole level, played by the pilot through the real page; every letter, so the word is planted
        await pg.click('#hp-go'); await ready(pg)
        await pg.evaluate("""async () => { const m = await import('/tests/hop_pilot.mjs'); const e = window.__hop.engine, W = e.world, L = window.__hop.LEVELS[0];
          const d = m.makePilot(W, L.route); e.drive = () => { if (W.p.x > 44) W.got.fill(true); return d(); }; }""")
        await pg.wait_for_function("window.__hop.state() === 'end' && !document.querySelector('#hp-end').hidden", timeout=60000)
        end = await pg.evaluate("""() => ({title: document.querySelector('#hp-etitle').textContent, stars: document.querySelectorAll('#hp-end .hop-stars svg.on').length,
          goals: [...document.querySelectorAll('.hop-goals li')].map(l => l.className), word: document.querySelector('.hop-wordcard b').textContent, uk: document.querySelector('.hop-wordcard small').textContent,
          next: document.querySelector('#hp-next') && document.querySelector('#hp-next').textContent, note: document.querySelector('#hp-endcard .note.small').textContent,
          saved: JSON.parse(localStorage.getItem('dsimya-progress')), garden: window.__games.garden.counts().planted})""")
        check('the end: «Рівень пройдено!», three stars (goal, every letter, in time)', end['title'] == 'Рівень пройдено!' and end['stars'] == 3 and end['goals'] == ['ok', 'ok', 'ok'], str(end))
        check('the end: the word with its article and translation, the way on', end['word'] == 'die Socke' and end['uk'] == 'шкарпетка' and end['next'] == 'Далі: Двір', str(end))
        check('saved: the best time and both extra stars; the word planted in the garden', end['saved']['hop'].get('pralnia', 0) > 0 and end['saved']['hopWord'] == ['pralnia'] and end['saved']['hopFast'] == ['pralnia'] and end['garden'] == 1 and 'посаджено' in end['note'], str(end))
        await pg.screenshot(path=os.path.join(SHOTS, 'hop-end.png'))
        await pg.click('#hp-next'); await ready(pg)
        st = await pg.evaluate("({art: document.querySelector('#hp-word .art').textContent, slots: document.querySelectorAll('#hp-word i').length, t: window.__hop.engine.world.t, hint: document.querySelector('#hp-hint').hidden})")
        check('«Далі»: the next level, das Hemd (four letters), from zero, no hint any more', st['art'] == 'das' and st['slots'] == 4 and st['t'] < 3 and st['hint'], str(st))
        await pg.click('#hp-pause'); await pg.click('#hp-leave'); await pg.wait_for_timeout(600)
        lst = await pg.evaluate("""() => ({open: [...document.querySelectorAll('.hop-lv')].map(b => !b.disabled), small: document.querySelector('.hop-lv small').textContent,
          stars: document.querySelectorAll('.hop-lv')[0].querySelectorAll('.stars svg.on').length, go: document.querySelector('#hp-go').textContent})""")
        check('the list: the first level shows its word, time and stars; the second is open now', lst['open'][:3] == [True, True, False] and lst['small'].startswith('die Socke · 0:') and lst['stars'] == 3 and lst['go'] == 'Далі: Двір', str(lst))
        await pg.click('#backbtn'); await pg.wait_for_timeout(500)
        check('the menu card counts the stars', await pg.text_content('[data-status="hop"]') == 'Пройдено 1 з 6 · ★ 3 з 18')
        await ctx.close()

        # full screen in Telegram: a switch on the pause screen; the top bar of the game stays below Telegram's buttons
        FULL = TG.replace("isVersionAtLeast() { return true; },", """isVersionAtLeast() { return true; }, isFullscreen: false, __ev: {},
  onEvent(n, f) { (this.__ev[n] = this.__ev[n] || []).push(f); },
  requestFullscreen() { setTimeout(() => { this.isFullscreen = true; const r = document.documentElement.style; r.setProperty('--tg-safe-area-inset-top', '30px'); r.setProperty('--tg-content-safe-area-inset-top', '46px');
    (this.__ev.fullscreenChanged || []).forEach(f => f.call(this)); }, 30); },
  exitFullscreen() { setTimeout(() => { this.isFullscreen = false; (this.__ev.fullscreenChanged || []).forEach(f => f.call(this)); }, 30); },""").replace("onEvent() {},", "")
        ctx = await browser.new_context(viewport={'width': 390, 'height': 780}, has_touch=True)
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=FULL, content_type='text/javascript'))
        await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(base + 'igry/?tab=hop'); await pg.wait_for_timeout(400)
        await pg.click('#hp-go'); await ready(pg)
        top0 = await pg.evaluate("document.querySelector('#hp-pause').getBoundingClientRect().top")
        await pg.click('#hp-pause'); await pg.wait_for_timeout(300)
        b = await pg.evaluate("({hidden: document.querySelector('#hp-full').hidden, text: document.querySelector('#hp-full').textContent})")
        check('pause: «На весь екран» where Telegram has full screen', not b['hidden'] and b['text'] == 'На весь екран', str(b))
        await pg.click('#hp-full'); await pg.wait_for_timeout(400)
        b = await pg.evaluate("({text: document.querySelector('#hp-full').textContent, pressed: document.querySelector('#hp-full').getAttribute('aria-pressed'), fs: document.documentElement.classList.contains('tg-fs')})")
        await pg.click('#hp-resume'); await pg.wait_for_timeout(500)
        top = await pg.evaluate("document.querySelector('#hp-pause').getBoundingClientRect().top")
        check('full screen from the pause: the switch says «Звичайний розмір», the page knows', b['text'] == 'Звичайний розмір' and b['pressed'] == 'true' and b['fs'], str(b))
        check('full screen: the pause button moves below the status bar and Telegram\'s buttons', abs(top - top0 - 76) < 1.5 and top >= 86 - 1, f'{top0} → {top}')
        await ctx.close()

        # every place is drawn: its own sky, light and scenery
        ctx, pg = await context(browser)
        await pg.goto(base + 'igry/?tab=hop'); await pg.wait_for_timeout(400)
        await pg.click('#hp-go'); await ready(pg)
        seen = []
        for lv in range(6):
            await pg.evaluate(f"window.__hop.begin({lv}); window.__hop.engine.adaptive = false"); await pg.wait_for_timeout(900)
            seen.append(await painted(pg))
            await pg.screenshot(path=os.path.join(SHOTS, f'hop-place{lv + 1}.png'))
        check('all six places are drawn (many colours each)', all(c > 20 for c in seen), str(seen))
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
