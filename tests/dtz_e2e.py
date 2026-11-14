"""«DTZ · B1» /a1/dtz/ in headless Chrome.

  python3 tests/dtz_e2e.py     (CHROME=/path/to/chrome to use a system browser; SHOTS=dir for screenshots)

Covers: the hub with the exam in brief; listening: a recording plays, answers are marked after «Перевірити» with the
score of 20 and the texts; reading: a set in each format, the score, the glossary; writing: the draft is kept, outside
Telegram the AI check explains itself, in Telegram the letter goes to /talk (mode letter, the task) and the points,
level and corrected letter are shown; the model letter in the chosen form; speaking: the parts and models, part 3
with the AI partner (scenario planen, the task); 340 px, dark. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, re, sys, threading
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

TG = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: 'user=%7B%22id%22%3A4242%7D&hash=x', initDataUnsafe: {user: {id: 4242}},
  ready() {}, expand() {}, onEvent() {}, isVersionAtLeast() { return false; }, setHeaderColor() {}, setBackgroundColor() {}, openLink() {},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};"""

async def phone(browser, base, tg=False, width=390, scheme='light', posts=None, gender=None):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG if tg else '', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    if gender: await ctx.add_init_script(f"localStorage.setItem('dsimya-gender', '{gender}')")
    async def talk(r):
        body = r.request.post_data or ''
        f = {m.group(1): m.group(2) for m in re.finditer(r'name="([^"]+)"\r\n\r\n(.*?)\r\n--', body, re.S)}
        if posts is not None: posts.append(f)
        if f.get('mode') == 'letter':
            return await r.fulfill(json={'ok': True, 'covered': [True, True, False, True], 'content': 4, 'level': 'B1', 'corrected': 'Sehr geehrte Frau Krüger, ich kann leider nicht kommen.', 'notes': ['Пункт 3: не написано, коли можеш прийти.']}, headers={'Access-Control-Allow-Origin': '*'})
        await r.fulfill(json={'ok': True, 'reply': 'Samstag ist gut. Wo wollen wir feiern?', 'reply_uk': 'Субота підходить. Де святкуватимемо?', 'ok_line': True, 'corrected': '', 'note': '', 'left': 50}, headers={'Access-Control-Allow-Origin': '*'})
    await ctx.route('**/*.workers.dev/talk', talk)
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.goto(base + 'a1/dtz/'); await pg.wait_for_timeout(500)
    return ctx, pg

