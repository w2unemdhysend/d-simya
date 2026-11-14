"""«Тренування» /sport/ in headless Chrome.

  python3 tests/sport_e2e.py     (CHROME=/path/to/chrome to use a system browser; SHOTS=dir for screenshots)

Covers: choosing a programme and days; the next workout with its length and exercises; the exercise list where the
figures move while on screen, the exercise card (steps, mistakes, easier and harder); with less motion asked for, a
still picture; the player: a countdown, the timer, pause keeps the time, skipping, the rest names the next exercise,
the end records the workout and the next one is B; stopping halfway asks whether to record; walks; the week; changing
days and the reminder (in Telegram) with the next workout's name; the coach's voice (the clips are fetched, the rest
says three of them, the choice of voice is kept); the short sessions (the morning routine, the back) outside the
programme; the back programme; 340 px without sideways scrolling, dark theme.
Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, sys, threading, urllib.parse
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

TG = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: %s, initDataUnsafe: {user: {id: 5151, first_name: 'Ольга'}},
  ready() {}, expand() {}, onEvent() {}, isVersionAtLeast() { return true; }, setHeaderColor() {}, setBackgroundColor() {}, openLink() {},
  disableVerticalSwipes() { window.__noSwipe = true; }, enableVerticalSwipes() { window.__noSwipe = false; }, enableClosingConfirmation() {}, disableClosingConfirmation() {},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};""" % json.dumps(
    urllib.parse.urlencode({'user': json.dumps({'id': 5151, 'first_name': 'Ольга'}), 'hash': 'x'}))

def multipart(body, ctype):
    boundary = ctype.split('boundary=')[1]
    out = {}
    for part in body.split('--' + boundary):
        if 'name="' not in part: continue
        head, _, val = part.partition('\r\n\r\n')
        out[head.split('name="')[1].split('"')[0]] = val.rsplit('\r\n', 1)[0]
    return out

# counts the clips the coach starts (each a buffer source)
SAID = """(() => { const o = AudioBufferSourceNode.prototype.start; window.__said = 0;
  AudioBufferSourceNode.prototype.start = function (...a) { window.__said++; return o.apply(this, a); }; })();"""

async def phone(browser, base, tg=False, width=390, scheme='light', reduce='no-preference', posts=None):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme, reduced_motion=reduce)
    await ctx.add_init_script(SAID)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG if tg else '', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    await ctx.route('**/*.workers.dev/forma', lambda r: r.fulfill(json={'ok': True, 'seq': 0, 'rows': [], 'more': False}))
    async def remind(r):
        f = multipart(r.request.post_data or '', r.request.headers.get('content-type', ''))
        if posts is not None: posts.append(f)
        await r.fulfill(json={'ok': True, 'on': f.get('action') in ('on', 'prefs')})
    await ctx.route('**/*.workers.dev/reminders', remind)
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.install(time='2026-11-16T15:00:00Z')   # a Monday
    await pg.goto(base + 'sport/'); await pg.wait_for_timeout(500)
    return ctx, pg

