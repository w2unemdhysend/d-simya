"""The secret games section /igry/ and its quiet link in the section menu, in headless Chrome.

  python3 tests/igry_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Covers: the menu link (bottom-left, no label, not among the sections, marks itself on the games page),
the laundry clicker (taps, upgrades and their rising cost, income per second, earnings while away with the
8-hour cap, a milestone, Ukrainian plural forms, saving, the two-tap reset, the copy kept in Telegram), the
sorting game (items and bins are consistent, right and wrong answers, the double-points streak, the clock
standing still while a mistake is explained, digit keys, Telegram's Back button, the end of a round with the
mistakes and the record), the remembered tab, and the layout at 340 px. Der, die, das: the word list (valid articles, rules, compounds), buttons,
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
    await pg.goto(base + 'igry/'); await pg.wait_for_timeout(400)

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        # the menu: a quiet icon bottom-left
        ctx, pg = await context(browser)
        await pg.goto(base); await pg.wait_for_timeout(300)
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        info = await pg.evaluate("""() => { const a = document.querySelector('.drawer-secret'), p = document.querySelector('.drawer-panel');
          const r = a.getBoundingClientRect(), q = p.getBoundingClientRect();
          return {href: a.getAttribute('href'), label: a.getAttribute('aria-label'), text: a.textContent.trim(), inList: !!a.closest('nav'),
            left: r.left - q.left, bottom: q.bottom - r.bottom, w: r.width, h: r.height, opacity: getComputedStyle(a).opacity}; }""")
        check('menu: games link exists, no visible label, not among the sections', info['href'].endswith('/igry/') and info['label'] == 'Мініігри' and not info['text'] and not info['inList'], str(info))
        check('menu: bottom-left corner, 44 px target, quiet', info['left'] < 30 and info['bottom'] < 70 and info['w'] >= 44 and info['h'] >= 44 and float(info['opacity']) < 0.6, str(info))
        await pg.click('.drawer-secret'); await pg.wait_for_url('**/igry/')
        check('menu link opens the games', await text(pg, 'h1') == 'Мініігри')
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        check('on the games page the link is marked current', await pg.get_attribute('.drawer-secret', 'aria-current') == 'page')
        await pg.keyboard.press('Escape'); await ctx.close()

        # clicker
        ctx, pg = await context(browser, width=340)
        await pg.goto(base + 'igry/'); await pg.wait_for_timeout(300)
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
        await pg.goto(base + 'igry/'); await pg.clock.run_for(500)
        check('Telegram copy is used on a new device', await count(pg) == 5000 and await text(pg, '#per-tap') == '+4 за натиск')
        await pg.click('#drum'); await pg.clock.run_for(31000)
        saved = json.loads(await pg.evaluate("window.__cloud.kliker"))
        check('progress written back to Telegram', saved['n'] == 5004, str(saved)[:80])
        check('the note says progress follows across devices', 'Telegram' in await text(pg, '#foot'))

        # sorting
        await pg.click('#tab-sort'); await pg.clock.run_for(600)
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
        check('Back button hidden after the round', not await pg.evaluate('Telegram.WebApp.BackButton.shown'))
        await pg.click('#s-again'); await pg.clock.run_for(200)
        await pg.evaluate('window.__back()'); await pg.clock.run_for(100)
        check("Telegram's Back button leaves the round", await pg.is_visible('#s-start') and await pg.is_hidden('#s-play'))
        await pg.reload(); await pg.clock.run_for(600)
        check('reopens on the sorting tab with the record', await pg.get_attribute('#tab-sort', 'aria-selected') == 'true' and '7 балів' in await text(pg, '#s-best'))
        await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), 'igry-sort.png'))
        await ctx.close()

        # der, die, das
        ctx, pg = await context(browser, cloud={}, width=340)
        await ctx.add_init_script("if (!sessionStorage.getItem('seeded')) { localStorage.setItem('dsimya-artikel-miss', JSON.stringify({Gleis: 4})); sessionStorage.setItem('seeded', '1'); }")
        await pg.clock.install()
        await pg.goto(base + 'igry/'); await pg.clock.run_for(400)
        await pg.click('#tab-art'); await pg.clock.run_for(600); await pg.wait_for_timeout(500)
        check('three tabs fit 340 px', await pg.evaluate('document.documentElement.scrollWidth') <= 340 and await pg.is_visible('#view-art'))
        words = await pg.evaluate('__games.WORDS'); rules = await pg.evaluate('Object.keys(__games.RULES)')
        names = [w[0] for w in words]
        bad = [w for w in words if w[1] not in ('der', 'die', 'das') or not w[2] or (len(w) > 3 and w[3] not in rules) or (len(w) > 3 and w[3] == 'comp' and not w[4].startswith(w[1] + ' '))]
        per = {a: sum(1 for w in words if w[1] == a) for a in ('der', 'die', 'das')}
        check('words: 100+, valid articles and rules, compounds take the last word, no repeats, balanced', len(words) >= 100 and not bad and len(set(names)) == len(names) and min(per.values()) >= 30, f'{per} {bad[:3]}')
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
        check('after the round: Back hidden, Telegram vertical swipes on again', not await pg.evaluate('Telegram.WebApp.BackButton.shown') and await pg.evaluate('window.__vs') is True)
        await pg.click('#a-again'); await pg.clock.run_for(200)
        await pg.evaluate('window.__back()'); await pg.clock.run_for(100)
        check("Telegram's Back button leaves the round", await pg.is_visible('#a-start') and await pg.is_hidden('#a-play') and await pg.evaluate('window.__vs') is True)
        await pg.click('#a-go'); await pg.clock.run_for(200)
        await pg.click('#tab-click'); await pg.clock.run_for(600)
        check('switching tabs ends the round', await pg.evaluate('__games.artRound()') is None and not await pg.evaluate("document.body.classList.contains('playing')"))
        await ctx.close()
        await browser.close()

asyncio.run(main())
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
