"""«Тренажери» /a1/trener/ in headless Chrome.

  python3 tests/trener_e2e.py     (CHROME=/path/to/chrome to use a system browser; SHOTS=dir for screenshots)

Covers: the hub with the levels and a card per trainer; a session of ten: a right answer is marked and explained, a
wrong one shows the right choice and comes back later in the same session and on the hub as «на повторення»; the
result; word order by tapping the words; the level kept; the course's hub links here; the conversation: outside
Telegram it explains itself, in Telegram a line goes to /talk with the scenario, level and history, and the reply and
the correction are shown; the daily limit; 340 px without sideways scrolling, dark theme. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, re, sys, threading, urllib.parse
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

async def phone(browser, base, tg=False, width=390, scheme='light', path='a1/trener/', talk=None):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=TG if tg else '', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    if talk is not None:
        async def t(r):
            body = r.request.post_data or ''
            f = {m.group(1): m.group(2) for m in re.finditer(r'name="([^"]+)"\r\n\r\n(.*?)\r\n--', body, re.S)}
            talk['posts'].append(f)
            if talk.get('limit'): return await r.fulfill(status=429, json={'ok': False, 'error': 'daily_limit'}, headers={'Access-Control-Allow-Origin': '*'})
            await r.fulfill(json={'ok': True, 'reply': 'Wann haben Sie Zeit?', 'reply_uk': 'Коли у Вас є час?', 'ok_line': False,
                                  'corrected': 'Ich möchte einen Termin.', 'note': 'Після möchte — знахідний відмінок: einen Termin.', 'left': 59}, headers={'Access-Control-Allow-Origin': '*'})
        await ctx.route('**/*.workers.dev/talk', t)
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.goto(base + path); await pg.wait_for_timeout(400)
    return ctx, pg

OVERFLOW = "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
RIGHT = "() => { const q = document.querySelector('.q .task').textContent; return q; }"

async def answer(pg, right):
    """Answers the shown question: the right choice (read from the page's own question object) or a wrong one."""
    return await pg.evaluate("""(right) => {
      const t = window.__trener, task = document.querySelector('.q .task').textContent;
      const opts = [...document.querySelectorAll('.opt')];
      if (!opts.length) return null;
      const q = window.__current; return q ? q : null;
    }""", right)

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        ctx, pg = await phone(browser, base)
        check('hub: levels, eight trainers and the conversation', await pg.locator('[data-level]').count() == 3 and await pg.locator('[data-start]').count() == 8 and await pg.locator('[data-talk]').count() == 1)
        check('hub: today 0 answers, the daily goal', 'Сьогодні: 0 відповідей' in await pg.text_content('#view-hub'))
        await pg.click('[data-start="art"]'); await pg.wait_for_timeout(200)
        check('a session: «1 з 10», a noun with a gap, three articles', '1 з 10' in await pg.text_content('#view-run') and '___' in await pg.text_content('.q .task') and await pg.locator('.opt').count() == 3)
        # answer wrong on purpose: the right article is the one the page marks after the answer
        word = (await pg.text_content('.q .task')).replace('___ ', '')
        wrong = await pg.evaluate("""() => { const o = [...document.querySelectorAll('.opt')]; return o.map(b => b.textContent); }""")
        # find the right article from the course dictionary
        art = await pg.evaluate("""async (w) => { const m = await import('/a1/data/wortschatz.js'); const e = m.WORDS.find(x => x.word === w && x.art); return e ? e.art : null; }""", word)
        bad = [x for x in wrong if x != art][0]
        await pg.click(f'.opt:text-is("{bad}")'); await pg.wait_for_timeout(200)
        fb = await pg.text_content('#fb')
        check('a wrong answer: «Не так», the right article shown and marked', 'Не так' in fb and f'{art} {word}' in fb and await pg.text_content('.opt.right') == art, fb)
        await pg.click('#next'); await pg.wait_for_timeout(150)
        check('…and it comes back in this session (11 questions now)', '2 з 11' in await pg.text_content('#view-run'))
        for i in range(10):
            if not await pg.locator('.opt').count(): break
            w2 = (await pg.text_content('.q .task')).replace('___ ', '')
            a2 = await pg.evaluate("""async (w) => { const m = await import('/a1/data/wortschatz.js'); const e = m.WORDS.find(x => x.word === w && x.art); return e ? e.art : null; }""", w2)
            await pg.click(f'.opt:text-is("{a2}")'); await pg.wait_for_timeout(80)
            if i == 0: check('a right answer: «Правильно» with the noun and its plural', 'Правильно' in await pg.text_content('#fb'))
            await pg.click('#next'); await pg.wait_for_timeout(80)
        res = await pg.text_content('#view-run')
        check('the result: 10 of 11, the mistake listed', '10 з 11' in res and f'{art} {word}' in res, res[:200])
        await pg.click('[data-quit]'); await pg.wait_for_timeout(300)
        hub = await pg.text_content('#view-hub')
        item = await pg.evaluate("(k) => window.__trener.state.items['art:' + k]", f'{art} {word}')
        check('back on the hub: 11 answers today; the mistake, right on its second go, comes back tomorrow', 'Сьогодні: 11 відповідей' in hub and item and item['box'] == 1 and item['bad'] == 1 and 'Повторити помилки' not in hub, f'{hub[:120]} {item}')
        await pg.evaluate("(k) => { const s = JSON.parse(localStorage.getItem('a1-trener')); s.items['art:' + k].due = '2000-01-01'; localStorage.setItem('a1-trener', JSON.stringify(s)); }", f'{art} {word}')
        await pg.reload(); await pg.wait_for_timeout(400)
        check('…when it is due: «Повторити помилки · 1» and a badge on «Артикль»', 'Повторити помилки · 1' in await pg.text_content('#view-hub') and await pg.locator('[data-start="art"] .due').text_content() == '1')
        await pg.click('[data-start="mix"]'); await pg.wait_for_timeout(200)
        check('…repeating starts with that noun', (await pg.text_content('.q .task')).endswith(word))
        await pg.click('[data-quit]'); await pg.wait_for_timeout(200)
        # word order
        await pg.click('[data-start="order"]'); await pg.wait_for_timeout(200)
        right = await pg.evaluate("""async () => { const m = await import('/a1/trener/gen.js'); return null; }""")
        words = await pg.eval_on_selector_all('#pool .wchip', 'b => b.map(x => x.textContent)')
        uk = await pg.text_content('.q .task')
        de = await pg.evaluate("""async (uk) => { const g = await import('/a1/trener/gen.js'); for (let i = 0; i < 4000; i++) { const q = g.question('order', [1, 32]); if (q.prompt === uk) return q.answer; } return null; }""", uk)
        check('word order: the Ukrainian sentence, its German words shuffled', de is not None and sorted(words) == sorted(de), f'{uk} | {words} | {de}')
        if de:
            for w in de:
                await pg.click(f'#pool .wchip:text-is("{w}") >> nth=0'); await pg.wait_for_timeout(30)
            await pg.click('#check'); await pg.wait_for_timeout(150)
            check('…tapped in the right order: right', 'Правильно' in await pg.text_content('#fb'))
        await pg.click('[data-quit]'); await pg.wait_for_timeout(200)
        await pg.click('[data-level="a2"]'); await pg.reload(); await pg.wait_for_timeout(400)
        check('the level is kept', await pg.get_attribute('[data-level="a2"]', 'aria-pressed') == 'true')
        await pg.click('[data-talk]'); await pg.wait_for_timeout(200)
        await pg.click('[data-scn="arzt"]'); await pg.wait_for_timeout(200)
        check('conversation outside Telegram: the first line is there, writing explains it needs the bot', 'Praxis Dr. Becker' in await pg.text_content('#chat') and await pg.is_disabled('#t-in') and 'через бота' in await pg.text_content('#view-talk'))
        check('390 px: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        await ctx.close()

        # the course's hub links here
        ctx, pg = await phone(browser, base, path='a1/')
        check('the course hub: a «Тренажери» tile', await pg.get_attribute('#to-trener', 'href') == 'trener/')
        await ctx.close()

        # the conversation in Telegram
        talk = {'posts': []}
        ctx, pg = await phone(browser, base, tg=True, width=340, scheme='dark', talk=talk)
        await pg.click('[data-talk]'); await pg.wait_for_timeout(200)
        await pg.click('[data-tlevel="a2"]'); await pg.click('[data-scn="arzt"]'); await pg.wait_for_timeout(200)
        await pg.fill('#t-in', 'Ich möchte ein Termin'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(400)
        post = talk['posts'][-1] if talk['posts'] else {}
        hist = json.loads(post.get('history', '[]'))
        check('a line goes to /talk with the scenario, level and the conversation so far', post.get('scenario') == 'arzt' and post.get('level') == 'a2' and post.get('text') == 'Ich möchte ein Termin' and hist and hist[0]['r'] == 'a', str(post))
        chat = await pg.text_content('#chat')
        check('…the correction under my line, the reply with its translation', 'Ich möchte einen Termin.' in chat and 'знахідний' in chat and 'Wann haben Sie Zeit?' in chat and 'Коли у Вас є час?' in chat, chat)
        talk['limit'] = True
        await pg.fill('#t-in', 'Morgen'); await pg.click('#t-send'); await pg.wait_for_timeout(400)
        check('the daily limit: said plainly, my line back in the box', 'ліміт оновиться завтра' in await pg.text_content('#t-err') and await pg.input_value('#t-in') == 'Morgen')
        check('340 px dark conversation: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'trener-talk.png'))
        await ctx.close()
        await browser.close()
    print('\n' + (f'{len(fails)} FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)

asyncio.run(main())
