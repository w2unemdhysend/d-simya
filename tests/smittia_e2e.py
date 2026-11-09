"""End-to-end check of /smittia/ (waste collection) in headless Chrome, with the clock frozen.

  python3 tests/smittia_e2e.py          (CHROME=/path/to/chrome to use a system browser)

Covers: next pickup and the coming list for the household, the grey-bin rhythm hint, the
hazardous-waste date, the switch outside Telegram, and switching reminders on and off in
Telegram against a simulated Worker (also when the Worker fails). Exits 1 if a check fails.
"""
import asyncio, datetime, functools, http.server, os, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TG = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: 'query_id=AAH&hash=00',
  ready() {}, expand() {}, onEvent() {}, setHeaderColor() {}, setBackgroundColor() {},
  HapticFeedback: {notificationOccurred() {}, selectionChanged() {}, impactOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};"""
NOW = datetime.datetime(2026, 11, 9, 19, 30, tzinfo=datetime.timezone(datetime.timedelta(hours=1)))   # Monday evening in Xanten
fails = []

def check(name, ok, detail=''):
    print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail else ''))
    if not ok: fails.append(name)

def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f'http://127.0.0.1:{srv.server_address[1]}/smittia/'

async def page(browser, url, tg_script, worker=None):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 844})
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg_script, content_type='text/javascript'))
    if worker: await ctx.route('**/*.workers.dev/**', worker)
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.set_fixed_time(NOW)
    await pg.goto(url); await pg.wait_for_function("document.querySelector('#next .date')", timeout=10000)
    return ctx, pg

async def main():
    url = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        ctx, pg = await page(browser, url, '')
        nxt = await pg.text_content('#next')
        check('next pickup: Thursday, yellow bin', 'Четвер' in nxt and '12 листопада' in nxt and 'четвер,' not in nxt and 'Жовтий бак' in nxt and 'Сірий' not in nxt, ' '.join(nxt.split()))
        days = ' '.join((await pg.text_content('#days')).split())
        check('coming pickups in order', days.index('17 листопада') < days.index('20 листопада') < days.index('26 листопада') and 'Сірий бак' in days and 'лише двотижневі' in days and 'Синій бак' in days and 'Коричневий' not in days, days[:160])
        rhythm = await pg.text_content('#rhythm')
        check('hint how to find out the grey bin rhythm', '17 листопада забирають лише' in rhythm and await pg.is_visible('#rhythm'))
        check('hazardous waste: next Schadstoffmobil date', '21 листопада' in await pg.text_content('#schadstoff'))
        check('outside Telegram: switch off and explained', await pg.is_disabled('#sw') and 'через бота в Telegram' in await pg.text_content('#sw-state'))
        check('no horizontal scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= 390)
        check('footer names district 2', 'район 2: Lüttingen' in await pg.text_content('#foot'))
        await ctx.close()

        calls, state = [], {'on': False, 'fail': False, 'blocked': False}
        async def worker(route):
            body = route.request.post_data_buffer or b''
            action = 'on' if b'\r\n\r\non\r\n' in body else 'off' if b'\r\n\r\noff\r\n' in body else 'status'
            calls.append((action, b'query_id=AAH' in body))
            if state['fail'] and action != 'status':
                return await route.fulfill(status=500, headers={'Access-Control-Allow-Origin': '*'}, content_type='application/json', body='{"ok":false}')
            if state['blocked'] and action == 'on':
                return await route.fulfill(status=200, headers={'Access-Control-Allow-Origin': '*'}, content_type='application/json', body='{"ok":false,"on":false,"error":"bot_blocked"}')
            if action != 'status': state['on'] = action == 'on'
            await route.fulfill(status=200, headers={'Access-Control-Allow-Origin': '*'}, content_type='application/json', body='{"ok":true,"on":%s,"confirmed":true}' % str(state['on']).lower())
        ctx, pg = await page(browser, url, TG, worker)
        await pg.wait_for_function("!document.getElementById('sw').disabled", timeout=10000)
        check('telegram: status asked with signed data', calls and calls[0] == ('status', True), str(calls))
        await pg.click('#sw')
        await pg.wait_for_function("document.getElementById('sw').getAttribute('aria-checked') === 'true' && !document.getElementById('sw').disabled", timeout=10000)
        check('telegram: switching on, confirmation sent to the chat', state['on'] and 'надіслав підтвердження' in await pg.text_content('#sw-state'))
        await pg.click('#sw')
        await pg.wait_for_function("document.getElementById('sw').getAttribute('aria-checked') === 'false' && !document.getElementById('sw').disabled", timeout=10000)
        check('telegram: switching off', not state['on'] and 'Вимкнено' in await pg.text_content('#sw-state'))
        state['fail'] = True
        await pg.click('#sw')
        await pg.wait_for_function("(document.getElementById('sw-state').textContent || '').includes('Не вдалося')", timeout=10000)
        check('telegram: Worker error keeps the switch as it was', await pg.get_attribute('#sw', 'aria-checked') == 'false')
        state['fail'] = False; state['blocked'] = True
        await pg.click('#sw')
        await pg.wait_for_function("(document.getElementById('sw-state').textContent || '').includes('Бот не може')", timeout=10000)
        check('telegram: bot may not write yet, says to press Start', await pg.get_attribute('#sw', 'aria-checked') == 'false' and 'Start' in await pg.text_content('#sw-state'))
        await ctx.close()
        await browser.close()

asyncio.run(main())
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
