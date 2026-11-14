"""«Leben in Deutschland» /a1/lid/ in headless Chrome.

  python3 tests/lid_e2e.py     (CHROME=/path/to/chrome to use a system browser; SHOTS=dir for screenshots)

Covers: the hub (310 questions, topics, the translation setting); in order: question 1 in German with its translation,
a wrong answer shows the right one and lands in «Помилки», the place in the order is kept; a picture question shows its
picture; the translation «за дотиком»; the exam: 33 questions with a timer, jumping between them, handing in with
questions open takes two taps, the result with every answer; the catalogue and its search; 340 px, dark.
Exits 1 if a check fails.
"""
import asyncio, functools, http.server, os, sys, threading
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

async def phone(browser, base, width=390, scheme='light'):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860}, color_scheme=scheme)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.goto(base + 'a1/lid/'); await pg.wait_for_timeout(500)
    return ctx, pg

OVERFLOW = "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        ctx, pg = await phone(browser, base)
        hub = await pg.text_content('#view-hub')
        check('hub: 0 of 310 learned, seven topics, the exam explained', 'Вивчено 0 з 310' in hub and await pg.locator('[data-topic]').count() == 7 and '17 правильних' in hub)
        check('…the source is named (BAMF, the catalogue\'s date)', 'Bundesamt für Migration und Flüchtlinge' in await pg.text_content('#src') and '07.05.2025' in await pg.text_content('#src'))
        await pg.click('[data-mode="order"]'); await pg.wait_for_timeout(200)
        q = await pg.text_content('.qcard')
        check('in order: question 1 in German with the Ukrainian under it', 'In Deutschland dürfen Menschen offen' in q and 'відкрито висловлюватися' in q, q[:200])
        await pg.click('[data-o="0"]'); await pg.wait_for_timeout(150)
        check('a wrong answer: the right one is marked and named', await pg.locator('.opt.right').count() == 1 and 'Meinungsfreiheit' in await pg.text_content('#fb') and await pg.locator('.opt.wrong').count() == 1)
        await pg.click('#next'); await pg.wait_for_timeout(150)
        check('…next: question 2', 'Religionsunterricht' in await pg.text_content('.opts'))
        await pg.click('#view-run [data-quit]'); await pg.wait_for_timeout(300)
        hub = await pg.text_content('#view-hub')
        check('back on the hub: the mistake waits, the order goes on from № 2', '1' == (await pg.text_content('[data-mode="mistakes"] .due')) and 'далі з № 2' in hub, hub[:300])
        # a picture question (the ballot) through the catalogue search… and in a topic
        await pg.click('[data-mode="list"]'); await pg.wait_for_timeout(200)
        await pg.fill('#lq', 'Düsseldorf'); await pg.wait_for_timeout(150)
        cat = await pg.text_content('#lcat')
        check('the catalogue: search finds the capital of NRW with its answer and translation', 'Landeshauptstadt' in cat and '✓ Düsseldorf' in cat and 'Дюссельдорф' in cat, cat[:200])
        await pg.fill('#lq', 'Stimmzettel'); await pg.wait_for_timeout(150)
        check('…a picture question shows its picture', await pg.locator('#lcat img[src$="lid-130.webp"]').count() == 1)
        await pg.click('#view-list [data-quit]'); await pg.wait_for_timeout(300)
        await pg.click('[data-uk="0"]'); await pg.wait_for_timeout(100)
        await pg.click('[data-topic="nrw"]'); await pg.wait_for_timeout(200)
        check('translation «за дотиком»: hidden until the button', await pg.locator('.qcard .uk[hidden]').count() == 1 and await pg.locator('.opt small').count() == 0)
        await pg.click('[data-showuk]'); await pg.wait_for_timeout(100)
        check('…shown on a tap', await pg.locator('.qcard .uk:not([hidden])').count() == 1)
        check('…the NRW coat-of-arms question shows the four coats of arms', await pg.locator('.qcard img[src$="lid-nrw1.webp"]').count() == 1)
        await pg.click('#view-run [data-quit]'); await pg.wait_for_timeout(300)
        # the exam
        await pg.click('[data-mode="exam"]'); await pg.wait_for_timeout(1200)
        check('the exam: 33 questions, a timer near 60:00', await pg.locator('[data-jump]').count() == 33 and (await pg.text_content('#timer')).startswith(('60:', '59:')), await pg.text_content('#timer'))
        right = await pg.evaluate("() => window.__lid.R().list.map(x => x.a)")
        for i in range(20):
            await pg.click(f'[data-o="{right[i]}"]'); await pg.wait_for_timeout(30)
            await pg.click('#exam-next'); await pg.wait_for_timeout(30)
        await pg.click('[data-jump="0"]'); await pg.wait_for_timeout(80)
        check('jumping back keeps the answer', await pg.locator('.opt.picked').count() == 1)
        await pg.click('#exam-end'); await pg.wait_for_timeout(100)
        check('handing in with 13 open: the first tap warns', 'Без відповіді ще 13' in await pg.text_content('#exam-end'))
        await pg.click('#exam-end'); await pg.wait_for_timeout(300)
        res = await pg.text_content('#view-run')
        check('…the second hands in: 20 of 33, passed (17 needed), every answer listed', '20 з 33' in res and 'складено' in res and await pg.locator('#view-run .cat li').count() == 33, res[:200])
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'lid-exam.png'))
        check('390 px: nothing scrolls sideways', await pg.evaluate(OVERFLOW) <= 0)
        await ctx.close()

        ctx, pg = await phone(browser, base, width=340, scheme='dark')
        await pg.click('[data-topic="geschichte"]'); await pg.wait_for_timeout(200)
        check('340 px dark: a question fits', await pg.evaluate(OVERFLOW) <= 0)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'lid-dark-340.png'))
        await ctx.close()
        await browser.close()
    print('\n' + (f'{len(fails)} FAILED' if fails else 'all passed'))
    sys.exit(1 if fails else 0)

asyncio.run(main())
