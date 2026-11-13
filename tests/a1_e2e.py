"""The German A1 course (a1/) in headless Chrome.

  python3 tests/a1_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Covers: the course screen (start card, dictionary, grammar, pronunciation and garden tiles, 16 chapters in A1.1 and
A1.2 with their exercise counts); a chapter as its own screen with four tabs (grammar topics with tables, examples,
tips and typical mistakes; words with articles, forms and clips, hiding the translation, planting the nouns in the
word garden; phrases and the dialogue; exercises: a wrong option, a wrong and a right typed answer, progress kept on
the phone and in Telegram, a reset); every exercise of all 16 chapters solved with its own answer; the next chapter;
the phone's Back, Telegram's Back and the «Назад» button; links to a chapter and a tab; progress from another phone;
the dictionary (German and Ukrainian, umlauts typed without dots, an article in front, filters, more rows); the grammar
index leading to its topic; the home tile; every chapter and tab fits 340 px; the dark theme. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, json, os, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TG = """window.__cloud = %s; window.__back = null;
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
async def shot(pg, name, full=True): await pg.screenshot(path=os.path.join(os.environ.get('SHOTS', '/tmp'), name), full_page=full)
async def visible(pg, s): return await pg.evaluate(f"(() => {{ const e = document.querySelector({json.dumps(s)}); return !!e && !!e.offsetParent; }})()")

# answers every exercise of the open chapter with its own answer (the options by their data-o, gaps by typing)
SOLVE = """async () => {
  const c = window.__a1.CHAPTERS[Number(new URLSearchParams(location.search).get('ch')) - 1];
  for (const card of document.querySelectorAll('#p-tasks .task')) {
    const t = c.tasks[Number(card.dataset.task)];
    if (card.classList.contains('ok')) continue;
    if (t.t === 'mc') card.querySelector(`.opt[data-o="${t.a}"]`).click();
    else { card.querySelector('.gapin').value = t.a[0]; card.querySelector('[data-check]').click(); }
  }
  return [...document.querySelectorAll('#p-tasks .task')].filter((x) => !x.classList.contains('ok')).map((x) => Number(x.dataset.task) + 1);
}"""

