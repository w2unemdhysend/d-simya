"""End-to-end check of /scan/ in headless Chrome.

  python3 tests/scan_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Needs: playwright, Pillow, numpy. Exits 1 if any check fails.
Covers: sheet detection and true proportions on four synthetic photos, the four looks,
pages kept after reload, the PDF, saving (Save As picker, folder picker, cancel, plain
download where there is no picker) and sharing, the camera (in-page camera on Telegram Android with a
fake camera, camera access denied, native file input elsewhere) and Telegram on Android
with a simulated Worker: sending the PDF to the chat and handing the pages to the browser.
"""
import asyncio, functools, http.server, json, math, os, re, sys, tempfile, threading
from email.parser import BytesParser
from email.policy import default
from PIL import Image
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import mkphoto

TG_ANDROID = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '',
  ready() {}, expand() {}, onEvent() {}, setHeaderColor() {}, setBackgroundColor() {},
  disableVerticalSwipes() {}, enableVerticalSwipes() {}, openLink(u) { window.__opened = u; },
  HapticFeedback: {selectionChanged() {}, notificationOccurred() {}, impactOccurred() {}},
  BackButton: {show() { window.__back = true; }, hide() { window.__back = false; }, onClick(f) { window.__backCb = f; }}}};"""
NO_TG = ''
NO_PICKER = 'window.showSaveFilePicker = undefined; window.showDirectoryPicker = undefined;'
# Stand-ins for the browser's Save As / folder dialogs and the share sheet; they record what the page writes
PICKERS = '''window.__w = {};
  const writable = name => ({ async write(b) { window.__w[name] = b; }, async close() {} });
  window.showSaveFilePicker = async o => { window.__pick = o; return {createWritable: async () => writable(o.suggestedName)}; };
  window.showDirectoryPicker = async () => ({ async getFileHandle(n) { return {createWritable: async () => writable(n)}; } });
  Object.defineProperty(navigator, 'canShare', {value: () => true});
  Object.defineProperty(navigator, 'share', {value: async d => { window.__shared = d.files.map(f => f.name + ' ' + f.type); }});'''
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail else ''))
    if not ok: fails.append(name)

def corner_error(found, truth, k, diag):
    return max(math.hypot(f['x'] / k - t[0], f['y'] / k - t[1]) for f, t in zip(found, truth)) / diag * 100

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=ROOT)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/scan/'

async def new_page(browser, tg_script, init=None):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 844}, accept_downloads=True)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg_script, content_type='text/javascript'))
    if init: await ctx.add_init_script(init)
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    async def no_real_worker(route):   # tests must never touch the live Worker
        fails.append('test reached the real Worker: ' + route.request.url); await route.abort()
    await ctx.route('**/*.workers.dev/**', no_real_worker)
    return ctx, pg

async def add_page(pg):
    await pg.click('#crop-next')
    await pg.wait_for_function("__scanState.enhanced && document.getElementById('pbusy').hidden", timeout=30000)
    await pg.click('#edit-add'); await pg.wait_for_selector('#v-home:not([hidden])')

async def to_crop_and_quad(pg):
    await pg.wait_for_selector('#v-crop:not([hidden])'); await pg.wait_for_timeout(300)
    return await pg.evaluate("({q: __scanState.quad, w: __scanState.work.width})")

async def main(tmp):
    truth = mkphoto.generate(tmp)
    url = serve()
    # the fake camera films photo p1 at half size
    cam = Image.open(f'{tmp}/p1.jpg').resize((1500, 2000))
    with open(f'{tmp}/cam.mjpeg', 'wb') as fh:
        for _ in range(3): cam.save(fh, 'JPEG', quality=90)
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=[
            '--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
            f'--use-file-for-fake-video-capture={tmp}/cam.mjpeg'])

        # 1. gallery photos: detection, proportions, looks, pages, PDF
        ctx, pg = await new_page(browser, NO_TG, NO_PICKER)
        await pg.goto(url); await pg.evaluate("indexedDB.deleteDatabase('dsimya-scan')"); await pg.reload()
        for n, t in truth.items():
            await pg.set_input_files('#in-gallery', f'{tmp}/{n}.jpg')
            r = await to_crop_and_quad(pg)
            err = corner_error(r['q'], t['corners'], r['w'] / t['W'], math.hypot(t['W'], t['H']))
            check(f'{n} corners found', err < 0.3, f'max error {err:.2f}% of diagonal')
            await pg.click('#crop-next')
            await pg.wait_for_function("__scanState.enhanced && document.getElementById('pbusy').hidden", timeout=30000)
            ratio = await pg.evaluate('__scanState.ratio')
            check(f'{n} true sheet proportions', abs(ratio / t['ratio'] - 1) < 0.01, f'{ratio:.3f} vs {t["ratio"]:.3f}')
            if n == 'p1':
                for mode in ['doc', 'bw', 'orig', 'color']:
                    await pg.click(f'.modes [data-mode="{mode}"]')
                    await pg.wait_for_function("document.getElementById('pbusy').hidden", timeout=30000)
                    w = await pg.evaluate("document.getElementById('prevcv').width")
                    check(f'look "{mode}" renders', w > 1000, f'{w}px wide')
            await pg.click('#edit-add'); await pg.wait_for_selector('#v-home:not([hidden])')
        await pg.reload(); await pg.wait_for_timeout(800)
        check('pages kept after reload', await pg.text_content('#pcount') == '4')
        async with pg.expect_download() as dl:
            await pg.click('#btn-pdf')
        pdf = open(await (await dl.value).path(), 'rb').read()
        check('no picker: PDF downloads, 4 pages', pdf.startswith(b'%PDF-') and pdf.count(b'/Type /Page /Parent') == 4)
        check('no share sheet: no share button', await pg.is_hidden('#btn-share'))

        # 2. outside Telegram the button opens the phone's own camera (file input)
        async with pg.expect_file_chooser() as fc:
            await pg.click('label[for="in-camera"]')
        chooser = await fc.value
        check('browser: native camera input', await chooser.element.get_attribute('capture') == 'environment' and await pg.is_hidden('#cam'))
        await ctx.close()

        # 2b. Save As / folder pickers and the share sheet
        ctx, pg = await new_page(browser, NO_TG, PICKERS)
        await pg.goto(url); await pg.wait_for_timeout(300)
        for n in ['p4', 'p2']:
            await pg.set_input_files('#in-gallery', f'{tmp}/{n}.jpg'); await to_crop_and_quad(pg); await add_page(pg)
        await pg.click('#btn-pdf')
        await pg.wait_for_function("Object.keys(window.__w).some(k => k.endsWith('.pdf'))", timeout=15000)
        head = await pg.evaluate("(async () => { const k = Object.keys(__w).find(k => k.endsWith('.pdf')); return new TextDecoder().decode((await __w[k].arrayBuffer()).slice(0, 5)) + ' ' + __pick.suggestedName; })()")
        check('Save As: PDF written where the person chose', head.startswith('%PDF-') and head.endswith('.pdf'), head)
        await pg.click('#btn-jpg')
        await pg.wait_for_function("Object.keys(window.__w).filter(k => k.endsWith('.jpg')).length === 2", timeout=15000)
        check('several photos: one folder choice, both files written', True)
        downloads = []; pg.on('download', lambda d: downloads.append(d))
        await pg.evaluate("() => { window.showSaveFilePicker = async () => { throw new DOMException('cancel', 'AbortError'); }; }")
        await pg.click('#btn-pdf'); await pg.wait_for_timeout(800)
        check('cancelled Save As: nothing downloads, no error', downloads == [] and await pg.is_hidden('#busy'))
        await pg.click('#btn-share')
        await pg.wait_for_function('window.__shared', timeout=15000)
        shared = await pg.evaluate('window.__shared')
        check('share button sends the PDF to the share sheet', len(shared) == 1 and shared[0].endswith('.pdf application/pdf'), str(shared))
        await ctx.close()

        # 3. Telegram on Android: the page runs the camera itself
        ctx, pg = await new_page(browser, TG_ANDROID)
        await pg.goto(url); await pg.wait_for_timeout(500)
        await pg.click('label[for="in-camera"]')
        await pg.wait_for_selector('#cam:not([hidden])')
        await pg.wait_for_function("document.getElementById('camvideo').videoWidth > 0", timeout=10000)
        check('telegram android: camera opens in page', await pg.evaluate('window.__back === true'))
        await pg.click('#cam-shot')
        r = await to_crop_and_quad(pg)
        t = truth['p1']
        err = corner_error(r['q'], t['corners'], r['w'] / t['W'], math.hypot(t['W'], t['H']))
        check('telegram android: shot goes to corners with sheet found', err < 1.0, f'max error {err:.2f}% of diagonal')
        check('telegram android: camera released after the shot', await pg.evaluate("document.getElementById('camvideo').srcObject === null"))
        await add_page(pg)
        visible = await pg.evaluate("['btn-pdf', 'btn-jpg', 'btn-send'].filter(id => !document.getElementById(id).hidden)")
        check('telegram android, no Worker: no save buttons that do nothing', visible == [], f'visible: {visible}')
        await pg.click('#savehint .hintbtn')
        check('telegram android, no Worker: offers to open the browser', (await pg.evaluate('window.__opened || ""')).endswith('/scan/'))
        await pg.click('label[for="in-camera"]'); await pg.wait_for_selector('#cam:not([hidden])')
        await pg.evaluate('window.__backCb()')   # back button closes the camera
        check('telegram android: back button closes camera', await pg.is_hidden('#cam'))
        await ctx.close()

        # 4. Telegram on Android, camera permission refused
        ctx, pg = await new_page(browser, TG_ANDROID, "navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('no', 'NotAllowedError'));")
        await pg.goto(url); await pg.wait_for_timeout(500)
        await pg.click('label[for="in-camera"]'); await pg.wait_for_timeout(400)
        toast = await pg.text_content('#toast')
        check('camera refused: explains what to do', 'Немає доступу до камери' in (toast or '') and await pg.is_hidden('#cam'))
        await ctx.close()

        # 5. Telegram on Android with the Worker set up: PDF to the chat, pages handed to the browser
        hid = '0b5e6a3c-1111-4222-8333-944455556666'
        worker = {'sent': b'', 'pages': [], 'meta_calls': 0, 'deleted': False}
        async def with_worker_url(route):
            resp = await route.fetch(); body = await resp.text()
            await route.fulfill(response=resp, body=re.sub(r"var WORKER_URL = '[^']*';", "var WORKER_URL = 'https://send.test';", body))
        async def fake_worker(route):
            req = route.request; path = req.url.split('send.test', 1)[1]
            cors = {'Access-Control-Allow-Origin': '*'}
            if req.method == 'POST' and path == '/':
                worker['sent'] = req.post_data_buffer or b''
                return await route.fulfill(status=200, headers=cors, content_type='application/json', body='{"ok":true}')
            if req.method == 'POST' and path == '/handoff':
                msg = BytesParser(policy=default).parsebytes(b'Content-Type: ' + req.headers['content-type'].encode() + b'\r\n\r\n' + req.post_data_buffer)
                fields = [(part.get_param('name', header='content-disposition'), part.get_content()) for part in msg.iter_parts()]
                worker['init'] = dict(fields).get('initData', '')
                worker['pages'] = [v for k, v in fields if k == 'page']
                return await route.fulfill(status=200, headers=cors, content_type='application/json', body=json.dumps({'ok': True, 'id': hid}))
            if req.method == 'GET' and path == f'/handoff/{hid}':
                worker['meta_calls'] += 1   # the first answer is "not there yet", like a slow Cloudflare copy
                if worker['meta_calls'] == 1: return await route.fulfill(status=404, headers=cors, body='{}')
                return await route.fulfill(status=200, headers=cors, content_type='application/json', body=json.dumps({'n': len(worker['pages'])}))
            if req.method == 'GET' and path.startswith(f'/handoff/{hid}/'):
                return await route.fulfill(status=200, headers=cors, content_type='image/jpeg', body=worker['pages'][int(path.rsplit('/', 1)[1])])
            if req.method == 'DELETE' and path == f'/handoff/{hid}':
                worker['deleted'] = True
                return await route.fulfill(status=200, headers=cors, content_type='application/json', body='{"ok":true}')
            await route.fulfill(status=404, headers=cors, body='{}')

        ctx, pg = await new_page(browser, TG_ANDROID.replace("initData: ''", "initData: 'query_id=AAH&hash=00'"))
        await ctx.route('**/scan/', with_worker_url); await ctx.route('https://send.test/**', fake_worker)
        await pg.goto(url); await pg.wait_for_timeout(500)
        await pg.set_input_files('#in-gallery', f'{tmp}/p4.jpg'); await to_crop_and_quad(pg); await add_page(pg)
        visible = await pg.evaluate("['btn-pdf', 'btn-jpg', 'btn-share', 'btn-send', 'btn-browser'].filter(id => !document.getElementById(id).hidden)")
        check('telegram android + Worker: "send to chat" (main) and "to the browser"', visible == ['btn-send', 'btn-browser'] and await pg.evaluate("document.getElementById('btn-send').classList.contains('primary')"), f'visible: {visible}')
        await pg.click('#btn-send')
        await pg.wait_for_function("(document.getElementById('toast').textContent || '').includes('Надіслано')", timeout=15000)
        body = worker['sent']
        check('telegram android + Worker: posts signed data and a PDF', b'name="initData"' in body and b'query_id=AAH' in body and b'%PDF-' in body)
        await pg.click('#btn-browser')
        await pg.wait_for_function("document.getElementById('btn-browser').textContent === 'Відкрити в браузері'", timeout=15000)
        check('hand-off: Telegram uploads the signed pages', worker.get('init', '').startswith('query_id=AAH') and len(worker['pages']) == 1 and worker['pages'][0][:3] == b'\xff\xd8\xff')
        await pg.click('#btn-browser')
        opened = await pg.evaluate('window.__opened || ""')
        check('hand-off: second tap opens the browser with the code', opened.endswith('/scan/#import=' + hid), opened)
        await ctx.close()

        ctx = await browser.new_context(viewport={'width': 390, 'height': 844})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
        await ctx.route('**/scan/', with_worker_url); await ctx.route('https://send.test/**', fake_worker)
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg.goto(url); await pg.wait_for_timeout(400)
        await pg.set_input_files('#in-gallery', f'{tmp}/p2.jpg'); await to_crop_and_quad(pg); await add_page(pg)   # a page the browser already had
        pg2 = await ctx.new_page(); pg2.on('pageerror', lambda e: fails.append(f'page error: {e}'))
        await pg2.goto(url + '#import=' + hid)
        await pg2.wait_for_function("document.getElementById('pcount').textContent === '2'", timeout=20000)
        state = await pg2.evaluate("({toast: document.getElementById('toast').textContent, hash: location.hash, w: __scanState.pages[1].w, h: __scanState.pages[1].h})")
        check('hand-off: browser adds the pages and keeps its own', 'Додано сторінок із Telegram: 1' in state['toast'] and state['hash'] == '' and state['w'] > 1000, json.dumps(state, ensure_ascii=False))
        await pg2.wait_for_timeout(300)
        check('hand-off: browser deletes the copy on the Worker', worker['deleted'] and worker['meta_calls'] == 2)
        await pg2.reload(); await pg2.wait_for_timeout(800)
        check('hand-off: both pages still there after reload', await pg2.text_content('#pcount') == '2')
        await ctx.close()
        await browser.close()

with tempfile.TemporaryDirectory() as tmp:
    asyncio.run(main(tmp))
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
