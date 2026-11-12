"""The newer pages in headless Chrome: Бот (digest, commands, failure messages), Екстрено, Розмовник.

  python3 tests/pages_e2e.py     (CHROME=/path/to/chrome to use a system browser; SHOTS=dir for screenshots)

Covers. Бот: outside Telegram the switches explain themselves; inside, states are read, the digest switch sends the
place, bins, stop and time chosen in the other sections, a new time is saved quietly, the commands switch says why it
cannot be switched on over someone else's webhook, the other reminders show their state. Екстрено: the numbers and
their phone links, the address sentence stays on the phone, links to maps and the night pharmacy. Розмовник:
situations, search in both languages, a phrase across the screen, the recorded clips (also where Android's
WebView has no speech synthesis), fetched ahead. 340 px, no sideways
scrolling. Exits 1 if a check fails.
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

TG = """window.__opened = []; window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: 'user=%7B%22id%22%3A1%7D&hash=x', ready() {}, expand() {}, onEvent() {},
  setHeaderColor() {}, setBackgroundColor() {}, openLink(u) { window.__opened.push(u); }, HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};"""

class Worker:
    """Stands in for the Cloudflare Worker: remembers every form it gets and what is switched on."""
    def __init__(self, on=(), hook_error=None, time='07:30'):
        self.posts, self.on, self.hook_error, self.time = [], set(on), hook_error, time
    async def __call__(self, route):
        path = re.sub(r'^https?://[^/]+', '', route.request.url)
        body = route.request.post_data or ''
        f = dict(re.findall(r'name="([^"]+)"\r\n\r\n([^\r]*)', body))
        self.posts.append((path, f))
        cors = {'Access-Control-Allow-Origin': '*'}
        key = 'commands' if path == '/commands' else f.get('kind', '')
        act = f.get('action')
        if path == '/commands' and act == 'on' and self.hook_error: return await route.fulfill(json={'ok': False, 'on': False, 'error': self.hook_error}, headers=cors)
        if act == 'on': self.on.add(key)
        if act == 'off': self.on.discard(key)
        if act == 'prefs' and f.get('time'): self.time = f['time']
        d = {'ok': True, 'on': key in self.on}
        if key == 'ranok' and key in self.on: d['time'] = self.time
        await route.fulfill(json=d, headers=cors)

async def page(browser, base, path, tg='', worker=None, store=None, width=340, speech=False):
    ctx = await browser.new_context(viewport={'width': width, 'height': 800})
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg, content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    w = worker or Worker(); await ctx.route('**/*.workers.dev/**', w)
    init = ''.join(f"localStorage.setItem({json.dumps(k)}, {json.dumps(json.dumps(v))});" for k, v in (store or {}).items())
    if speech:   # a phone with a German voice: remembers what it was asked to say
        init += """window.__said = []; window.SpeechSynthesisUtterance = function (t) { this.text = t; };
          Object.defineProperty(window, 'speechSynthesis', {value: {getVoices: () => [{lang: 'en-US', name: 'E'}, {lang: 'de-DE', name: 'Anna'}], addEventListener() {}, cancel() {},
            speak(u) { window.__said.push([u.text, u.lang, u.voice && u.voice.name]); setTimeout(() => u.onend && u.onend(), 50); }}});"""
    else: init += "try { delete window.speechSynthesis; Object.defineProperty(window, 'speechSynthesis', {get: () => undefined}); delete window.SpeechSynthesisUtterance; } catch (e) {}"
    # audio is not really played in the test: remember what would be
    # remember which file a fetched-ahead copy (blob:) came from, so a check can name the clip
    init += """window.__played = []; window.__blobs = {};
      const rb = Response.prototype.blob; Response.prototype.blob = function () { const u = this.url; return rb.call(this).then((b) => { b.__src = u; return b; }); };
      const oc = URL.createObjectURL; URL.createObjectURL = function (b) { const r = oc.call(URL, b); if (b && b.__src) window.__blobs[r] = b.__src; return r; };
      HTMLMediaElement.prototype.play = function () { window.__played.push(window.__blobs[this.src] || this.src); const a = this; setTimeout(() => a.onended && a.onended(), 300); return Promise.resolve(); };"""
    await ctx.add_init_script(init)
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.goto(base + path); await pg.wait_for_timeout(500)
    return ctx, pg, w

HOME = {'smittia-prefs': {'district': '2', 'place': 'Lüttingen', 'bins': ['rest', 'papier', 'gelb'], 'rhythm': '14'},
        'transport-stops': {'list': [{'id': 'de:05170:37032', 'name': 'Xanten, Bahnhof'}], 'active': 'de:05170:37032'}}
fits = "document.documentElement.scrollWidth <= innerWidth"
AUDIO = json.loads(__import__('subprocess').check_output(['node', '--input-type=module', '-e', "import('./audio/index.js').then(m => console.log(JSON.stringify(m.AUDIO)))"], cwd=ROOT))

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        # ---------- Бот ----------
        ctx, pg, w = await page(browser, base, 'bot/')
        check('bot, outside Telegram: every switch is off and says where it works', await pg.locator('.switch:disabled').count() == 3 and all('через бота в Telegram' in t for t in await pg.locator('.state').all_text_contents()))
        check('bot, nothing chosen yet: says where to choose the place, bins and stop', 'вибрати своє місце' in await pg.text_content('#what') and 'вибрати в «Сміття»' in await pg.text_content('#what') and 'вибрати в «Транспорт»' in await pg.text_content('#what'))
        check('bot: fits 340 px', await pg.evaluate(fits)); await ctx.close()

        ctx, pg, w = await page(browser, base, 'bot/', tg=TG, store=HOME, worker=Worker(on=['smittia', 'wetter']))
        await pg.wait_for_function("!document.querySelector('#sw-brief').disabled")
        what = re.sub(r'\s+', ' ', await pg.text_content('#what'))
        check('bot: shows what the digest will use (place, district and bins, stop)', 'Lüttingen' in what and 'район 2: сірий бак, синій бак, жовтий бак' in what and 'Xanten Bahnhof' in what, what)
        others = await pg.evaluate("() => [...document.querySelectorAll('#others li')].map(l => [l.querySelector('b').textContent, l.querySelector('.st').textContent, l.querySelector('a').getAttribute('href')])")
        check('bot: the other reminders with their state and a way to them', others == [['Сміття', 'увімкнено', '../smittia/'], ['Проспекти', 'вимкнено', '../prospekty/'], ['Попередження про негоду', 'увімкнено', '../pogoda/'], ['Слово дня', 'вимкнено', '../igry/?tab=art']], str(others))
        prof = [f for path, f in w.posts if f.get('kind') == 'ranok' and f.get('action') == 'prefs']
        check('bot: the choices are sent as the profile for the commands, once', len(prof) == 1 and prof[0].get('stop') == 'de:05170:37032' and prof[0].get('place') == 'Lüttingen' and prof[0].get('bins') == 'rest,papier,gelb', str(prof))
        await pg.click('#times [data-time="06:30"]'); await pg.wait_for_timeout(200)
        await pg.click('#sw-brief'); await pg.wait_for_timeout(300)
        on = [f for path, f in w.posts if f.get('kind') == 'ranok' and f.get('action') == 'on']
        check('digest on: one request with time, place, district, bins, rhythm and stop', len(on) == 1 and on[0]['time'] == '06:30' and on[0]['district'] == '2' and on[0]['rhythm'] == '14' and on[0]['stopName'] == 'Xanten Bahnhof', str(on))
        check('digest on: the switch and its line say so', await pg.get_attribute('#sw-brief', 'aria-checked') == 'true' and 'підтвердження в чат' in await pg.text_content('#st-brief'))
        await pg.click('#times [data-time="08:00"]'); await pg.wait_for_timeout(300)
        check('a new time while on: saved quietly, the line names it', w.posts[-1][1].get('action') == 'prefs' and w.time == '08:00' and 'о 08:00' in await pg.text_content('#st-brief'))
        await pg.reload(); await pg.wait_for_function("!document.querySelector('#sw-brief').disabled"); await pg.wait_for_timeout(200)
        check('after reload: still on, the saved time chosen', await pg.get_attribute('#sw-brief', 'aria-checked') == 'true' and await pg.get_attribute('#times [data-time="08:00"]', 'aria-checked') == 'true')
        await pg.click('#sw-cmd'); await pg.wait_for_timeout(300)
        check('commands on: asks the Worker, says the list is in the chat', ('/commands', {'initData': 'user=%7B%22id%22%3A1%7D&hash=x', 'action': 'on'}) in w.posts and 'Список команд' in await pg.text_content('#st-cmd'))
        await pg.click('#sw-alert'); await pg.wait_for_timeout(300)
        check('failure messages on', await pg.get_attribute('#sw-alert', 'aria-checked') == 'true' and any(f.get('kind') == 'zboi' and f.get('action') == 'on' for _, f in w.posts))
        await pg.click('#sw-alert'); await pg.wait_for_timeout(300)
        check('… and off again', await pg.get_attribute('#sw-alert', 'aria-checked') == 'false' and 'Вимкнено' in await pg.text_content('#st-alert'))
        check('bot in Telegram: fits 340 px', await pg.evaluate(fits))
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'bot.png'), full_page=True)
        await ctx.close()

        ctx, pg, w = await page(browser, base, 'bot/', tg=TG, worker=Worker(hook_error='other_webhook'))
        await pg.wait_for_function("!document.querySelector('#sw-cmd').disabled")
        await pg.click('#sw-cmd'); await pg.wait_for_timeout(300)
        check('commands: someone else\'s webhook is not replaced, and the page says why', await pg.get_attribute('#sw-cmd', 'aria-checked') == 'false' and 'іншого сервісу' in await pg.text_content('#st-cmd'))
        await ctx.close()

        # ---------- Екстрено ----------
        ctx, pg, w = await page(browser, base, 'ekstreno/', tg=TG)
        nums = await pg.evaluate("() => [...document.querySelectorAll('a.num')].map(a => [a.querySelector('.n').textContent, a.getAttribute('href')])")
        check('emergency: 112 and 110 first, then the doctor on call, pharmacy, poison line, helplines', [n for n, _ in nums][:3] == ['112', '110', '116 117'] and
              {'0228 19240', '0800 00 22833', '116 116', '0800 500 225 0', '116 016'} <= {n for n, _ in nums}, str(nums))
        check('emergency: every number is a phone link with the same digits', all(h.startswith('tel:') and re.sub(r'\D', '', n).lstrip('0') in re.sub(r'\D', '', h.replace('+49', '0')).lstrip('0') for n, h in nums), str(nums))
        check('emergency: German sentences to read out, each with its meaning', await pg.locator('.say li').count() >= 6 and 'Ich brauche einen Krankenwagen.' in await pg.text_content('.say'))
        await pg.fill('#addr', 'Musterweg 7'); await pg.wait_for_timeout(100)
        check('emergency: the address becomes a sentence to read out', await pg.text_content('#addr-out') == 'Ich bin in 46509 Xanten, Musterweg 7.')
        check('emergency: the address is kept on the phone only (no request made)', await pg.evaluate("localStorage.getItem('ekstreno-addr')") == 'Musterweg 7' and not w.posts)
        await pg.reload(); await pg.wait_for_timeout(300)
        check('emergency: the address is still there after reload', await pg.input_value('#addr') == 'Musterweg 7')
        await pg.click('a.go >> nth=1'); await pg.wait_for_timeout(100)
        check('emergency: the night pharmacy for 46509 opens outside Telegram\'s window', await pg.evaluate('window.__opened') == ['https://www.aponet.de/notdienstsuche/46509-Xanten'])
        check('emergency: fits 340 px', await pg.evaluate(fits))
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'ekstreno.png'), full_page=True)
        await ctx.close()

        # ---------- Розмовник ----------
        ctx, pg, w = await page(browser, base, 'rozmovnyk/', speech=True)
        sits = await pg.locator('#sits .chip').all_text_contents()
        check('phrasebook: situations, the first one chosen', len(sits) == 8 and sits[0] == 'Найпотрібніше' and 'У лікаря' in sits and await pg.get_attribute('#sits .chip >> nth=0', 'aria-checked') == 'true', str(sits))
        await pg.click('#sits [data-sit="arzt"]'); await pg.wait_for_timeout(100)
        first = await pg.text_content('.ph .de >> nth=0')
        check('phrasebook: "У лікаря" shows its phrases, German with Ukrainian', first == 'Ich hätte gern einen Termin.' and 'записатися на прийом' in await pg.text_content('.ph .uk >> nth=0') and await pg.locator('.ph').count() >= 10, first)
        await pg.click('.ph .say >> nth=0'); await pg.wait_for_timeout(150)
        played = await pg.evaluate('window.__played')
        check('phrasebook: plays the recorded clip of the phrase, not the phone\'s own voice', len(played) == 1 and played[0].endswith(AUDIO['Ich hätte gern einen Termin.'].split('/')[-1]) and await pg.evaluate('window.__said') == [], str(played))
        await pg.fill('#find', 'рецепт'); await pg.wait_for_timeout(100)
        found = await pg.locator('.ph .de').all_text_contents()
        check('phrasebook: search in Ukrainian finds phrases from several situations', 'Ich brauche ein neues Rezept.' in found and 'Ich möchte dieses Rezept einlösen.' in found and 'Знайдено: ' in await pg.text_content('#title'), str(found))
        await pg.fill('#find', 'gross'); await pg.wait_for_timeout(100)
        check('phrasebook: search in German without umlauts or ß ("gross" finds "Größe")', await pg.locator('.ph .de').all_text_contents() == ['Haben Sie das auch in einer anderen Größe?'])
        await pg.fill('#find', 'щщщ'); await pg.wait_for_timeout(100)
        check('phrasebook: nothing found says so', await pg.is_visible('#empty') and await pg.locator('.ph').count() == 0)
        await pg.fill('#find', ''); await pg.wait_for_timeout(100)
        await pg.click('.ph .txt >> nth=1'); await pg.wait_for_timeout(100)
        check('phrasebook: a tap shows the phrase across the screen', await pg.is_visible('#big') and await pg.text_content('#big-de') == 'Ich habe einen Termin um … Uhr.')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
        check('phrasebook: Escape closes it, focus back on the phrase', await pg.is_hidden('#big') and await pg.evaluate("document.activeElement.classList.contains('txt')"))
        await pg.reload(); await pg.wait_for_timeout(300)
        check('phrasebook: the situation is remembered', await pg.get_attribute('#sits [data-sit="arzt"]', 'aria-checked') == 'true')
        check('phrasebook: fits 340 px', await pg.evaluate(fits))
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'rozmovnyk.png'), full_page=True)
        await ctx.close()

        # Telegram on Android: its WebView has no speech synthesis at all; the recorded clips are played instead
        ctx, pg, w = await page(browser, base, 'rozmovnyk/', tg=TG)
        audio_req = []
        pg.on('request', lambda r: audio_req.append(r.url) if '/audio/' in r.url and r.url.endswith('.mp3') else None)
        await pg.click('#sits [data-sit="arzt"]'); await pg.wait_for_timeout(600)
        check('Android (no speech synthesis): every phrase still has a speaker button', await pg.locator('.ph .say').count() == await pg.locator('.ph').count() > 0)
        check('the clips of the phrases on screen are fetched ahead', len(audio_req) >= 10 and all(u.endswith('.mp3') for u in audio_req), str(len(audio_req)))
        await pg.click('.ph .say >> nth=2'); await pg.wait_for_timeout(150)
        played = await pg.evaluate('window.__played')
        check('a tap plays the clip of that phrase (the copy fetched ahead)', len(played) == 1 and played[0].endswith('/audio/' + AUDIO['Hier ist meine Versichertenkarte.']), str(played))
        check('… and the button shows it is playing', await pg.locator('.ph .say.on').count() == 1)
        await pg.click('.ph .txt >> nth=0'); await pg.wait_for_timeout(100)
        check('the big view has "Прослухати" too', await pg.is_visible('#big') and await pg.is_visible('#big-say'))
        await pg.click('#big-say'); await pg.wait_for_timeout(100)
        check('… and it plays the clip', len(await pg.evaluate('window.__played')) == 2)
        for f in sorted(set(AUDIO.values()))[:5]:
            r = await pg.request.get(base + 'audio/' + f)
            check(f'clip {f} is served as audio', r.status == 200 and len(await r.body()) > 1500 and 'audio' in r.headers.get('content-type', ''))
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
