"""The games menu and the five German games, played through in headless Chrome, plus the laundry's skins.

  python3 tests/games_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Covers: the menu (like the home screen: the garden card, German games, games for a break, a status line on every tile,
a game opens as its own screen, the phone's Back and «Усі ігри» return, an unknown ?tab= shows the menu); the word
garden (planting, a watering round with a right and a wrong answer, the plants' steps and next days, the plant card);
sentences (a wrong order says how far it is right, the answer after two tries, a right one with its rule); numbers by
ear (the keypad with the comma for prices, a right and a wrong answer, the physical keyboard, the summary with the
mistakes); conversations (a wrong answer gets a reaction and a hint and is crossed out, a scene without mistakes earns
a star); memory (a wrong pair turns back, found pairs stay open and plant their words, the record for eight pairs);
skins (earned in another game with a toast and "new" on the menu, worn, a tap sends its emoji up, bought with socks
after a second tap, too few socks, how to earn a locked one, kept after a reload); progress kept in Telegram; every
screen fits 340 px. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TG = """window.__cloud = {}; window.__back = null;
window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '', ready() {}, expand() {}, onEvent() {},
  setHeaderColor() {}, setBackgroundColor() {}, isVersionAtLeast() { return true; },
  CloudStorage: {getItem(k, cb) { setTimeout(() => cb(null, window.__cloud[k] || ''), 30); }, setItem(k, v, cb) { window.__cloud[k] = v; cb && cb(null, true); }},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}},
  disableVerticalSwipes() {}, enableVerticalSwipes() {},
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

