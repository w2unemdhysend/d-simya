"""End-to-end check of /scan/ in headless Chrome.

  python3 tests/scan_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Needs: playwright, Pillow, numpy. Exits 1 if any check fails.
Covers: sheet detection and true proportions on four synthetic photos, the four looks,
pages kept after reload, the PDF, the camera (in-page camera on Telegram Android with a
fake camera, camera access denied, native file input elsewhere) and saving on Telegram
Android (browser fallback, and sending to the chat through a simulated Worker).
"""
import asyncio, functools, http.server, json, math, os, sys, tempfile, threading
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
        ctx, pg = await new_page(browser, NO_TG)
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
        check('PDF has 4 pages', pdf.startswith(b'%PDF-') and pdf.count(b'/Type /Page /Parent') == 4)

        # 2. outside Telegram the button opens the phone's own camera (file input)
        async with pg.expect_file_chooser() as fc:
            await pg.click('label[for="in-camera"]')
        chooser = await fc.value
        check('browser: native camera input', await chooser.element.get_attribute('capture') == 'environment' and await pg.is_hidden('#cam'))
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

        # 5. Telegram on Android with the Worker set up: the PDF goes to the chat
        ctx, pg = await new_page(browser, TG_ANDROID.replace("initData: ''", "initData: 'query_id=AAH&hash=00'"))
        async def with_send_url(route):
            resp = await route.fetch(); body = await resp.text()
            await route.fulfill(response=resp, body=body.replace("var SEND_URL = '';", "var SEND_URL = 'https://send.test/';"))
        sent = {}
        async def fake_worker(route):
            sent['body'] = route.request.post_data_buffer or b''
            await route.fulfill(status=200, headers={'Access-Control-Allow-Origin': '*'}, content_type='application/json', body='{"ok":true}')
        await ctx.route('**/scan/', with_send_url)
        await ctx.route('https://send.test/**', fake_worker)
        await pg.goto(url); await pg.wait_for_timeout(500)
        await pg.set_input_files('#in-gallery', f'{tmp}/p4.jpg'); await to_crop_and_quad(pg); await add_page(pg)
        visible = await pg.evaluate("['btn-pdf', 'btn-jpg', 'btn-send'].filter(id => !document.getElementById(id).hidden)")
        check('telegram android + Worker: only "send to chat", as the main button', visible == ['btn-send'] and await pg.evaluate("document.getElementById('btn-send').classList.contains('primary')"), f'visible: {visible}')
        await pg.click('#btn-send')
        await pg.wait_for_function("(document.getElementById('toast').textContent || '').includes('Надіслано')", timeout=15000)
        body = sent.get('body', b'')
        check('telegram android + Worker: posts signed data and a PDF', b'name="initData"' in body and b'query_id=AAH' in body and b'%PDF-' in body)
        await ctx.close()
        await browser.close()

with tempfile.TemporaryDirectory() as tmp:
    asyncio.run(main(tmp))
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
