"""The games section /igry/, its place at the bottom of the section menu and the menu's full-screen button, in headless Chrome.

  python3 tests/igry_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Covers: the menu entry (the last group, «Ігри», marks itself on the games page), the full-screen button next to the
close button (only in a Telegram that has full screen; it asks Telegram, follows Telegram's answer, gives the page room
under Telegram's buttons, goes away where Telegram says it cannot),
the laundry clicker (taps, upgrades and their rising cost, income per second, earnings while away with the
8-hour cap, a milestone, Ukrainian plural forms, saving, the two-tap reset, the copy kept in Telegram), the
sorting game (items and bins are consistent, right and wrong answers, the double-points streak, the clock
standing still while a mistake is explained, digit keys, Telegram's Back button, the end of a round with the
mistakes and the record), reopening the game after a reload, Back to the menu, and the layout at 340 px. Der, die, das: the word list (valid articles, rules, compounds), buttons,
swipes (left der, up die, right das, short or downward drags do nothing), arrow keys, double points, a mistake shown
with the right article and its rule while the clock stands still, words got wrong coming back more often, Telegram's
vertical swipes off during a round, the end of a round with the record kept in Telegram. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, re, sys, threading, time
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TG = """window.__cloud = %s; window.__back = null;
window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '', ready() {}, expand() {}, onEvent() {},
  setHeaderColor() {}, setBackgroundColor() {}, isVersionAtLeast() { return true; },
  CloudStorage: {getItem(k, cb) { setTimeout(() => cb(null, window.__cloud[k] || ''), 30); }, setItem(k, v, cb) { window.__cloud[k] = v; cb && cb(null, true); }},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}},
  disableVerticalSwipes() { window.__vs = false; }, enableVerticalSwipes() { window.__vs = true; },
  BackButton: {shown: false, show() { this.shown = true; }, hide() { this.shown = false; }, onClick(f) { window.__back = f; }}}};"""
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

async def context(browser, cloud=None, width=360):
    ctx = await browser.new_context(viewport={'width': width, 'height': 800})
    tg = TG % json.dumps(cloud or {}) if cloud is not None else ''
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg, content_type='text/javascript'))
    await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    return ctx, pg

NUM = "(s) => Number(document.querySelector(s).textContent.replace(/\\s/g, ''))"
async def count(pg): return await pg.evaluate(NUM, '#count')
async def text(pg, s): return (await pg.text_content(s)).strip()
async def put_save(pg, base, save):   # leave the game first: it saves its own state when the page is left
    await pg.goto(base); await pg.evaluate("s => localStorage.setItem('dsimya-kliker', s)", json.dumps(save))
    await pg.goto(base + 'igry/?tab=click'); await pg.wait_for_timeout(400)

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        # the menu: «Ігри» is the last group, with the games as a normal entry
        ctx, pg = await context(browser)
        await pg.goto(base); await pg.wait_for_timeout(300)
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        info = await pg.evaluate("""() => { const g = [...document.querySelectorAll('.drawer nav .drawer-group')].map(x => x.textContent), links = [...document.querySelectorAll('.drawer nav a')];
          const a = links[links.length - 1];
          return {groups: g, last: a.querySelector('b').textContent, href: a.getAttribute('href'), note: a.querySelector('small').textContent,
            secret: !!document.querySelector('.drawer-secret'), full: !!document.querySelector('.fsbtn')}; }""")
        check('menu: «Ігри» is the last group of sections and the games its entry', info['groups'][-1] == 'Ігри' and info['last'] == 'Мініігри' and info['href'].endswith('/igry/') and 'шкарпетки' in info['note'] and not info['secret'], str(info))
        check('menu: no full-screen button in a browser (it would leave full screen on every page)', not info['full'], str(info))
        await pg.click('.drawer nav a[href$="/igry/"]'); await pg.wait_for_url('**/igry/')
        check('menu entry opens the games', await text(pg, 'h1') == 'Мініігри')
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        check('on the games page the entry is marked current', await pg.get_attribute('.drawer nav a[href$="/igry/"]', 'aria-current') == 'page')
        await pg.keyboard.press('Escape'); await ctx.close()

        # full screen in Telegram: the button asks Telegram, Telegram answers with an event
        FULL = TG.replace("isVersionAtLeast() { return true; },", """isVersionAtLeast() { return true; }, isFullscreen: false, __ev: {},
  onEvent(n, f) { (this.__ev[n] = this.__ev[n] || []).push(f); },
  requestFullscreen() { window.__asked = (window.__asked || 0) + 1; setTimeout(() => { if (window.__unsupported) { (this.__ev.fullscreenFailed || []).forEach(f => f.call(this, {error: 'UNSUPPORTED'})); return; }
    this.isFullscreen = true; document.documentElement.style.setProperty('--tg-safe-area-inset-top', '30px'); document.documentElement.style.setProperty('--tg-content-safe-area-inset-top', '46px');
    (this.__ev.fullscreenChanged || []).forEach(f => f.call(this)); }, 30); },
  exitFullscreen() { setTimeout(() => { this.isFullscreen = false; (this.__ev.fullscreenChanged || []).forEach(f => f.call(this)); }, 30); },""").replace("onEvent() {},", "")
        ctx = await browser.new_context(viewport={'width': 360, 'height': 800})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=FULL % '{}', content_type='text/javascript'))
        await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(base + 'pogoda/'); await pg.wait_for_timeout(300)
        await pg.click('#menubtn'); await pg.wait_for_timeout(450)
        geo = await pg.evaluate("""() => { const b = document.querySelector('.fsbtn'), c = document.querySelector('.drawer-close'), box = document.querySelector('.drawer-acts');
          const rb = b.getBoundingClientRect(), rc = c.getBoundingClientRect(), rx = box.getBoundingClientRect(), brand = document.querySelector('.drawer-brand').getBoundingClientRect();
          return {pressed: b.getAttribute('aria-pressed'), label: b.getAttribute('aria-label'), left: rb.right <= rc.left + 1, same: Math.abs(rb.top - rc.top) < 1,
            size: [rb.width, rb.height, rx.height], beside: rb.left > brand.right, capsule: box.classList.contains('two'), bg: getComputedStyle(box).backgroundColor}; }""")
        check('full screen: a button left of the close button, in one capsule, beside the title', geo['pressed'] == 'false' and geo['label'] == 'На весь екран' and geo['left'] and geo['same'] and geo['beside'] and geo['capsule'] and geo['size'][2] >= 44, str(geo))
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'menu-fullscreen-off.png'), clip={'x': 0, 'y': 0, 'width': 330, 'height': 120})
        top0 = await pg.evaluate("parseFloat(getComputedStyle(document.querySelector('.drawer-panel')).paddingTop)")
        await pg.click('.fsbtn'); await pg.wait_for_timeout(700)
        st = await pg.evaluate("""() => ({asked: window.__asked, pressed: document.querySelector('.fsbtn').getAttribute('aria-pressed'), cls: document.documentElement.classList.contains('tg-fs'),
          title: document.querySelector('.fsbtn').title, pad: parseFloat(getComputedStyle(document.querySelector('.drawer-panel')).paddingTop),
          body: parseFloat(getComputedStyle(document.documentElement).paddingTop) + parseFloat(getComputedStyle(document.body).paddingTop),
          turned: getComputedStyle(document.querySelector('.fsbtn path')).transform})""")
        check('full screen: asks Telegram once, then the button shows "back to the usual size"', st['asked'] == 1 and st['pressed'] == 'true' and st['cls'] and st['title'] == 'Звичайний розмір' and st['turned'] != 'none', str(st))
        check('full screen: the menu and the page move down below the status bar and Telegram\'s buttons (30 + 46 px)', abs(st['pad'] - top0 - 76) < 1 and st['body'] >= 76, f"{top0} → {st}")
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'menu-fullscreen-on.png'), clip={'x': 0, 'y': 0, 'width': 330, 'height': 200})
        await pg.click('.fsbtn'); await pg.wait_for_timeout(700)
        st = await pg.evaluate("() => ({pressed: document.querySelector('.fsbtn').getAttribute('aria-pressed'), cls: document.documentElement.classList.contains('tg-fs')})")
        check('full screen: a second tap goes back to the usual size', st['pressed'] == 'false' and not st['cls'], str(st))
        # Telegram keeps full screen from page to page: a new page starts in it
        await pg.evaluate("window.Telegram.WebApp.requestFullscreen()"); await pg.wait_for_timeout(200)   # the menu is still open
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=(FULL % '{}').replace('isFullscreen: false', 'isFullscreen: true'), content_type='text/javascript'))
        await pg.click('.drawer nav a[href$="/transport/"]'); await pg.wait_for_url('**/transport/'); await pg.wait_for_timeout(300)
        st = await pg.evaluate("() => ({cls: document.documentElement.classList.contains('tg-fs')})")
        await pg.click('#menubtn'); await pg.wait_for_timeout(450)
        check('full screen: the next page knows it at once', st['cls'] and await pg.get_attribute('.fsbtn', 'aria-pressed') == 'true', str(st))
        # a Telegram without full screen (a computer): the button goes, the close button stays alone
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=FULL % '{}', content_type='text/javascript'))
        await pg.goto(base + 'pogoda/'); await pg.evaluate("window.__unsupported = true"); await pg.wait_for_timeout(200)
        await pg.click('#menubtn'); await pg.wait_for_timeout(450)
        await pg.click('.fsbtn'); await pg.wait_for_timeout(300)
        st = await pg.evaluate("() => ({btn: !!document.querySelector('.fsbtn'), sep: !!document.querySelector('.drawer-acts .sep'), two: document.querySelector('.drawer-acts').classList.contains('two'), close: !!document.querySelector('.drawer-close')})")
        check('full screen not supported: the button goes, only the close button is left', not st['btn'] and not st['sep'] and not st['two'] and st['close'], str(st))
        await pg.goto(base + 'transport/'); await pg.wait_for_timeout(200); await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        check('full screen not supported: and on the next pages too', not await pg.query_selector('.fsbtn'))
        await ctx.close()

        # clicker
        ctx, pg = await context(browser, width=340)
        await pg.goto(base + 'igry/?tab=click'); await pg.wait_for_timeout(300)
        check('starts empty', await count(pg) == 0 and await text(pg, '#unit') == 'шкарпеток')
        await pg.click('#drum')
        check('one tap: 1 шкарпетка', await count(pg) == 1 and await text(pg, '#unit') == 'шкарпетка')
        for _ in range(14): await pg.click('#drum')
        buttons = await pg.evaluate("() => [...document.querySelectorAll('.buy')].map(b => [b.dataset.id, b.disabled, b.textContent])")
        check('15 taps: only "Порошок" (15) can be bought', await count(pg) == 15 and buttons[0] == ['powder', False, '15'] and all(b[1] for b in buttons[1:]), str(buttons))
        await pg.click('.buy[data-id="powder"]')
        check('bought: 0 left, +2 per tap, next one costs 18', await count(pg) == 0 and await text(pg, '#per-tap') == '+2 за натиск' and await text(pg, '.buy[data-id="powder"]') == '18')
        await pg.click('#drum')
        check('a tap now gives 2 (2 шкарпетки)', await count(pg) == 2 and await text(pg, '#unit') == 'шкарпетки')
        await pg.reload(); await pg.wait_for_timeout(300)
        check('progress kept after reload', await count(pg) == 2 and await text(pg, '#per-tap') == '+2 за натиск')
        check('fits 340 px', await pg.evaluate('document.documentElement.scrollWidth') <= 340)

        # income per second and while away
        hour = int(time.time() * 1000) - 3600 * 1000
        await put_save(pg, base, {'n': 100, 'total': 100, 'lv': {'softener': 2}, 'm': 1, 't': hour})
        c = await count(pg)
        check('an hour away at 2/s: +7 200, said in a message', 7300 <= c <= 7310 and re.search(r'випралось 7\s20\d', await text(pg, '#toast')), f'{c}, {await text(pg, "#toast")}')
        await pg.wait_for_timeout(1300)
        c2 = await count(pg)
        check('income keeps coming every second', 2 <= c2 - c <= 4, f'{c} → {c2}')
        await put_save(pg, base, {'n': 0, 'total': 0, 'lv': {'softener': 2}, 'm': 6, 't': hour - 47 * 3600 * 1000})
        n = await pg.evaluate('__games.state().n')   # shown as "57,6 тис."
        check('two days away: only 8 hours count, big numbers shortened', 57600 <= n <= 57610 and await text(pg, '#count') == '57,6\xa0тис.', f'{n} {await text(pg, "#count")!r}')
        await put_save(pg, base, {'n': 99, 'total': 99, 'lv': {}, 'm': 0, 't': int(time.time() * 1000)})
        await pg.click('#drum'); await pg.wait_for_timeout(100)
        check('milestone at 100', await text(pg, '#toast') == 'Перша сотня шкарпеток!', await text(pg, '#toast'))
        await pg.click('#reset')
        check('reset asks once more first', 'ще раз' in await text(pg, '#reset') and await count(pg) == 100)
        await pg.click('#reset')
        check('second tap resets', await count(pg) == 0 and await text(pg, '#reset') == 'Почати заново')
        await ctx.close()

        # Telegram keeps a copy: a bigger save there wins, and the page writes back
        cloud_save = {'n': 5000, 'total': 9000, 'lv': {'powder': 3}, 'm': 2, 't': int(time.time() * 1000)}
        ctx, pg = await context(browser, cloud={'kliker': json.dumps(cloud_save)})
        await pg.clock.install()
        await pg.goto(base + 'igry/?tab=click'); await pg.clock.run_for(500)
        check('Telegram copy is used on a new device', await count(pg) == 5000 and await text(pg, '#per-tap') == '+4 за натиск')
        await pg.click('#drum'); await pg.clock.run_for(31000)
        saved = json.loads(await pg.evaluate("window.__cloud.kliker"))
        check('progress written back to Telegram', saved['n'] == 5004, str(saved)[:80])
        check('the note says progress follows across devices', 'Telegram' in await text(pg, '#foot'))

        # sorting, opened from the menu
        await pg.click('#backbtn'); await pg.clock.run_for(400)
        check('"Усі ігри" leads to the menu', await pg.is_visible('#view-hub') and await text(pg, 'h1') == 'Мініігри')
        await pg.click('[data-game="sort"]'); await pg.clock.run_for(600)
        items = await pg.evaluate("() => ({items: __games.ITEMS, bins: Object.keys(__games.BINS)})")
        bad = [i for i in items['items'] if i[3] not in items['bins'] or i[1] not in ('der', 'die', 'das') or not i[4]]
        names = [i[2] for i in items['items']]
        per_bin = {b: sum(1 for i in items['items'] if i[3] == b) for b in items['bins']}
        check('items: valid bins and articles, no repeats, every bin used', not bad and len(set(names)) == len(names) and min(per_bin.values()) >= 3, str(per_bin))
        check('start screen without a record', 'Рекорду ще немає' in await text(pg, '#s-best'))
        await pg.click('#s-go'); await pg.clock.run_for(200)
        check('round starts: 60 s, Telegram Back button shown', await text(pg, '#s-time') == '60 с' and await pg.evaluate('Telegram.WebApp.BackButton.shown'))

        async def right():
            b = await pg.evaluate('__games.item()[3]'); await pg.click(f'.binbtn[data-bin="{b}"]'); await pg.clock.run_for(250)
        first = await pg.evaluate('__games.item()[2]')
        await right()
        check('right answer: 1 point, next item', await text(pg, '#s-score') == '1' and await pg.evaluate('__games.item()[2]') != first)
        for _ in range(4): await right()
        check('five in a row: double points from the fifth (1+1+1+1+2)', await text(pg, '#s-score') == '6' and '×2' in await text(pg, '#s-streak'), await text(pg, '#s-score'))

        it = await pg.evaluate('__games.item()')
        wrong = next(b for b in items['bins'] if b != it[3])
        await pg.click(f'.binbtn[data-bin="{wrong}"]'); await pg.clock.run_for(100)
        why = await text(pg, '#s-why'); t1 = await text(pg, '#s-time')
        check('wrong answer: says where and why, shows the right bin', await pg.is_visible('#s-fb') and it[4] in why and 'right' in await pg.get_attribute(f'.binbtn[data-bin="{it[3]}"]', 'class'), why)
        await pg.clock.run_for(5000)
        check('the clock stands still while the mistake is explained', await text(pg, '#s-time') == t1 and await text(pg, '#s-streak') == '', t1)
        await pg.click('#s-next'); await pg.clock.run_for(100)
        check('"Далі" goes on', await pg.is_hidden('#s-fb') and await pg.evaluate('__games.item()[2]') != it[2])
        b = await pg.evaluate('__games.item()[3]'); key = str(['rest', 'papier', 'gelb', 'glas', 'pfand', 'schad'].index(b) + 1)
        await pg.keyboard.press(key); await pg.clock.run_for(250)
        check('digit keys pick a bin', await text(pg, '#s-score') == '7')
        check('fits 340 px while playing', await pg.evaluate('document.documentElement.scrollWidth') <= 360)

        await pg.clock.run_for(61000)
        check('time up: score, accuracy, the mistake to learn', await pg.is_visible('#s-end') and await text(pg, '#s-result') == '7 балів' and it[2] in await text(pg, '#s-miss') and '6 з 7' in await text(pg, '#s-sum'), await text(pg, '#s-sum'))
        check('new record noted and kept, in Telegram too', await pg.is_visible('#s-record') and await pg.evaluate("localStorage.getItem('dsimya-sort-best')") == '7' and await pg.evaluate("window.__cloud.sort_best") == '7')
        check('Back button stays after the round (it leads to the menu)', await pg.evaluate('Telegram.WebApp.BackButton.shown'))
        await pg.click('#s-again'); await pg.clock.run_for(200)
        await pg.evaluate('window.__back()'); await pg.clock.run_for(100)
        check("Telegram's Back button leaves the round", await pg.is_visible('#s-start') and await pg.is_hidden('#s-play'))
        await pg.reload(); await pg.clock.run_for(600)
        check('reopens on the sorting game with the record', await pg.is_visible('#view-sort') and '7 балів' in await text(pg, '#s-best'))
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'igry-sort.png'))
        await pg.evaluate('window.__back()'); await pg.clock.run_for(400)
        check("Telegram's Back on a game's first screen goes to the menu, then hides", await pg.is_visible('#view-hub') and not await pg.evaluate('Telegram.WebApp.BackButton.shown') and '?tab' not in pg.url)
        check('the menu shows the sorting record', 'Рекорд: 7 балів' in await text(pg, '[data-status="sort"]'), await text(pg, '[data-status="sort"]'))
        await ctx.close()

        # der, die, das
        ctx, pg = await context(browser, cloud={}, width=340)
        await ctx.add_init_script("if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dsimya-artikel-miss', JSON.stringify({Gleis: 4})); sessionStorage.setItem('seeded', '1'); }")
        await pg.clock.install()
        await pg.goto(base + 'igry/'); await pg.clock.run_for(400)
        check('the menu fits 340 px', await pg.evaluate('document.documentElement.scrollWidth') <= 340 and await pg.is_visible('#view-hub'))
        await pg.click('[data-game="art"]'); await pg.clock.run_for(600); await pg.wait_for_timeout(500)
        check('the articles fit 340 px', await pg.evaluate('document.documentElement.scrollWidth') <= 340 and await pg.is_visible('#view-art') and await text(pg, 'h1') == 'Артиклі')
        words = await pg.evaluate('__games.WORDS'); rules = await pg.evaluate('Object.keys(__games.RULES)')
        names = [w[0] for w in words]
        bad = [w for w in words if w[1] not in ('der', 'die', 'das') or not w[2] or (w[3] and w[3] not in rules) or (w[3] == 'comp' and not (w[4] or '').startswith(w[1] + ' '))
               or w[0] not in w[5] or not w[5].endswith(('.', '?'))]
        per = {a: sum(1 for w in words if w[1] == a) for a in ('der', 'die', 'das')}
        check('words: 100+, valid articles and rules, compounds take the last word, an example with the word, no repeats, balanced', len(words) >= 100 and not bad and len(set(names)) == len(names) and min(per.values()) >= 30, f'{per} {bad[:3]}')
        check('in Germany: der Prospekt', next(w for w in words if w[0] == 'Prospekt')[1] == 'der')
        check('start: a word to repeat is announced', 'На повторення: 1 слово' in await text(pg, '#a-learn'))
        share = await pg.evaluate("(() => { let n = 0; for (let i = 0; i < 3000; i++) if (__games.pickWord() === 'Gleis') n++; return n / 3000; })()")
        check('a word got wrong comes back far more often (weight 13 instead of 1)', 0.07 < share < 0.17, share)

        await pg.click('#a-go'); await pg.clock.run_for(200)
        check('round starts: 60 s, Back shown, Telegram vertical swipes off', await text(pg, '#a-time') == '60 с' and await pg.evaluate('Telegram.WebApp.BackButton.shown') and await pg.evaluate('window.__vs') is False)
        W = '__games.word()'
        leans = []
        async def answer(how='button'):
            art = await pg.evaluate(W + '[1]')
            if how == 'button': await pg.click(f'.artbtn[data-art="{art}"]')
            elif how == 'key': await pg.keyboard.press({'der': 'ArrowLeft', 'die': 'ArrowUp', 'das': 'ArrowRight'}[art])
            else:
                box = await pg.locator('#a-card').bounding_box(); cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
                dx, dy = {'der': (-130, 0), 'die': (0, -120), 'das': (130, 0)}[art]
                await pg.mouse.move(cx, cy); await pg.mouse.down()
                for i in range(1, 9): await pg.mouse.move(cx + dx * i / 8, cy + dy * i / 8)
                leans.append((art, await pg.evaluate("document.getElementById('a-card').className")))
                await pg.mouse.up()
            await pg.clock.run_for(300)
        first = await pg.evaluate(W + '[0]')
        await answer('button')
        check('right article by button: 1 point, next word', await text(pg, '#a-score') == '1' and await pg.evaluate(W + '[0]') != first)
        check('"1 бал", not "1 балів"', await text(pg, '#a-pw') == 'бал')
        await answer('swipe')
        check('right article by swipe (left der, up die, right das)', await text(pg, '#a-score') == '2', await text(pg, '#a-score'))
        check('while swiping, the card shows the article it leans to', leans and all('lean-' + a in c for a, c in leans), str(leans))
        await answer('key')
        check('arrow keys pick the article', await text(pg, '#a-score') == '3')
        await answer('swipe'); await answer('button')
        check('five in a row: double points from the fifth (1+1+1+1+2)', await text(pg, '#a-score') == '6' and '×2' in await text(pg, '#a-streak'), await text(pg, '#a-score'))

        # a short drag and a drag downwards answer nothing
        w0 = await pg.evaluate(W + '[0]')
        box = await pg.locator('#a-card').bounding_box(); cx, cy = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
        await pg.mouse.move(cx, cy); await pg.mouse.down(); await pg.mouse.move(cx + 25, cy, steps=4); await pg.mouse.up(); await pg.clock.run_for(400)
        await pg.mouse.move(cx, cy); await pg.mouse.down(); await pg.mouse.move(cx + 10, cy + 140, steps=6); await pg.mouse.up(); await pg.clock.run_for(400)
        check('short or downward drags answer nothing, the card comes back', await pg.evaluate(W + '[0]') == w0 and await text(pg, '#a-score') == '6' and not await pg.evaluate("document.getElementById('a-card').style.transform"))

        wrong_word = await pg.evaluate(W)
        wrong = next(a for a in ('der', 'die', 'das') if a != wrong_word[1])
        await pg.click(f'.artbtn[data-art="{wrong}"]'); await pg.clock.run_for(100)
        why = await text(pg, '#a-why'); t1 = await text(pg, '#a-time')
        check('mistake: the right article with the word and its rule or "запамʼятай"', wrong_word[1] + ' ' + wrong_word[0] in why and ('.' in why) and 'right' in await pg.get_attribute(f'.artbtn[data-art="{wrong_word[1]}"]', 'class'), why)
        await pg.clock.run_for(4000)
        check('the clock stands still while the mistake is shown, streak reset', await text(pg, '#a-time') == t1 and await text(pg, '#a-streak') == '')
        miss = json.loads(await pg.evaluate("localStorage.getItem('dsimya-artikel-miss')"))
        check('the word is marked to come back', miss.get(wrong_word[0]) == min(4, 2 + (4 if wrong_word[0] == 'Gleis' else 0)), str(miss))
        await pg.click('#a-next'); await pg.clock.run_for(100)
        check('"Далі" goes on', await pg.is_hidden('#a-fb') and await pg.evaluate(W + '[0]') != wrong_word[0])
        await pg.evaluate("(() => { const n = document.getElementById('a-noun'); n.textContent = 'Ausländerbehörde'; n.className = 'noun xlong'; })()")
        check('the longest word fits the card at 340 px', await pg.evaluate("(() => { const n = document.getElementById('a-noun'); return n.scrollWidth <= n.clientWidth + 1; })()") and await pg.evaluate('document.documentElement.scrollWidth') <= 340)
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'igry-art.png'))

        await pg.clock.run_for(61000)
        check('time up: score, accuracy, the word to learn with its article', await pg.is_visible('#a-end') and await text(pg, '#a-result') == '6 балів' and wrong_word[1] + ' ' + wrong_word[0] in await text(pg, '#a-miss') and '5 з 6' in await text(pg, '#a-sum'), await text(pg, '#a-sum'))
        check('record kept on the device and in Telegram', await pg.is_visible('#a-record') and await pg.evaluate("localStorage.getItem('dsimya-artikel-best')") == '6' and await pg.evaluate('window.__cloud.artikel_best') == '6')
        check('after the round: Telegram vertical swipes on again', await pg.evaluate('window.__vs') is True)
        prog = json.loads(await pg.evaluate("localStorage.getItem('dsimya-progress')"))
        check('the round counts for the skins: right answers and the best streak', prog['artRight'] == 5 and prog['artStreak'] == 5, str(prog))
        await pg.click('#a-again'); await pg.clock.run_for(200)
        await pg.evaluate('window.__back()'); await pg.clock.run_for(100)
        check("Telegram's Back button leaves the round", await pg.is_visible('#a-start') and await pg.is_hidden('#a-play') and await pg.evaluate('window.__vs') is True)
        await pg.click('#a-go'); await pg.clock.run_for(200)
        check('during a round "Усі ігри" stays on screen', await pg.is_visible('#backbtn'))
        await pg.click('#backbtn'); await pg.clock.run_for(600)
        check('"Усі ігри" ends the round', await pg.evaluate('__games.artRound()') is None and not await pg.evaluate("document.body.classList.contains('playing')") and await pg.is_visible('#view-hub'))
        await pg.click('[data-game="art"]'); await pg.clock.run_for(600)
        check('outside a signed Telegram session the word-of-the-day switch explains itself', await pg.is_disabled('#d-sw') and 'через бота' in await text(pg, '#d-state'))
        await ctx.close()

        # the word of the day: switched on from the articles tab (POST /reminders, kind=wort); ?tab=art opens the tab
        ctx = await browser.new_context(viewport={'width': 360, 'height': 800})
        tg2 = (TG % '{}').replace("initData: ''", "initData: 'user=%7B%22id%22%3A1%7D&hash=x'")
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg2, content_type='text/javascript'))
        posts = []
        async def rem(route):
            body = route.request.post_data or ''; posts.append(body)
            on = 'name="action"\r\n\r\non' in body
            await route.fulfill(json={'ok': True, 'on': on})
        await ctx.route('**/*.workers.dev/reminders', rem)
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(base + 'igry/?tab=art'); await pg.wait_for_timeout(700)
        check('?tab=art opens the articles straight away (the bot button), with Back to the menu', await pg.is_visible('#view-art') and await text(pg, 'h1') == 'Артиклі' and await pg.evaluate('Telegram.WebApp.BackButton.shown'))
        await pg.wait_for_function("!document.getElementById('d-sw').disabled")
        check('word of the day: status asked with kind=wort, switch off', any('wort' in b and 'status' in b for b in posts) and await pg.get_attribute('#d-sw', 'aria-checked') == 'false')
        await pg.click('#d-sw'); await pg.wait_for_timeout(300)
        check('word of the day: switched on, says today\'s word is in the chat', await pg.get_attribute('#d-sw', 'aria-checked') == 'true' and 'Сьогоднішнє слово' in await text(pg, '#d-state') and 'name="action"\r\n\r\non' in posts[-1])
        await pg.click('#d-sw'); await pg.wait_for_timeout(300)
        check('word of the day: switched off again', await pg.get_attribute('#d-sw', 'aria-checked') == 'false' and await text(pg, '#d-state') == 'Вимкнено')
        await ctx.close()
        await browser.close()

asyncio.run(main())
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
