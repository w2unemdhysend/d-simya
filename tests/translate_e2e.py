"""Translation in /scan/, end to end in headless Chrome, with the Worker simulated.

  python3 tests/translate_e2e.py
  TESS_NODE_MODULES=/path/node_modules python3 tests/translate_e2e.py   serve Tesseract.js from a local
      npm install (tesseract.js@7.0.0 @tesseract.js-data/{deu,ukr}@1.0.0) instead of the jsDelivr CDN
  (CHROME=/path/to/chrome to use a system browser)

Needs: playwright, Pillow, pdftotext and pdffonts (poppler-utils). Exits 1 if a check fails.
Covers: text read on the phone from a made-up German letter (paragraphs rebuilt, address lines kept),
the signed request to the Worker, the translation on screen, the warning about lost numbers, fixing the
recognised text and translating again, a refusal with its message and retry, switching languages, nothing
sent twice, the translated PDF (real searchable text with an embedded font, then the scan), the hand-off
to the browser with the translation, the browser without Telegram, and the layout at 340 px.
"""
import asyncio, functools, http.server, json, os, re, subprocess, sys, tempfile, threading
from email.parser import BytesParser
from email.policy import default
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import mkletter

NM = os.environ.get('TESS_NODE_MODULES')
TG = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: 'query_id=AAH&user=%7B%22id%22%3A4242%7D&auth_date=1&hash=00',
  ready() {}, expand() {}, onEvent() {}, setHeaderColor() {}, setBackgroundColor() {},
  disableVerticalSwipes() {}, enableVerticalSwipes() {}, openLink(u) { window.__opened = u; },
  HapticFeedback: {selectionChanged() {}, notificationOccurred() {}, impactOccurred() {}},
  BackButton: {show() {}, hide() {}, onClick(f) { window.__backCb = f; }}}};"""
UK = ('Місто Musterstadt, міська адміністрація · Rathausplatz 1 · 12345 Musterstadt\n\nПані\nOlena Beispiel\nBeispielstraße 12\n12345 Musterstadt\n\n'
      'Musterstadt, 03.11.2026\nНомер справи (Aktenzeichen): 32-4711/26\n\nРішення (Bescheid) про плату за вивіз сміття 2026\n\nШановна пані Beispiel,\n\n'
      'для ділянки Beispielstraße 12 плату за вивіз сміття на 2026 рік встановлено в розмірі 248,40 €.\n\n'
      'Будь ласка, перекажіть суму до [дата] із зазначенням номера справи на рахунок міської каси.\n\n'
      'Проти цього рішення ви можете подати заперечення (Widerspruch) протягом місяця.\n\nЗ повагою\nЗа дорученням\nM. Schmidt')
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail else ''))
    if not ok: fails.append(name)

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/scan/'

def form(req):
    msg = BytesParser(policy=default).parsebytes(b'Content-Type: ' + req.headers['content-type'].encode() + b'\r\n\r\n' + req.post_data_buffer)
    return {p.get_param('name', header='content-disposition'): p.get_payload(decode=True) for p in msg.iter_parts()}

def pdf_text(data, tmp):
    path = os.path.join(tmp, 'out.pdf'); open(path, 'wb').write(data)
    text = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True).stdout
    fonts = subprocess.run(['pdffonts', path], capture_output=True, text=True).stdout
    return text, fonts

class FakeWorker:
    """Answers like worker/send-scan.js: /translate, / (PDF to the chat) and /handoff."""
    def __init__(self): self.calls, self.mode, self.pdfs, self.handoff = [], 'ok', [], None
    async def route(self, route):
        req, path = route.request, route.request.url.split('.workers.dev', 1)[1]
        if req.method == 'OPTIONS': return await route.fulfill(status=204, headers={'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*'})
        cors = {'Access-Control-Allow-Origin': '*'}
        if path == '/translate':
            f = form(req); self.calls.append({k: v.decode().replace('\r\n', '\n') for k, v in f.items()})   # forms send line breaks as CRLF
            if self.mode == 'limit': return await route.fulfill(status=429, json={'ok': False, 'error': 'daily_limit'}, headers=cors)
            text = UK if f['pair'] == b'de-uk' else 'Übersetzung: ' + f['text'].decode()[:80]
            return await route.fulfill(json={'ok': True, 'text': text}, headers=cors)
        if path == '/':
            self.pdfs.append(form(req)); return await route.fulfill(json={'ok': True}, headers=cors)
        if path == '/handoff' and req.method == 'POST':
            f = form(req); self.handoff = {'meta': json.loads(f['meta']), 'page': f['page']}
            return await route.fulfill(json={'ok': True, 'id': '0b5e6a3c-1111-4222-8333-944455556666'}, headers=cors)
        m = re.match(r'/handoff/[0-9a-f-]{36}(/(\d+))?$', path)
        if m and req.method == 'GET':
            if m.group(2): return await route.fulfill(body=self.handoff['page'], content_type='image/jpeg', headers=cors)
            return await route.fulfill(json={'n': 1, 'pages': self.handoff['meta']}, headers=cors)
        if m and req.method == 'DELETE': return await route.fulfill(json={'ok': True}, headers=cors)
        await route.fulfill(status=404, json={'ok': False}, headers=cors)

async def cdn(route):
    url = route.request.url
    if NM:
        path = url.split('/npm/', 1)[1]
        name, rest = re.match(r'((?:@[^/]+/)?[^@/]+)@[^/]+(/.*)', path).groups()
        f = os.path.join(NM, name, rest.lstrip('/'))
        if os.path.isfile(f):
            ct = 'application/wasm' if f.endswith('.wasm') else 'application/javascript' if f.endswith('.js') else 'application/octet-stream'
            return await route.fulfill(path=f, content_type=ct, headers={'Access-Control-Allow-Origin': '*'})
        fails.append('missing local file for ' + url); return await route.fulfill(status=404)
    await route.continue_()

async def context(browser, tg, letter, worker, width=390):
    ctx = await browser.new_context(viewport={'width': width, 'height': 844}, accept_downloads=True)
    await ctx.add_init_script('window.showSaveFilePicker = undefined;')   # a plain download, no Save As dialog
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg, content_type='text/javascript'))
    await ctx.route('https://cdn.jsdelivr.net/npm/**', cdn)
    await ctx.route('**/*.workers.dev/**', worker.route)
    await ctx.route('**/__test/letter.jpg', lambda r: r.fulfill(path=letter, content_type='image/jpeg'))
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    return ctx, pg

ADD_LETTER = """async () => {
  const blob = await (await fetch('/__test/letter.jpg')).blob(), bm = await createImageBitmap(blob);
  const db = await new Promise((res, rej) => { const r = indexedDB.open('dsimya-scan', 1); r.onupgradeneeded = () => r.result.createObjectStore('pages', {keyPath: 'id'}); r.onsuccess = () => res(r.result); r.onerror = rej; });
  await new Promise(res => { const t = db.transaction('pages', 'readwrite'); t.objectStore('pages').clear(); t.objectStore('pages').put({id: 'p1', blob, w: bm.width, h: bm.height, order: 0}); t.oncomplete = res; });
  db.close();
}"""
CARD = """() => { const c = document.querySelector('#trlist .trpage'); return {state: c.querySelector('.tstate').textContent,
  text: (c.querySelector('.trtext') || {}).textContent || '', err: (c.querySelector('.trerr') || {}).textContent || '',
  num: c.querySelector('.trnum').hidden ? '' : c.querySelector('.trnum').textContent, actions: !document.getElementById('tractions').hidden,
  pdf: document.getElementById('tr-pdf').textContent, pdfOn: !document.getElementById('tr-pdf').disabled}; }"""
DONE = "() => !!document.querySelector('#trlist .trpage') && !document.querySelector('#trlist .trpage .skel') && document.getElementById('trprog').hidden"

async def main(tmp):
    letter = os.path.join(tmp, 'letter.jpg'); mkletter.render(letter)
    url, worker = serve(), FakeWorker()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        # 1. Telegram on Android with the Worker: read, translate, check, fix, retry, switch, send
        ctx, pg = await context(browser, TG, letter, worker)
        await pg.goto(url); await pg.evaluate(ADD_LETTER); await pg.reload(); await pg.wait_for_timeout(500)
        check('home: "Перекласти документ" is offered', await pg.is_visible('#btn-tr'))
        await pg.click('#btn-tr')
        await pg.wait_for_selector('#v-tr:not([hidden])')
        check('progress is shown while working', await pg.is_visible('#trprog'), await pg.text_content('#trstep'))
        await pg.wait_for_function(DONE, timeout=90000)
        c = await pg.evaluate(CARD)
        sent = worker.calls[0] if worker.calls else {}
        src = sent.get('text', '')
        check('one signed request, German → Ukrainian', len(worker.calls) == 1 and sent.get('pair') == 'de-uk' and sent.get('initData', '').startswith('query_id='), str({k: v[:40] for k, v in sent.items()}))
        check('text read on the phone, numbers intact', all(n in src for n in mkletter.NUMBERS) and 'Abfallgebühren' in src, src[:120])
        check('running text joined into paragraphs, address lines kept apart',
              'Olena Beispiel\nBeispielstraße 12\n12345 Musterstadt' in src and 'für das Jahr 2026 auf 248,40 € festgesetzt.' in src and '\n\nGegen diesen Bescheid' in src, repr(src[:400]))
        check('translation on screen', c['state'] == 'Перекладено' and c['text'].startswith('Місто Musterstadt') and c['actions'], c['state'])
        check('lost number flagged: 24.11.2026', '24.11.2026' in c['num'] and '248,40' not in c['num'], c['num'])
        check('Telegram on Android: the main button sends the PDF to the chat', c['pdf'] == 'Надіслати в чат' and c['pdfOn'])

        # fix the recognised text, then a refusal, then retry
        await pg.click('#trlist [data-act="orig"]')
        ta = '#trlist textarea'
        check('"Оригінал" swaps the translation for the recognised text', await pg.is_visible(ta) and 'Abfallgebühren' in await pg.input_value(ta) and await pg.is_hidden('#trlist .tbody') and await pg.text_content('#trlist [data-act="orig"]') == 'Переклад')
        await pg.fill(ta, (await pg.input_value(ta)).replace('Abfallgebühren 2026', 'Abfallgebühren für 2026'))
        check('editing shows "Перекласти ще раз"', await pg.is_visible('#trlist [data-act="redo"]'))
        worker.mode = 'limit'
        await pg.click('#trlist [data-act="redo"]'); await pg.wait_for_function(DONE, timeout=30000)
        c = await pg.evaluate(CARD)
        check('refusal explained, with a retry button', '80 сторінок' in c['err'] and await pg.is_visible('#trlist [data-act="retry"]'), c['err'])
        check('the edited text was sent', 'Abfallgebühren für 2026' in worker.calls[-1]['text'])
        worker.mode = 'ok'
        await pg.click('#trlist [data-act="retry"]'); await pg.wait_for_function(DONE, timeout=30000)
        c = await pg.evaluate(CARD)
        check('retry translates', c['state'] == 'Перекладено' and c['text'].startswith('Місто'), c['state'])

        # other languages, then back: nothing is translated twice
        n = len(worker.calls)
        await pg.click('.pairs [data-pair="uk-de"]'); await pg.wait_for_function(DONE, timeout=90000)
        check('Ukrainian → German: page read again as Ukrainian and sent with the new pair', len(worker.calls) == n + 1 and worker.calls[-1]['pair'] == 'uk-de')
        await pg.click('.pairs [data-pair="de-uk"]'); await pg.wait_for_function(DONE, timeout=90000)
        check('back to German → Ukrainian: kept from before, not sent again', len(worker.calls) == n + 1 and (await pg.evaluate(CARD))['text'].startswith('Місто'))
        n = len(worker.calls)
        await pg.click('#tr-back'); await pg.wait_for_selector('#v-home:not([hidden])')
        await pg.reload(); await pg.wait_for_timeout(500)
        await pg.click('#btn-tr'); await pg.wait_for_function(DONE, timeout=30000)
        c = await pg.evaluate(CARD)
        check('after a reload the translation is still there, nothing sent again', len(worker.calls) == n and c['text'].startswith('Місто'), f'{len(worker.calls)} vs {n}')
        check('fits 390 px without sideways scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= 390)
        await pg.screenshot(path=os.path.join(tmp, 'tr-android.png'), full_page=True)

        await pg.click('#tr-pdf'); await pg.wait_for_timeout(1500)
        f = worker.pdfs[-1] if worker.pdfs else {}
        data = f.get('file', b'')
        text, fonts = pdf_text(data, tmp) if data else ('', '')
        check('PDF sent to the chat, caption says translation', data.startswith(b'%PDF-') and f.get('caption', b'').decode().startswith('Переклад'))
        check('PDF: text page, then the scan', data.count(b'/Type /Page /Parent') == 2 and data.count(b'/Subtype /Image') == 1)
        check('PDF: real text, searchable', 'Переклад документа' in text and 'Сторінка 1' in text and 'заперечення (Widerspruch)' in text and 'Beispielstraße 12' in text, text[:300])
        check('PDF: font embedded', 'NotoSans' in fonts and re.search(r'CID TrueType\s+Identity-H\s+yes\s+yes\s+yes', fonts) is not None, fonts)

        # hand-off to the browser carries the translation
        await pg.click('#tr-back'); await pg.wait_for_selector('#v-home:not([hidden])')
        await pg.click('#btn-browser'); await pg.wait_for_timeout(800)
        meta = (worker.handoff or {}).get('meta') or [{}]
        check('hand-off sends the translation with the page', ((meta[0].get('tr') or {}).get('de-uk') or {}).get('text', '').startswith('Місто'), str(meta)[:120])
        link = ''
        await pg.click('#btn-browser'); link = await pg.evaluate('window.__opened || ""')
        await ctx.close()

        # 2. the browser, opened from that link: translation is there, PDF downloads
        ctx, pg = await context(browser, '', letter, worker, width=340)
        await pg.goto(url); await pg.evaluate("indexedDB.deleteDatabase('dsimya-scan')")
        await pg.goto(link.replace('#', '?x#') if link else url); await pg.wait_for_selector('#btn-tr', state='visible', timeout=20000)
        n = len(worker.calls)
        await pg.click('#btn-tr'); await pg.wait_for_function(DONE, timeout=30000)
        c = await pg.evaluate(CARD)
        check('browser: handed-off page arrives translated, nothing sent', c['text'].startswith('Місто') and len(worker.calls) == n and await pg.is_hidden('#trnote'))
        check('browser: main button saves the PDF', c['pdf'] == 'Зберегти PDF')
        async with pg.expect_download() as dl:
            await pg.click('#tr-pdf')
        d = await dl.value
        data = open(await d.path(), 'rb').read(); text, _ = pdf_text(data, tmp)
        check('browser: translated PDF downloads', d.suggested_filename.startswith('Переклад_') and 'Сторінка 1' in text, d.suggested_filename)
        check('fits 340 px without sideways scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= 340)

        # 3. the browser with a page that was never translated: says where translating works
        await pg.click('.pairs [data-pair="en-uk"]'); await pg.wait_for_timeout(400)
        c = await pg.evaluate(CARD)
        note = await pg.text_content('#trnote')
        check('browser: explains that translating works in Telegram, links the bot', await pg.is_visible('#trnote') and 'Telegram' in note and await pg.get_attribute('#trnote a', 'href') == 'https://t.me/whysendbot' and len(worker.calls) == n, note)
        check('browser: nothing to save yet', not c['pdfOn'])
        await pg.screenshot(path=os.path.join(tmp, 'tr-browser.png'), full_page=True)
        await ctx.close()

        # 4. a changed recognition file on the CDN is refused: nothing runs, nothing is sent
        async def tampered(route):
            if route.request.url.endswith('/dist/worker.min.js'):
                return await route.fulfill(body='self.onmessage=()=>{};/* changed */', content_type='application/javascript', headers={'Access-Control-Allow-Origin': '*'})
            await cdn(route)
        ctx, pg = await context(browser, TG, letter, worker)
        await ctx.unroute('https://cdn.jsdelivr.net/npm/**'); await ctx.route('https://cdn.jsdelivr.net/npm/**', tampered)
        await pg.goto(url); await pg.evaluate("indexedDB.deleteDatabase('dsimya-scan')"); await pg.evaluate(ADD_LETTER); await pg.reload(); await pg.wait_for_timeout(500)
        n = len(worker.calls)
        await pg.click('#btn-tr'); await pg.wait_for_function(DONE, timeout=30000)
        c = await pg.evaluate(CARD)
        check('a changed file from the CDN is refused, no text leaves the phone', 'Не вдалося розпізнати текст' in c['err'] and len(worker.calls) == n and not await pg.evaluate('!!window.__tessRan'), c['err'])
        await ctx.close()
        await browser.close()
    print('screenshots:', tmp)

tmp = tempfile.mkdtemp(prefix='trtest-')
asyncio.run(main(tmp))
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