async def text(pg, s): return (await pg.text_content(s)).strip()
async def fits(pg): return await pg.evaluate('document.documentElement.scrollWidth') <= 340
async def prog(pg): return await pg.evaluate("JSON.parse(localStorage.getItem('dsimya-progress') || '{}')")
async def shot(pg, name): await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), name), full_page=True)

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        ctx = await browser.new_context(viewport={'width': 340, 'height': 760})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG, content_type='text/javascript'))
        await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
        # what would be played: the clip's address (or the blob fetched ahead)
        await ctx.add_init_script("window.__played = []; const P = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__played.push(this.src); return P.call(this).catch(() => {}); };")
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        G = 'window.__games'

        # ---------------- the menu ----------------
        await pg.goto(base + 'igry/'); await pg.wait_for_timeout(700)
        tiles = await pg.evaluate("[...document.querySelectorAll('#view-hub [data-game]')].map(a => [a.dataset.game, (a.querySelector('[data-status]') || {}).textContent || ''])")
        check('menu: the garden card and seven tiles, each with a status line', [t[0] for t in tiles] == ['garten', 'art', 'memory', 'satz', 'zahlen', 'dialog', 'click', 'sort'] and all(t[1] for t in tiles[1:]), str(tiles))
        check('menu: an empty garden invites to plant', await text(pg, '#h-g-big') == 'Посади перші слова' and await pg.evaluate("document.querySelectorAll('#h-g-bed svg').length") == 5)
        check('menu: groups «Німецька» and «Для перерви», title «Мініігри», no Back', await pg.evaluate("[...document.querySelectorAll('#view-hub .group')].map(g => g.textContent).join('|')") == 'Німецька|Для перерви'
              and await text(pg, 'h1') == 'Мініігри' and not await pg.evaluate('Telegram.WebApp.BackButton.shown') and await pg.is_hidden('#backbtn'))
        check('menu: fits 340 px', await fits(pg))
        await shot(pg, 'games-menu.png')
        await pg.goto(base + 'igry/?tab=nonsense'); await pg.wait_for_timeout(500)
        check('an unknown ?tab= shows the menu', await pg.is_visible('#view-hub'))

        # ---------------- the word garden ----------------
        await pg.click('#h-g'); await pg.wait_for_timeout(500)
        check('a game opens as its own screen: title, «Усі ігри», Telegram Back, ?tab= in the address', await text(pg, 'h1') == 'Сад слів' and await pg.is_visible('#backbtn')
              and await pg.evaluate('Telegram.WebApp.BackButton.shown') and pg.url.endswith('?tab=garten'))
        await pg.go_back(); await pg.wait_for_timeout(500)
        check("the phone's Back returns to the menu", await pg.is_visible('#view-hub') and await text(pg, 'h1') == 'Мініігри')
        await pg.click('#h-g'); await pg.wait_for_timeout(500)
        await pg.click('#g-plant'); await pg.wait_for_timeout(300)
        check('garden: five words planted, all want water today', await pg.evaluate("document.querySelectorAll('.gplant').length") == 5 and 'Полити 5 рослин' in await text(pg, '#g-water') and 'Посаджено 5 слів' in await text(pg, '#toast'))
        await pg.click('#g-water'); await pg.wait_for_timeout(200)
        check('garden: a watering round of five', await text(pg, '#g-step') == '1 з 5' and await pg.evaluate("document.querySelectorAll('.gopt').length") == 4)
        await pg.click('.gopt[data-ok="1"]'); await pg.wait_for_timeout(1200)
        await pg.click('.gopt[data-ok="0"]'); await pg.wait_for_timeout(200)
        check('garden: a wrong answer shows the word with its article; it comes back tomorrow', await pg.is_visible('#g-fb') and 'завтра' in await text(pg, '#g-why') and await pg.evaluate("document.querySelector('.gopt.wrong') && document.querySelector('.gopt.right') ? 1 : 0") == 1)
        await pg.click('#g-next'); await pg.wait_for_timeout(200)
        for _ in range(3): await pg.click('.gopt[data-ok="1"]'); await pg.wait_for_timeout(1150)
        check('garden: the round ends with the count', await pg.is_visible('#g-end') and 'Правильно 4 з 5' in await text(pg, '#g-end'), await text(pg, '#g-end'))
        steps = await pg.evaluate("(() => { const w = JSON.parse(localStorage.getItem('dsimya-garten')).w; return Object.values(w).map(v => v[0]).sort().join(''); })()")
        days = await pg.evaluate("(() => { const w = JSON.parse(localStorage.getItem('dsimya-garten')).w, t = Math.round(Date.parse(new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Berlin'}).format(new Date()) + 'T00:00:00Z') / 86400000); return Object.values(w).map(v => v[1] - t).sort().join(''); })()")
        check('garden: right answers grow a step and rest two days, the wrong one starts again tomorrow', steps == '12222' and days == '12222', f'{steps} {days}')
        await pg.click('#g-back'); await pg.wait_for_timeout(200)
        await pg.click('.gplant'); await pg.wait_for_timeout(200)
        check('garden: a plant opens its card with the word and when to water', await pg.is_visible('#g-sheet') and await text(pg, '#g-sheet-w') and 'Поливати' in await text(pg, '#g-sheet-when'))
        await pg.click('#g-sheet-close'); await pg.wait_for_timeout(100)
        check('garden: the card closes; fits 340 px', await pg.is_hidden('#g-sheet') and await fits(pg))
        await pg.click('#backbtn'); await pg.wait_for_timeout(500)
        check('menu: the garden card shows the watered garden', await text(pg, '#h-g-big') == 'Сад полито' and 'garten' not in pg.url, await text(pg, '#h-g-big'))

        # ---------------- sentences ----------------
        await pg.click('[data-game="satz"]'); await pg.wait_for_timeout(500)
        S = G + ".game('satz').peek()"
        want = await pg.evaluate(f"import('./data/satz.js').then(m => m.bare({S}.ok[0]).split(' '))")
        async def build(words):
            for w in words:
                await pg.click(f'#z-pool .zw >> text="{w}"')
        await build(list(reversed(want)))
        await pg.click('#z-check'); await pg.wait_for_timeout(100)
        check('sentences: a wrong order is not accepted and says so', 'zmsg bad' in await pg.get_attribute('#z-msg', 'class') and await pg.is_hidden('#z-show'), await text(pg, '#z-msg'))
        await pg.click('#z-check'); await pg.wait_for_timeout(100)
        check('sentences: after the second try the answer can be shown', await pg.is_visible('#z-show'))
        await pg.click('#z-line .zw'); await pg.wait_for_timeout(50)
        check('sentences: a card in the line goes back to the words', await pg.evaluate("document.querySelectorAll('#z-pool .zw').length") == 1 and await pg.is_disabled('#z-check'))
        await pg.click('#z-show'); await pg.click('#z-check'); await pg.wait_for_timeout(100)
        check('sentences: solved: the sentence, its rule, the speaker', 'Правильно' in await text(pg, '#z-msg') and await pg.is_visible('#z-rule') and 'Правило' in await text(pg, '#z-rule') and await pg.is_visible('#z-say'))
        await pg.click('#z-check'); await pg.wait_for_timeout(200)   # "Наступне речення"
        want = await pg.evaluate(f"import('./data/satz.js').then(m => m.bare({S}.ok[0]).split(' '))")
        await build(want[:1] + list(reversed(want[1:]))) if len(want) > 2 else await build(want)
        if len(want) > 2:
            await pg.click('#z-check'); await pg.wait_for_timeout(100)
            check('sentences: says how many words from the start are right', 'Перші 1 слово' in await text(pg, '#z-msg') or 'Перші' in await text(pg, '#z-msg'), await text(pg, '#z-msg'))
            check('sentences: the cards after that are marked', await pg.evaluate("document.querySelectorAll('#z-line .zw.off').length") >= 1)
            for _ in range(len(want)): await pg.click('#z-line .zw')
            await build(want)
        await pg.click('#z-check'); await pg.wait_for_timeout(100)
        check('sentences: a right order by hand is accepted', 'zmsg ok' in await pg.get_attribute('#z-msg', 'class'))
        check('sentences: two solved, shown on the level chip; fits 340 px', len((await prog(pg))['satz']) == 2 and '2/10' in await text(pg, '[data-lv="1"]') and await fits(pg), await text(pg, '[data-lv="1"]'))
        await shot(pg, 'games-satz.png')

        # ---------------- numbers by ear ----------------
        await pg.click('#backbtn'); await pg.wait_for_timeout(400)
        await pg.click('[data-game="zahlen"]'); await pg.wait_for_timeout(400)
        Z = G + ".game('zahlen').peek()"
        await pg.click('[data-kind="preis"]'); await pg.click('#n-go'); await pg.wait_for_timeout(200)
        keys = await pg.evaluate("[...document.querySelectorAll('#n-pad .key')].map(k => k.dataset.key).join(' ')")
        check('numbers: prices get a comma key', keys == '1 2 3 4 5 6 7 8 9 , 0 ⌫', keys)
        it = await pg.evaluate(Z)
        for ch in it['accept'][0]: await pg.click(f'#n-pad .key[data-key="{ch}"]')
        check('numbers: the typed digits show', await text(pg, '#n-in') == it['accept'][0])
        n0 = await pg.evaluate('window.__played.length'); await pg.click('#n-say')
        check('numbers: «Слухати ще раз» plays it again', await pg.evaluate('window.__played.length') == n0 + 1)
        await pg.click('#n-ok'); await pg.wait_for_timeout(100)
        check('numbers: a right price, with the words said', 'nshow good' in await pg.get_attribute('#n-show', 'class') and it['say'] in await text(pg, '#n-res') and await text(pg, '#n-ok') == 'Далі')
        await pg.click('#n-ok'); await pg.wait_for_timeout(100)
        wrong = await pg.evaluate(Z)
        await pg.click('#n-pad .key[data-key="9"]'); await pg.click('#n-pad .key[data-key="⌫"]'); await pg.click('#n-pad .key[data-key="1"]')
        await pg.click('#n-ok'); await pg.wait_for_timeout(100)
        check('numbers: a wrong answer shows the right one; ⌫ erases', 'nshow bad' in await pg.get_attribute('#n-show', 'class') and wrong['show'] in await text(pg, '#n-res') and await text(pg, '#n-in') == '1')
        await pg.keyboard.press('Enter')
        for _ in range(8):
            it = await pg.evaluate(Z)
            await pg.keyboard.type(it['accept'][0]); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(50)
            await pg.keyboard.press('Enter'); await pg.wait_for_timeout(50)
        check('numbers: the keyboard works; the summary lists the mistake', await pg.is_visible('#n-end') and '9 з 10' in await text(pg, '#n-end') and wrong['show'] in await text(pg, '#n-end .miss'), await text(pg, '#n-end'))
        P = await prog(pg)
        check('numbers: right answers and the best streak counted', P['zahlRight'] == 9 and P['zahlStreak'] == 8, str(P))
        check('numbers: fits 340 px', await fits(pg))

        # ---------------- conversations ----------------
        await pg.click('#backbtn'); await pg.wait_for_timeout(400)
        await pg.click('[data-game="dialog"]'); await pg.wait_for_timeout(400)
        D = G + ".game('dialog').peek()"
        await pg.click('[data-scene="baeckerei"]'); await pg.wait_for_timeout(300)
        check('conversation: the other person speaks first', await pg.evaluate("document.querySelectorAll('#d-chat .msg.npc').length") == 1 and await pg.evaluate("document.querySelectorAll('#d-ans .opt').length") == 3)
        said = await pg.evaluate("import('../audio/index.js').then(m => [m.AUDIO['Guten Morgen! Was darf es sein?'], window.__played.at(-1)])")
        check('conversation: … and the line is heard (its recorded clip)', said[0] and (said[1].endswith('/audio/' + said[0]) or said[1].startswith('blob:')), str(said))
        await pg.click('#d-ans .opt[data-a="1"]'); await pg.wait_for_timeout(600)
        check('conversation: a wrong answer: crossed out, a reaction, a hint, the option off', await pg.is_visible('#d-hint') and await pg.evaluate("document.querySelectorAll('#d-chat .msg.wrongmsg').length") == 1
              and await pg.evaluate("document.querySelectorAll('#d-chat .msg.npc').length") == 2 and await pg.is_disabled('#d-ans .opt[data-a="1"]'), await text(pg, '#d-hint'))
        await pg.click('#d-chat .tr'); await pg.wait_for_timeout(50)
        check('conversation: «Переклад» shows the Ukrainian', await pg.is_visible('#d-chat .uk'))
        async def play_scene():
            n = await pg.evaluate("import('./data/dialog.js').then(m => m.SCENES.find(s => s.id === 'baeckerei').steps.length)")
            for k in range(n):
                await pg.wait_for_function(f"{D} && {D}.step === {k} && document.querySelector('#d-ans .opt[data-a=\"0\"]')", timeout=15000)
                await pg.click('#d-ans .opt[data-a="0"]')
            await pg.wait_for_selector('.dend', timeout=15000)
        await play_scene()
        P = await prog(pg)
        check('conversation: the scene is done, without a star (one mistake)', 'baeckerei' in P['dialog'] and 'baeckerei' not in P['dialogPerfect'] and 'Помилок: 1' in await text(pg, '.dend'), await text(pg, '.dend'))
        await pg.click('[data-replay]'); await play_scene()
        P = await prog(pg)
        check('conversation: again without mistakes: a star', 'baeckerei' in P['dialogPerfect'] and 'Без жодної помилки' in await text(pg, '.dend'))
        check('conversation: fits 340 px', await fits(pg))
        await shot(pg, 'games-dialog.png')
        await pg.click('[data-list]'); await pg.wait_for_timeout(100)
        check('conversation: the scene list shows the star', await text(pg, '[data-scene="baeckerei"] .dst') == '⭐')

        # ---------------- memory ----------------
        await pg.click('#backbtn'); await pg.wait_for_timeout(400)
        await pg.click('[data-game="memory"]'); await pg.wait_for_timeout(400)
        M = G + ".game('memory').peek()"
        planted0 = await pg.evaluate(G + '.garden.counts().planted')
        async def solve(mistake):
            cards = (await pg.evaluate(M))['cards']
            if mistake:
                a = 0; b = next(k for k, c in enumerate(cards) if c[:-1] != cards[0][:-1])
                await pg.click(f'.mcard[data-k="{a}"]'); await pg.click(f'.mcard[data-k="{b}"]'); await pg.wait_for_timeout(150)
                check('memory: two cards that do not match stay open a moment', await pg.evaluate("document.querySelectorAll('.mcard.flip').length") == 2)
                await pg.wait_for_timeout(1000)
                check('memory: then turn back; one move counted', await pg.evaluate("document.querySelectorAll('.mcard.flip').length") == 0 and (await pg.evaluate(M))['moves'] == 1)
            for i in sorted({c[:-1] for c in cards}, key=int):
                for kind in 'pw': await pg.click(f'.mcard[data-k="{cards.index(i + kind)}"]')
                await pg.wait_for_timeout(60)
            await pg.wait_for_selector('#m-end:not([hidden])', timeout=3000)
        await pg.click('[data-mtheme="kueche"]'); await pg.click('#m-go'); await pg.wait_for_timeout(100)
        check('memory: six pairs, twelve cards', await pg.evaluate("document.querySelectorAll('.mcard').length") == 12 and await fits(pg))
        await shot(pg, 'games-memory.png')
        await solve(True)
        check('memory: all found in 7 moves; the record counts for eight pairs', '7 ходів' in await text(pg, '#m-end') and 'Рекорд рахується для 8 пар' in await text(pg, '#m-end'), await text(pg, '#m-end'))
        check('memory: the six words grow in the garden now', await pg.evaluate(G + '.garden.counts().planted') - planted0 >= 5)
        await pg.click('#m-menu'); await pg.click('[data-size="8"]'); await pg.click('#m-go'); await pg.wait_for_timeout(100)
        await solve(False)
        P = await prog(pg)
        check('memory: eight pairs without a miss: a record of 8 moves for the theme', P['memory'].get('kueche') == 8 and 'новий рекорд' in await text(pg, '#m-end'), str(P['memory']))
        await pg.click('#m-menu')
        check('memory: the theme chip shows the record', '8 ходів' in await text(pg, '[data-mtheme="kueche"]'))

        # ---------------- skins ----------------
        await pg.click('#backbtn'); await pg.wait_for_timeout(400)
        await pg.evaluate(G + ".progress.max('artStreak', 11)"); await pg.wait_for_timeout(100)
        check('skins: reaching a goal in another game says so', 'Карнавал' in await text(pg, '#toast'), await text(pg, '#toast'))
        st = pg.locator('[data-status="click"]')
        check('skins: the laundry tile tells about the new skin', await st.text_content() == 'Новий скін: Карнавал' and 'new' in await st.get_attribute('class'))
        await pg.click('[data-game="click"]'); await pg.wait_for_timeout(500)
        check('skins: twelve more to get, the new one marked', await text(pg, '#skin-count') == '2 з 13' and 'Нове!' in await text(pg, '[data-skin="karneval"]'), await text(pg, '#skin-count'))
        await pg.click('[data-skin="karneval"]'); await pg.wait_for_timeout(100)
        check('skins: worn: pressed, the drum in carnival colours', await pg.get_attribute('[data-skin="karneval"]', 'aria-pressed') == 'true' and '#FFF3C4' in await pg.inner_html('#drum')
              and await pg.evaluate(G + '.state().skins.on') == 'karneval' and '11.11' in await text(pg, '#toast'))
        await pg.click('#drum'); await pg.wait_for_timeout(50)
        check('skins: a tap sends its emoji up', await pg.evaluate("[...document.querySelectorAll('.emo')].some(e => e.textContent === '🎉')"))
        await pg.click('[data-skin="bahnhof"]'); await pg.wait_for_timeout(50)
        check('skins: a locked one says how to earn it and how far it is', 'Зараз 9 з 100' in await text(pg, '#toast'), await text(pg, '#toast'))
        check('skins: progress bar on a locked one', await pg.evaluate("document.querySelector('[data-skin=\"bahnhof\"] .bar i').style.width") == '9%')
        await pg.evaluate(G + '.state().n = 6000'); await pg.click('#drum'); await pg.wait_for_timeout(50)
        await pg.click('[data-skin="ukraina"]'); await pg.wait_for_timeout(50)
        check('skins: too few socks: says how many more', 'Ще' in await text(pg, '#toast') and await pg.evaluate(G + '.state().skins.bought.length') == 0, await text(pg, '#toast'))
        await pg.click('[data-skin="nacht"]'); await pg.wait_for_timeout(50)
        check('skins: buying asks for a second tap', 'Торкнись ще раз' in await text(pg, '[data-skin="nacht"]') and await pg.evaluate(G + '.state().n') >= 6000)
        await pg.click('[data-skin="nacht"]'); await pg.wait_for_timeout(100)
        s = await pg.evaluate(G + '.state()')
        check('skins: bought for 5 000 socks and worn', s['skins']['bought'] == ['nacht'] and s['skins']['on'] == 'nacht' and 1000 <= s['n'] < 1100 and await text(pg, '#skin-count') == '3 з 13', str(s)[:200])
        check('skins: fit 340 px', await fits(pg))
        await shot(pg, 'games-skins.png')
        await pg.click('#backbtn'); await pg.wait_for_timeout(400)
        check('skins: after a visit the tile no longer says "new"', 'Новий' not in await text(pg, '[data-status="click"]'))
        await pg.wait_for_timeout(1700)
        cloud = await pg.evaluate('window.__cloud')
        cp = json.loads(cloud.get('progress', '{}'))
        check('Telegram keeps the progress and the garden', cp.get('zahlRight') == 9 and 'kueche' in cp.get('memory', {}) and len(cloud.get('garten', '').split(';')) >= 11, str(cloud)[:200])
        await pg.reload(); await pg.wait_for_timeout(600)
        check('skins: kept after a reload', await pg.evaluate(G + '.state().skins.on') == 'nacht' and '#0E1A2E' in await pg.inner_html('#drum'))

        # ---------------- the menu remembers it all, Telegram keeps a copy ----------------
        st = await pg.evaluate("Object.fromEntries([...document.querySelectorAll('[data-status]')].map(e => [e.dataset.status, e.textContent]))")
        check('menu: every game shows how far you are', st['satz'] == '2 з 40 речень' and st['zahlen'] == '9 правильних відповідей' and st['dialog'] == '1 з 5 сцен · ⭐ 1' and st['memory'] == 'Рекорди в 1 з 6 тем', str(st))
        check('menu: the garden card with plants', await pg.evaluate("document.querySelectorAll('#h-g-bed svg').length") >= 9 and await pg.evaluate("!document.getElementById('h-g-bed').classList.contains('empty')"))
        await ctx.close()

        # a new device: progress and the garden come from Telegram
        ctx = await browser.new_context(viewport={'width': 340, 'height': 760})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG.replace('window.__cloud = {}', 'window.__cloud = ' + json.dumps(cloud)), content_type='text/javascript'))
        await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(base + 'igry/'); await pg.wait_for_timeout(2400)
        st = await pg.evaluate("Object.fromEntries([...document.querySelectorAll('[data-status]')].map(e => [e.dataset.status, e.textContent]))")
        P = await prog(pg)
        check('a new device: progress, garden and skins come from Telegram', P.get('zahlRight') == 9 and await pg.evaluate(G + '.garden.counts().planted') >= 11 and await pg.evaluate(G + '.state().skins.on') == 'nacht', f'{P} {st}')
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