OVERFLOW = "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        ctx, pg = await phone(browser, base)
        hub = await pg.text_content('#view')
        check('hub: four parts and the exam in brief (45 items, B1 from 33)', await pg.locator('[data-go]').count() == 4 and 'від 33' in hub and 'Hören' in hub)
        # listening
        await pg.click('[data-go="hoeren"]'); await pg.wait_for_timeout(300)
        check('listening: 20 questions, a play button per recording', await pg.locator('.task').count() == 20 and await pg.locator('[data-play]').count() == 16)
        await pg.click('[data-play="h1"]'); await pg.wait_for_timeout(800)
        check('…a recording plays', await pg.evaluate("() => [...document.querySelectorAll('[data-play]')].some(b => b.textContent === '⏸')"))
        answers = await pg.evaluate("""() => { const H = window.__dtz.HOEREN, out = [];
          for (const h of H) { if (h.teil === 4) h.people.forEach((p, i) => out.push([`${h.id}-${i + 1}`, p.a])); else h.tasks.forEach((t, i) => out.push([`${h.id}-${i}`, String(t.kind === 'rf' ? (t.a ? 0 : 1) : t.a)])); } return out; }""")
        for i, (hid, v) in enumerate(answers[:15]):
            await pg.click(f'[data-hr="{hid}"][data-v="{v}"]')
        await pg.click('#hr-check'); await pg.wait_for_timeout(300)
        check('…checked: 15 of 20, the right answers marked, the texts to read', (await pg.text_content('.score')).startswith('15 з 20') and await pg.locator('.ch .right').count() == 20 and await pg.locator('details summary').count() >= 13, await pg.text_content('.score'))
        await pg.click('[data-back]'); await pg.wait_for_timeout(300)
        check('…the best result shows on the hub', '15/20' in await pg.text_content('[data-go="hoeren"]'))
        # reading
        await pg.click('[data-go="lesen"]'); await pg.wait_for_timeout(200)
        await pg.click('[data-set="l2a"]'); await pg.wait_for_timeout(200)
        check('reading, part 2: eight ads, five situations with a, b … h and x', await pg.locator('.ad').count() == 8 and await pg.locator('.task').count() == 5 and await pg.locator('.task >> nth=0').locator('button').count() == 9)
        for i, k in enumerate(['e', 'b', 'a', 'x', 'c']):
            await pg.click(f'[data-lr="{i}"] >> text="{k}"')
        await pg.click('#lr-check'); await pg.wait_for_timeout(200)
        check('…checked: 4 of 5', (await pg.text_content('.score')).startswith('4 з 5'))
        await pg.click('[data-back]'); await pg.wait_for_timeout(200)
        await pg.click('[data-set="l5a"]'); await pg.wait_for_timeout(200)
        check('reading, part 5: the letter with six gaps', await pg.locator('.text b').count() == 6 and await pg.locator('.task').count() == 6)
        await pg.click('[data-back]'); await pg.click('[data-back]'); await pg.wait_for_timeout(200)
        # writing outside Telegram
        await pg.click('[data-go="schreiben"]'); await pg.wait_for_timeout(200)
        check('writing: the parts of a letter, tips, eight tasks', await pg.locator('[data-letter]').count() == 8 and 'Betreff' in await pg.text_content('#view'))
        await pg.click('[data-letter="s1"]'); await pg.wait_for_timeout(200)
        await pg.fill('#lt', 'Sehr geehrte Frau Krüger, leider kann ich morgen nicht kommen.'); await pg.wait_for_timeout(100)
        check('…words are counted; outside Telegram the AI check explains itself', '10 слів' in await pg.text_content('#lt-words') and 'через бота' in await pg.text_content('#view'))
        await pg.reload(); await pg.wait_for_timeout(400)
        await pg.click('[data-go="schreiben"]'); await pg.click('[data-letter="s1"]'); await pg.wait_for_timeout(200)
        check('…the draft is kept', 'leider kann ich morgen' in await pg.input_value('#lt'))
        await pg.click('details summary >> text=Зразок відповіді'); await pg.wait_for_timeout(100)
        check('…the model letter, signed in the chosen form (Тарас)', 'Taras Schewtschenko' in await pg.text_content('details .model') and '{' not in await pg.text_content('details .model'))
        check('390 px: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        await ctx.close()

        # Telegram: the AI letter check and the part-3 partner; the other form (Леся)
        posts = []
        ctx, pg = await phone(browser, base, tg=True, width=340, scheme='dark', posts=posts, gender='f')
        await pg.click('[data-go="schreiben"]'); await pg.click('[data-letter="s1"]'); await pg.wait_for_timeout(200)
        await pg.fill('#lt', 'Sehr geehrte Frau Krüger, ich habe morgen einen Termin bei Ihnen, aber mein Sohn ist krank. Es tut mir leid. Muss ich Unterlagen mitbringen? Mit freundlichen Grüßen')
        await pg.click('#lt-check'); await pg.wait_for_timeout(500)
        post = posts[-1] if posts else {}
        check('the AI check: the letter goes with the task and its four points', post.get('mode') == 'letter' and 'Jobcenter' in post.get('task', '') and 'Entschuldigung' in post.get('task', '') and 'Frau Krüger' in post.get('text', ''), str(post)[:200])
        view = await pg.text_content('#view')
        check('…points covered and missed, level and content, the corrected letter, the notes', await pg.locator('.pts .ok').count() == 3 and await pg.locator('.pts .no').count() == 1 and 'B1 · зміст 4/5' in view and 'Пункт 3' in view and 'ich kann leider nicht kommen' in view, view[:300])
        await pg.click('details summary >> text=Зразок відповіді'); await pg.wait_for_timeout(100)
        check('…the model in the other form: signed Lessja Ukrajinka', 'Lessja Ukrajinka' in await pg.text_content('details .model'))
        await pg.click('[data-back]'); await pg.click('[data-back]'); await pg.wait_for_timeout(200)
        await pg.click('[data-go="sprechen"]'); await pg.wait_for_timeout(200)
        sp = await pg.text_content('#view')
        check('speaking: part 1 model in her form, part 2 topics, part 3 tasks', 'Lessja Ukrajinka' in sp and await pg.locator('[data-plan]').count() == 3 and 'Einkaufen' in sp)
        await pg.click('[data-plan="0"]'); await pg.wait_for_timeout(200)
        await pg.fill('#pin', 'Wie wäre es mit Samstag?'); await pg.click('#pc button'); await pg.wait_for_timeout(500)
        post = posts[-1]
        check('part 3 with the AI: scenario planen, level B1, the task; its reply and translation shown', post.get('scenario') == 'planen' and post.get('level') == 'b1' and 'Abschiedsfeier' in post.get('task', '') and 'Wo wollen wir feiern' in await pg.text_content('#chat'), str(post)[:200])
        check('340 px dark: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'dtz-plan.png'), full_page=True)
        await ctx.close()
        await browser.close()
    print('\n' + (f'{len(fails)} FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)

asyncio.run(main())