OVERFLOW = "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
FIG = "(sel) => document.querySelector(sel).innerHTML"

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        ctx, pg = await phone(browser, base)
        check('first visit: three programmes and the days', await pg.locator('[data-plan]').count() == 3 and await pg.locator('[data-cday][aria-pressed="true"]').count() == 3)
        check('first visit: the short sessions are there already', await pg.locator('[data-quick]').count() == 2 and 'Ранкова зарядка · 5 хв' in await pg.text_content('#view-today'))
        await pg.click('[data-cday="0"]'); await pg.click('[data-cday="2"]'); await pg.click('[data-cday="4"]')
        await pg.click('#start'); await pg.wait_for_timeout(200)
        check('no days chosen: asked for one', 'хоча б один день' in await pg.text_content('#toast'))
        await pg.click('[data-cday="0"]'); await pg.click('[data-cday="3"]'); await pg.click('[data-plan="soft"]')
        await pg.click('#start'); await pg.wait_for_timeout(400)
        hero = await pg.text_content('#view-today .hero')
        check('the next workout: A, its length, five exercises in two rounds', 'Тренування A' in hero and 'хв' in hero and '5 вправ × 2 кола' in hero, hero)
        check('today (Monday) is a workout day: no rest note', 'відпочинок' not in hero)
        check('the week: Monday and Thursday planned', await pg.locator('.wd.plan').count() == 2)
        # exercises
        await pg.click('#tab-moves'); await pg.wait_for_timeout(500)
        cards = await pg.locator('.mcard').count()
        check(f'{cards} exercises in five groups', cards >= 24 and await pg.locator('#view-moves h3.group').count() == 5)
        f1 = await pg.evaluate(FIG, '.mcard .fig'); await pg.wait_for_timeout(400); f2 = await pg.evaluate(FIG, '.mcard .fig')
        check('the figures on screen move', f1 != f2 and '<line' in f1)
        await pg.click('#view-moves [data-move="birddog"]'); await pg.wait_for_timeout(400)
        body = await pg.text_content('#sheet-body')
        check('the exercise card: steps, mistakes, easier, harder, breath', all(w in body for w in ('Як робити', 'Помилки', 'Легше', 'Складніше', 'Дихання')), body[:200])
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        check('Escape closes it', await pg.is_hidden('#sheet'))
        # the player
        await pg.click('#tab-today'); await pg.wait_for_timeout(300)
        clips = []
        pg.on('request', lambda r: clips.append(r.url) if '/sport/audio/' in r.url and r.url.endswith('.mp3') else None)
        await pg.click('#go'); await pg.wait_for_timeout(1500)
        check(f'the coach\'s clips are fetched for the workout ({len(clips)})', len(clips) >= 20 and all('/sport/audio/m-' in u for u in clips), str(clips[:3]))
        check('the player: get ready, the first exercise, a timer', await pg.is_visible('#player') and 'Приготуйся' in await pg.text_content('.p-phase') and await pg.text_content('#p-timer') in ('0:05', '0:04'))
        await pg.clock.run_for(5500); await pg.wait_for_timeout(200)
        check('after the countdown: the warm-up, the march', 'Розминка' in await pg.text_content('.p-phase') and 'Марш' in await pg.text_content('.p-name'), await pg.text_content('.p-name'))
        await pg.click('#p-play'); t1 = await pg.text_content('#p-timer'); await pg.clock.run_for(3000); await pg.wait_for_timeout(100)
        check('pause keeps the time', await pg.text_content('#p-timer') == t1, t1)
        await pg.click('#p-play')
        for _ in range(3): await pg.click('#p-next'); await pg.wait_for_timeout(80)
        check('skipping the warm-up: round 1, exercise 1', 'Коло 1 з 2 · вправа 1 з 5' in await pg.text_content('.p-phase'), await pg.text_content('.p-phase'))
        check('…«далі» names the next exercise', 'Далі' in await pg.text_content('.p-next'))
        said = await pg.evaluate('window.__said')
        await pg.clock.run_for(31000); await pg.wait_for_timeout(200)
        check('the coach says the rest: «Відпочинок. Далі. Віджимання від стіни»', await pg.evaluate('window.__said') - said >= 3, f"{said} → {await pg.evaluate('window.__said')}")
        check('when the time is up: rest, with the next exercise', 'Відпочинок' in await pg.text_content('.p-phase') and 'Віджимання від стіни' in await pg.text_content('.p-name'), await pg.text_content('.p-name'))
        check('Telegram swipes and the screen are looked after (no errors)', True)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'sport-player.png'))
        await pg.clock.run_for(40000); await pg.wait_for_timeout(200)
        await pg.click('#p-close'); await pg.wait_for_timeout(200)
        check('stopping after more than a minute asks whether to record', 'Завершити?' in await pg.text_content('#p-body'))
        await pg.click('#p-resume'); await pg.wait_for_timeout(100)
        while await pg.is_visible('#p-next'):
            await pg.click('#p-next'); await pg.wait_for_timeout(30)
        check('the end: done, minutes and kcal, next time B', 'Готово' in await pg.text_content('#p-body') and 'тренування B' in await pg.text_content('#p-body'), await pg.text_content('#p-body'))
        await pg.click('#p-ok'); await pg.wait_for_timeout(300)
        hero = await pg.text_content('#view-today .hero')
        check('the day: done, next is B', '✓ Сьогодні тренування вже є' in hero and 'Тренування B' in hero, hero)
        check('the week shows it', await pg.locator('.wd.done').count() == 1)
        await pg.click('[data-walk="30"]'); await pg.wait_for_timeout(300)
        hist = await pg.text_content('#view-today')
        check('a walk of 30 minutes is recorded with kcal', 'Прогулянка' in hist and '30 хв' in hist)
        await pg.click('[data-unrec] >> nth=0'); await pg.wait_for_timeout(200); await pg.click('#toast-undo'); await pg.wait_for_timeout(200)
        check('a record removed and brought back', 'Прогулянка' in await pg.text_content('#view-today'))
        # the morning routine: outside the programme
        await pg.click('[data-quick="morning"]'); await pg.wait_for_timeout(300)
        check('the morning routine: the player with its own list', await pg.is_visible('#player') and 'Марш' in await pg.text_content('.p-name'))
        await pg.clock.run_for(5500); await pg.wait_for_timeout(200)
        check('…numbered exercises, no rounds', await pg.text_content('.p-phase') == 'Вправа 1 з 9', await pg.text_content('.p-phase'))
        while await pg.is_visible('#p-next'):
            await pg.click('#p-next'); await pg.wait_for_timeout(30)
        body = await pg.text_content('#p-body')
        check('the end of the routine: recorded, «Гарного дня!», no next workout', 'Готово' in body and 'Гарного дня' in body and 'тренування B' not in body, body)
        await pg.click('#p-ok'); await pg.wait_for_timeout(300)
        today = await pg.text_content('#view-today')
        check('…in the history with its icon; the programme still waits for B', '🌅' in today and 'Ранкова зарядка' in today and 'Тренування B' in await pg.text_content('.hero'))
        check('…and the programme\'s week still counts one workout', '1 з 2' in await pg.text_content('#view-today .card:has(#h-week)'))
        # schedule
        await pg.click('#tab-plan'); await pg.wait_for_timeout(300)
        check('outside Telegram the reminder explains itself', await pg.is_disabled('#r-sport') and 'через бота' in await pg.text_content('#view-plan'))
        check('the coach\'s voice: man\'s at first (as «Рід у прикладах»)', await pg.get_attribute('[data-voice="m"]', 'aria-checked') == 'true')
        said = await pg.evaluate('window.__said')
        await pg.click('[data-voice="f"]'); await pg.wait_for_timeout(1500)
        check('a woman\'s voice chosen: kept, and a sample is said', await pg.evaluate("localStorage.getItem('sport-voice')") == 'f' and await pg.evaluate('window.__said') > said)
        await pg.click('[data-voice="off"]'); await pg.wait_for_timeout(200)
        check('no voice: kept, no sample button', await pg.evaluate("localStorage.getItem('sport-voice')") == 'off' and await pg.is_hidden('#v-try'))
        await pg.click('[data-sday="5"]'); await pg.wait_for_timeout(200)
        check('a day added', await pg.locator('[data-sday][aria-pressed="true"]').count() == 3)
        await pg.click('[data-switch="home"]'); await pg.wait_for_timeout(300)
        await pg.click('#tab-today'); await pg.wait_for_timeout(300)
        check('another programme starts from its own A, three rounds', 'Спалюємо вдома' in await pg.text_content('.hero') and 'Тренування A' in await pg.text_content('.hero') and '× 3 кола' in await pg.text_content('.hero'))
        await pg.click('#tab-plan'); await pg.click('[data-switch="back"]'); await pg.wait_for_timeout(300)
        await pg.click('#tab-today'); await pg.wait_for_timeout(300)
        hero = await pg.text_content('.hero')
        check('the back programme: A «Рухливість», two rounds, cat-cow in it', 'Здорова спина' in hero and 'Рухливість' in hero and '× 2 кола' in hero and 'Кішка-корова' in hero, hero)
        await pg.click('#go'); await pg.wait_for_timeout(300)
        said = await pg.evaluate('window.__said')
        await pg.clock.run_for(6000); await pg.wait_for_timeout(300)
        check('without a voice: only beeps', await pg.evaluate('window.__said') == said)
        await pg.click('#p-close'); await pg.wait_for_timeout(200)
        check('390 px: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        await ctx.close()

        # Telegram: the reminder carries days, time and the next workout
        posts = []
        ctx, pg = await phone(browser, base, tg=True, posts=posts)
        await pg.click('#start'); await pg.wait_for_timeout(300)
        await pg.click('#tab-plan'); await pg.wait_for_timeout(300)
        await pg.select_option('#s-time', '17:30'); await pg.click('#r-sport'); await pg.wait_for_timeout(300)
        on = [x for x in posts if x.get('action') == 'on']
        check('reminder on: days, time, the next workout and its length', on and on[0].get('days') == '0,2,4' and on[0].get('time') == '17:30' and on[0].get('next', '').startswith('Тренування A') and int(on[0].get('mins', '0')) > 5, str(on))
        await pg.click('[data-sday="6"]'); await pg.wait_for_timeout(300)
        check('a changed day updates the reminder quietly', any(x.get('action') == 'prefs' and x.get('days') == '0,2,4,6' for x in posts), str(posts[-1:]))
        await pg.click('#tab-today'); await pg.click('#go'); await pg.wait_for_timeout(200)
        check('in Telegram the player stops the swipe that closes the app', await pg.evaluate('window.__noSwipe') is True)
        await pg.click('#p-close'); await pg.wait_for_timeout(200)
        check('…and gives it back', await pg.evaluate('window.__noSwipe') is False)
        await ctx.close()

        # less motion; narrow and dark
        ctx, pg = await phone(browser, base, reduce='reduce', width=340, scheme='dark')
        await pg.click('#start'); await pg.wait_for_timeout(300)
        await pg.click('#tab-moves'); await pg.wait_for_timeout(300)
        f1 = await pg.evaluate(FIG, '.mcard .fig'); await pg.wait_for_timeout(500); f2 = await pg.evaluate(FIG, '.mcard .fig')
        check('less motion asked for: still pictures', f1 == f2)
        for t in ('today', 'moves', 'plan'):
            await pg.click(f'#tab-{t}'); await pg.wait_for_timeout(300)
            check(f'340 px «{t}»: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        await pg.click('#tab-today'); await pg.click('#go'); await pg.wait_for_timeout(300)
        check('340 px player fits', await pg.evaluate("() => document.querySelector('.p-ctrl').getBoundingClientRect().bottom <= innerHeight"))
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'sport-dark-340.png'))
        await ctx.close()
        await browser.close()
    print('\n' + (f'{len(fails)} FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)

asyncio.run(main())