async def context(browser, cloud=None, theme=None):
    ctx = await browser.new_context(viewport={'width': 340, 'height': 760})
    body = TG % json.dumps(cloud or {})
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=body, content_type='text/javascript'))
    await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
    await ctx.add_init_script("window.__played = []; const P = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__played.push(this.src); return P.call(this).catch(() => {}); };"
                              + (f"localStorage.setItem('dsimya-theme', '{theme}');" if theme else ''))
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    return ctx, pg

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
        ctx, pg = await context(browser)

        # ---------------- the course ----------------
        await pg.goto(base + 'a1/'); await pg.wait_for_timeout(700)
        hub = await pg.evaluate("""() => ({
          card: document.querySelector('.hcard.cont').textContent, tiles: [...document.querySelectorAll('#view-hub .tile b')].map(b => b.textContent),
          groups: [...document.querySelectorAll('#view-hub .group')].map(g => g.textContent), rows: document.querySelectorAll('#view-hub .chrow').length,
          counts: [...document.querySelectorAll('#view-hub .chrow .pr')].map(x => x.textContent), words: window.__a1.WORDS.length})""")
        check('course: a start card for chapter 1, four tiles, 16 chapters in A1.1 and A1.2 with 0/N exercises',
              'Почати' in hub['card'] and 'Знайомство' in hub['card'] and hub['tiles'] == ['Словник', 'Граматика', 'Вимова', 'Сад слів']
              and hub['groups'] == ['A1.1 · розділи 1–8', 'A1.2 · розділи 9–16'] and hub['rows'] == 16 and all(c.startswith('0/') for c in hub['counts']), str(hub))
        check('course: title, no Back, the dictionary tile counts every entry', await text(pg, 'h1') == 'Німецька A1' and await pg.is_hidden('#backbtn')
              and not await pg.evaluate('Telegram.WebApp.BackButton.shown') and str(hub['words']) in await text(pg, '[data-view="dict"] small'))
        check('course: fits 340 px', await fits(pg))
        await shot(pg, 'a1-course.png')

        # ---------------- a chapter: grammar ----------------
        await pg.click('.chrow[data-ch="3"]'); await pg.wait_for_timeout(600)
        check('chapter 3 opens as its own screen: title, eyebrow, Back, Telegram Back, ?ch=3',
              await text(pg, 'h1') == 'Речі й місця' and await text(pg, '#eyebrow') == 'Розділ 3 · A1.1' and await pg.is_visible('#backbtn')
              and await pg.evaluate('Telegram.WebApp.BackButton.shown') and pg.url.endswith('/a1/?ch=3'))
        g = await pg.evaluate("""() => ({topics: document.querySelectorAll('#p-gram .topic').length, tables: document.querySelectorAll('#p-gram table').length,
          ex: document.querySelectorAll('#p-gram .ex li').length, warn: document.querySelectorAll('#p-gram .warn').length, de: document.querySelectorAll('#p-gram i[lang=de]').length,
          sel: document.querySelector('[role=tab][aria-selected=true]').id, thumb: document.querySelector('.tthumb').getBoundingClientRect().width,
          book: document.querySelector('#p-gram .goals .cap').textContent})""")
        check('grammar tab: six topics with tables, examples, typical mistakes and German marked as German; the book chapter named',
              g['topics'] == 6 and g['tables'] >= 4 and g['ex'] >= 15 and g['warn'] >= 3 and g['de'] > 30 and g['sel'] == 'tab-gram' and g['thumb'] > 40 and 'Wie heißt das auf Deutsch' in g['book'], str(g))
        check('grammar tab fits 340 px (wide tables scroll inside their card)', await fits(pg))

        # ---------------- words ----------------
        await pg.click('#tab-words'); await pg.wait_for_timeout(500)
        w = await pg.evaluate("""() => {
          const ids = [...document.querySelectorAll('#p-words .w')].map(li => Number(li.dataset.id));
          const own = window.__a1.WORDS.filter(e => e.ch === 3).map(e => e.id);
          const tisch = document.querySelector(`#p-words .w[data-id="${window.__a1.WORDS.find(e => e.de === 'der Tisch').id}"]`);
          return {all: ids.length === own.length && own.every(i => ids.includes(i)), url: location.search, gram: document.querySelector('#p-gram').hidden,
            art: tisch.querySelector('.art').className, color: getComputedStyle(tisch.querySelector('.art')).color, pl: tisch.querySelector('.forms').textContent,
            groups: [...document.querySelectorAll('#p-words .group')].map(g => g.textContent)};
        }""")
        check('words tab: every word of the chapter, grouped, der in blue, the plural shown, ?tab=words in the address',
              w['all'] and w['url'] == '?ch=3&tab=words' and w['gram'] and w['art'] == 'art der' and w['color'] == 'rgb(31, 95, 175)' and w['pl'] == 'die Tische' and w['groups'][0] == 'Іменники', str(w))
        tid = await pg.evaluate("window.__a1.WORDS.find(e => e.de === 'der Tisch').id")
        await pg.click(f'#p-words .w[data-id="{tid}"]'); await pg.wait_for_timeout(300)
        played = await pg.evaluate("window.__played.slice(-1)[0] || ''")
        clip = await pg.evaluate("import('../audio/index.js').then(m => m.AUDIO['der Tisch'])")
        check('a tap on a word plays its clip', bool(clip) and (played.endswith(clip) or played.startswith('blob:')), f'{played} / {clip}')
        await pg.click('#hideuk'); await pg.wait_for_timeout(100)
        hid = await pg.evaluate("""() => { const u = document.querySelector('#p-words .w:not(.seen) .uk'); return {quiz: document.querySelector('#p-words').classList.contains('quiz'),
          color: getComputedStyle(u).color, btn: document.querySelector('#hideuk').textContent, seen: getComputedStyle(document.querySelector('#p-words .w.seen .uk')).color}; }""")
        check('hiding the translation: the Ukrainian is hidden until the word is tapped', hid['quiz'] and hid['color'] == 'rgba(0, 0, 0, 0)' and hid['seen'] != 'rgba(0, 0, 0, 0)' and hid['btn'] == 'Показати переклад', str(hid))
        await pg.click('#hideuk')
        nouns = await pg.evaluate("window.__a1.WORDS.filter(e => e.ch === 3 && e.kind === 'n' && e.art && !e.plOnly).length")
        await pg.click('#plant'); await pg.wait_for_timeout(200)
        garden = await pg.evaluate("Object.keys((JSON.parse(localStorage.getItem('dsimya-garten')) || {w: {}}).w).length")
        check('the chapter\'s nouns are planted in the word garden', garden == nouns and f'Посаджено {nouns}' in await text(pg, '#toast'), f'{garden} of {nouns}')
        await pg.click('#plant'); await pg.wait_for_timeout(200)
        check('planting again: they already grow', 'вже ростуть' in await text(pg, '#toast'))
        check('words tab fits 340 px', await fits(pg))
        await shot(pg, 'a1-words.png', False)

        # ---------------- phrases and the dialogue ----------------
        await pg.click('#tab-phr'); await pg.wait_for_timeout(500)
        ph = await pg.evaluate("""() => { const c = window.__a1.CHAPTERS[2], heroL = c.dialog.lines.filter((l) => l[0] === 'Taras').length;
          return {phr: document.querySelectorAll('#p-phr .phr').length, msgs: document.querySelectorAll('#p-phr .chat .msg').length, n: c.dialog.lines.filter((l) => l[0]).length,
            out: document.querySelectorAll('#p-phr .chat .msg.out').length, heroL, avas: document.querySelectorAll('#p-phr .chat .msg .ava').length,
            head: document.querySelector('#p-phr .chead small').textContent, tr: getComputedStyle(document.querySelector('#p-phr .bub .tr')).display}; }""")
        check('phrases tab: the phrase groups; the dialogue as a chat: every line a message, the hero on the right, avatars, «уявна історія»',
              ph['phr'] == 2 and ph['msgs'] == ph['n'] and ph['out'] == ph['heroL'] > 0 and ph['avas'] >= 2 and 'уявна історія' in ph['head'] and ph['tr'] != 'none', str(ph))
        await pg.click('#p-phr [data-chat-tr]'); await pg.wait_for_timeout(100)
        hid = await pg.evaluate("[getComputedStyle(document.querySelector('#p-phr .bub .tr')).display, localStorage.getItem('a1-chat-tr')]")
        await pg.click('#p-phr [data-chat-tr]'); await pg.wait_for_timeout(100)
        check('chat: «Переклад» hides the Ukrainian under the messages and is remembered', hid == ['none', '0'], str(hid))
        await shot(pg, 'a1-chat.png', False)

        # ---------------- exercises ----------------
        await pg.click('#tab-tasks'); await pg.wait_for_timeout(500)
        check('exercises tab: nothing solved yet', (await text(pg, '#thead b')).startswith('Розв’язано 0 з 13'))
        k3 = await pg.evaluate("window.__a1.CHAPTERS[2].tasks.map((t, i) => [t.t, i, t.a])")
        mc = next(t for t in k3 if t[0] == 'mc'); gap = next(t for t in k3 if t[0] == 'gap')
        wrong = (mc[2] + 1) % 3
        await pg.click(f'.task[data-task="{mc[1]}"] .opt[data-o="{wrong}"]'); await pg.wait_for_timeout(200)
        bad = await pg.evaluate(f"(() => {{ const c = document.querySelector('.task[data-task=\"{mc[1]}\"]'); return {{w: c.querySelector('.opt[data-o=\"{wrong}\"]').className, d: c.querySelector('.opt[data-o=\"{wrong}\"]').disabled, fb: c.querySelector('.fb').textContent, ok: c.classList.contains('ok')}}; }})()")
        check('a wrong option is crossed out and says so; the exercise stays open', 'wrong' in bad['w'] and bad['d'] and bad['fb'].startswith('Ще ні') and not bad['ok'], str(bad))
        await pg.click(f'.task[data-task="{mc[1]}"] .opt[data-o="{mc[2]}"]'); await pg.wait_for_timeout(200)
        check('the right option: solved, all options locked', await pg.evaluate(f"(() => {{ const c = document.querySelector('.task[data-task=\"{mc[1]}\"]'); return c.classList.contains('ok') && [...c.querySelectorAll('.opt')].every(b => b.disabled) && c.querySelector('.opt.right').dataset.o === '{mc[2]}'; }})()"))
        sel = f'.task[data-task="{gap[1]}"]'
        await pg.fill(sel + ' .gapin', 'xyz'); await pg.press(sel + ' .gapin', 'Enter'); await pg.wait_for_timeout(200)
        fb = await text(pg, sel + ' .fb')
        check('a wrong typed answer: «Ще ні» and the right one shown', fb.startswith('Ще ні') and gap[2][0] in fb, fb)
        await pg.fill(sel + ' .gapin', '  ' + gap[2][0].upper() + '. '); await pg.click(sel + ' [data-check]'); await pg.wait_for_timeout(200)
        check('a typed answer counts whatever its case, spaces and final full stop, and is then shown as written', await pg.evaluate(f"document.querySelector('{sel}').classList.contains('ok') && document.querySelector('{sel} .gapin').disabled")
              and await pg.input_value(sel + ' .gapin') == gap[2][0])
        check('progress: 2 of 13, on the phone', (await text(pg, '#thead b')) == 'Розв’язано 2 з 13'
              and sorted((await pg.evaluate("JSON.parse(localStorage.getItem('a1-progress'))"))['done']) == sorted([f'3:{mc[1]}', f'3:{gap[1]}']))
        await pg.wait_for_timeout(1700)
        cloud = await pg.evaluate("JSON.parse(window.__cloud.a1 || 'null')")
        check('progress: and in Telegram\'s cloud', cloud and sorted(cloud['d'].split(',')) == sorted([f'3:{mc[1]}', f'3:{gap[1]}']) and cloud['l'] == 3, str(cloud))
        await shot(pg, 'a1-tasks.png', False)
        await pg.reload(); await pg.wait_for_timeout(600)
        check('after a reload: the same tab, the solved exercises stay solved', await pg.evaluate("document.querySelector('[role=tab][aria-selected=true]').id") == 'tab-tasks'
              and await pg.evaluate("document.querySelectorAll('#p-tasks .task.ok').length") == 2)
        await pg.click('#reset'); await pg.wait_for_timeout(200)
        check('«Почати знову» clears the chapter', await pg.evaluate("document.querySelectorAll('#p-tasks .task.ok').length") == 0 and (await text(pg, '#thead b')).startswith('Розв’язано 0'))

        # ---------------- Back ----------------
        await pg.go_back(); await pg.wait_for_timeout(500)
        check("the phone's Back returns to the course, which offers to continue chapter 3", await visible(pg, '#view-hub') and 'Продовжити' in await text(pg, '.hcard.cont')
              and '3. Речі й місця' in await text(pg, '.hcard.cont') and not await pg.evaluate('Telegram.WebApp.BackButton.shown'))
        await pg.click('.chrow[data-ch="5"]'); await pg.wait_for_timeout(500)
        await pg.evaluate('window.__back()'); await pg.wait_for_timeout(500)
        check("Telegram's Back returns to the course", await visible(pg, '#view-hub') and pg.url.endswith('/a1/'))

        # ---------------- every exercise of the course ----------------
        unsolved, wide = {}, []
        for n in range(1, 17):
            await pg.goto(f'{base}a1/?ch={n}&tab=tasks'); await pg.wait_for_timeout(350)
            left = await pg.evaluate(SOLVE)
            if left or not (await text(pg, '#thead b')).startswith('Усі вправи'): unsolved[n] = left
            for tab in ['tasks', 'gram', 'words', 'phr']:
                if tab != 'tasks': await pg.click(f'#tab-{tab}'); await pg.wait_for_timeout(260)
                if not await fits(pg): wide.append(f'{n}:{tab}')
        check('every exercise of all 16 chapters is solved by its own answer', not unsolved, str(unsolved))
        check('every chapter and every tab fits 340 px', not wide, ', '.join(wide))
        await pg.goto(base + 'a1/'); await pg.wait_for_timeout(500)
        check('the course marks all chapters as done', await pg.evaluate("[...document.querySelectorAll('#view-hub .chrow')].every(r => r.classList.contains('full'))"))

        # ---------------- the next chapter ----------------
        await pg.click('.chrow[data-ch="1"]'); await pg.wait_for_timeout(400)
        await pg.click('#tab-tasks'); await pg.wait_for_timeout(400)
        await pg.click('[data-next]'); await pg.wait_for_timeout(500)
        check('the next chapter: chapter 2 from its grammar', await text(pg, 'h1') == 'Контакти' and pg.url.endswith('?ch=2')
              and await pg.evaluate("document.querySelector('[role=tab][aria-selected=true]').id") == 'tab-gram' and await pg.evaluate('window.scrollY') < 50)
        await pg.go_back(); await pg.wait_for_timeout(500)
        check('Back from the next chapter returns to the course, not to chapter 1', await visible(pg, '#view-hub'))
        await pg.goto(base + 'a1/?ch=99'); await pg.wait_for_timeout(400)
        check('an unknown chapter shows the course', await visible(pg, '#view-hub'))
        await pg.goto(base + 'a1/?ch=7&tab=phr'); await pg.wait_for_timeout(400)
        check('a link to a chapter and a tab opens them', await text(pg, 'h1') == 'Родина' and await visible(pg, '#p-phr'))
        await pg.click('#backbtn'); await pg.wait_for_timeout(500)
        check('«Назад» on an opened link goes to the course', await visible(pg, '#view-hub') and pg.url.endswith('/a1/'))

        # ---------------- the dictionary ----------------
        await pg.click('[data-view="dict"]'); await pg.wait_for_timeout(500)
        d0 = await pg.evaluate("({rows: document.querySelectorAll('#dlist .w').length, more: !document.querySelector('#dmore').hidden, count: document.querySelector('#dcount').textContent})")
        check('dictionary: the first 120 entries and «Показати ще»', d0['rows'] == 120 and d0['more'] and d0['count'].startswith(str(hub['words'])), str(d0))
        await pg.click('#dmore'); await pg.wait_for_timeout(200)
        check('«Показати ще» adds rows', await pg.evaluate("document.querySelectorAll('#dlist .w').length") == 320)
        async def search(q):
            await pg.fill('#dq', q); await pg.wait_for_timeout(150)
            return await pg.evaluate("[...document.querySelectorAll('#dlist .w')].map(li => li.querySelector('.de').textContent.trim())")
        r = await search('Tisch')
        check('search in German: the word itself first', r and r[0] == 'der Tisch', str(r[:5]))
        r = await search('стіл')
        check('search in Ukrainian', 'der Tisch' in r, str(r[:5]))
        r = await search('tschuss')
        check('umlauts may be typed without dots', any('Tschüss' in x for x in r), str(r[:5]))
        r = await search('die Tasse')
        check('an article in front of the word is fine', r and r[0] == 'die Tasse', str(r[:5]))
        await search('')
        await pg.click('[data-kind="v"]'); await pg.wait_for_timeout(200)
        check('the verb filter shows only verbs', await pg.evaluate("[...document.querySelectorAll('#dlist .w')].every(li => window.__a1.WORDS[li.dataset.id].kind === 'v')"))
        await pg.select_option('#dch', '5'); await pg.wait_for_timeout(200)
        check('and the chapter filter only chapter 5', await pg.evaluate("[...document.querySelectorAll('#dlist .w')].every(li => window.__a1.WORDS[li.dataset.id].ch === 5) && document.querySelectorAll('#dlist .w').length > 5"))
        r = await search('qqqq')
        check('nothing found: says so', r == [] and 'Нічого не знайдено' in await text(pg, '#dcount'))
        check('dictionary fits 340 px', await fits(pg))
        await search(''); await pg.click('[data-kind="all"]'); await pg.select_option('#dch', '0'); await pg.wait_for_timeout(200)
        await shot(pg, 'a1-dict.png', False)
        await pg.go_back(); await pg.wait_for_timeout(400)

        # ---------------- the grammar index ----------------
        await pg.click('[data-view="gram"]'); await pg.wait_for_timeout(500)
        gi = await pg.evaluate("({links: document.querySelectorAll('#view-gram .chrow').length, all: window.__a1.CHAPTERS.reduce((n, c) => n + c.grammar.length, 0), groups: document.querySelectorAll('#view-gram .group').length})")
        check('grammar index: every topic once, in eight groups', gi['links'] == gi['all'] and gi['groups'] == 8, str(gi))
        await pg.click('.chrow[data-topic="seitVor"]'); await pg.wait_for_timeout(700)
        top = await pg.evaluate("(() => { const t = document.getElementById('t-seitVor'); return {top: t.getBoundingClientRect().top, flash: t.classList.contains('flash')}; })()")
        check('a topic opens in its chapter, scrolled to it and marked', await text(pg, 'h1') == 'Погода й час' and -5 < top['top'] < 160 and top['flash'] and 't=seitVor' in pg.url, str(top))
        await pg.go_back(); await pg.wait_for_timeout(500)
        check('Back returns to the grammar index', await visible(pg, '#view-gram') and await text(pg, 'h1') == 'Граматика')

        # ---------------- the home tile ----------------
        await pg.goto(base); await pg.wait_for_timeout(500)
        check('home: the course tile says where to continue', await text(pg, '#a1-sub') == 'Продовжити: розділ 14 з 16', await text(pg, '#a1-sub'))
        await ctx.close()

        # ---------------- another phone: progress from Telegram ----------------
        ctx, pg = await context(browser, cloud={'a1': json.dumps({'d': '6:0,6:1,6:2', 'l': 6})})
        await pg.goto(base + 'a1/'); await pg.wait_for_timeout(700)
        check('progress solved on another phone arrives from Telegram', await text(pg, '.chrow[data-ch="6"] .pr') == '3/12' and '6. Продукти' in await text(pg, '.hcard.cont'))
        await ctx.close()

        # ---------------- who speaks: Тарас or Леся, switched in the menu's settings ----------------
        ctx, pg = await context(browser)
        await pg.goto(base + 'a1/?ch=10&tab=phr'); await pg.wait_for_timeout(600)
        def said():
            return pg.evaluate("""() => ({who: [...new Set([...document.querySelectorAll('#p-phr .chat .nm')].map((x) => x.textContent))],
              text: document.querySelector('#p-phr').textContent, hero: document.querySelector('#herol').textContent, title: document.querySelector('#title').textContent})""")
        m = await said()
        check('by default the course speaks as Тарас Шевченко, says what is real and what imagined, and where to change it',
              'Taras' in m['who'] and 'Я встав о п’ятій' in m['text'] and 'Лес' not in m['text'] and 'Тараса Шевченка' in m['hero'] and 'уявна історія' in m['hero'] and 'Налаштування' in m['hero'], str({**m, 'text': m['text'][:160]}))
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        seg = await pg.evaluate("[...document.querySelectorAll('#dset [data-gender]')].map((b) => [b.textContent, b.getAttribute('aria-checked')])")
        check('the menu has «Налаштування» with «Рід у прикладах»: Тарас Шевченко (chosen) or Леся Українка', seg == [['Тарас Шевченкочоловічий рід', 'true'], ['Леся Українкажіночий рід', 'false']] and 'Рід у прикладах' in await text(pg, '#dset'), str(seg))
        await pg.click('#dset [data-gender="f"]'); await pg.wait_for_timeout(300)
        f = await said()
        check('Леся chosen: the open chapter changes at once, names, endings and how others address her',
              'Lessja' in f['who'] and 'Taras' not in f['who'] and 'Я встала о п’ятій' in f['text'] and 'А що ти робила у Берліні?' in f['text'] and 'Тарас' not in f['text'] and 'Лесі' in f['hero'], str({**f, 'text': f['text'][:160]}))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        await pg.goto(base + 'a1/?ch=1&tab=phr'); await pg.wait_for_timeout(600)
        f1 = await pg.evaluate("document.querySelector('#p-phr').textContent")
        check('… and stays chosen: chapter 1 as Lessja Ukrajinka (Frau Ukrajinka, пані Українко, spelled U-K-R-A-J-I-N-K-A)', 'Frau Ukrajinka' in f1 and 'пані Українко' in f1 and 'Ich heiße Lessja Ukrajinka.' in f1 and 'U-K-R-A-J-I-N-K-A.' in f1 and 'Schewtschenko' not in f1, f1[:200])
        await shot(pg, 'a1-lesia.png', False)
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        await pg.click('#dset [data-gender="m"]'); await pg.wait_for_timeout(300)
        back = await pg.evaluate("[document.querySelector('#p-phr').textContent.includes('Ich heiße Taras Schewtschenko.'), localStorage.getItem('dsimya-gender')]")
        check('back to Тарас in one tap', back == [True, 'm'], str(back))
        await ctx.close()

        # ---------------- the dark theme ----------------
        ctx, pg = await context(browser, theme='dark')
        await pg.goto(base + 'a1/?ch=4'); await pg.wait_for_timeout(600)
        dark = await pg.evaluate("({bg: getComputedStyle(document.body).backgroundColor, card: getComputedStyle(document.querySelector('.topic')).backgroundColor, de: getComputedStyle(document.querySelector('.topic i[lang=de]')).color})")
        check('dark theme: dark page and cards, German in a light colour', dark['bg'] == 'rgb(15, 20, 23)' and dark['card'] == 'rgb(24, 32, 38)' and dark['de'] == 'rgb(127, 211, 220)', str(dark))
        await shot(pg, 'a1-dark.png', False)
        await ctx.close()
        await browser.close()

    print(f'\n{len(fails)} failed' if fails else '\nall passed')
    for f in fails: print('  -', f)
    sys.exit(1 if fails else 0)

asyncio.run(main())
