"""The section menu (assets/ui.js) on every page, in headless Chrome.

  python3 tests/menu_e2e.py            (CHROME=/path/to/chrome to use a system browser)

Covers: the button opens the side panel with every section and marks the current one, focus
moves into the panel and stays there, Esc and the phone's Back button close it, the rest of
the page is unreachable while it is open, and going to another section leaves a clean history
(Back returns to the page, not to an open menu). Exits 1 if a check fails.
"""
import asyncio, functools, http.server, os, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# in menu order: home first, the appliance instructions last
PAGES = {'': 'Головна', 'transport/': 'Транспорт', 'marshrut/': 'Маршрут', 'mapa/': 'Мапа', 'pogoda/': 'Погода', 'smittia/': 'Сміття', 'spysok/': 'Список покупок', 'prospekty/': 'Проспекти', 'scan/': 'Сканер', 'ekstreno/': 'Екстрено', 'rozmovnyk/': 'Розмовник', 'a1/': 'Німецька A1–A2', 'pralka/': 'Пралка', 'sushka/': 'Сушарка', 'bot/': 'Бот', 'igry/': 'Мініігри'}
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

OPEN = "document.getElementById('drawer').classList.contains('open')"

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        ctx = await browser.new_context(viewport={'width': 360, 'height': 760})
        await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
        await ctx.route('**/*.workers.dev/**', lambda r: r.abort())
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))

        for path, name in PAGES.items():
            await pg.goto(base + path); await pg.wait_for_timeout(300)
            await pg.click('#menubtn'); await pg.wait_for_timeout(400)
            info = await pg.evaluate("""() => {
              const d = document.getElementById('drawer'), links = [...d.querySelectorAll('nav a')];   // the games icon is outside the list on purpose (tests/igry_e2e.py)
              return {open: d.classList.contains('open'), names: links.map(a => a.querySelector('b').textContent),
                current: (d.querySelector('[aria-current="page"] b') || {}).textContent, focus: document.activeElement.textContent,
                expanded: document.getElementById('menubtn').getAttribute('aria-expanded'), inert: document.querySelector('.wrap').inert,
                left: Math.round(d.querySelector('.drawer-panel').getBoundingClientRect().left)};
            }""")
            check(f'{name}: menu opens with all sections, current marked',
                  info['open'] and info['names'] == list(PAGES.values()) and info['current'] == name and info['expanded'] == 'true' and info['left'] == 0,
                  str(info))
            check(f'{name}: focus on the current section, page behind unreachable', name in info['focus'] and info['inert'])
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(350)
            closed = await pg.evaluate("({open: " + OPEN + ", focus: document.activeElement.id, inert: document.querySelector('.wrap').inert, menuState: !!(history.state && history.state.menu)})")
            check(f'{name}: Esc closes, focus back on the button, no menu entry left in history',
                  not closed['open'] and closed['focus'] == 'menubtn' and not closed['inert'] and not closed['menuState'], str(closed))

        # Tab stays inside the open panel
        await pg.goto(base); await pg.wait_for_timeout(300)
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        inside = True
        for _ in range(8):
            await pg.keyboard.press('Tab')
            inside = inside and await pg.evaluate("!!document.activeElement.closest('.drawer-panel')")
        check('Tab cycles inside the panel', inside)

        # the phone's Back button closes the menu and stays on the page
        await pg.go_back(); await pg.wait_for_timeout(400)
        check('Back closes the menu and stays on the page', not await pg.evaluate(OPEN) and pg.url == base)

        # the scrim closes it too
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        await pg.mouse.click(350, 400); await pg.wait_for_timeout(400)
        check('tap outside the panel closes it', not await pg.evaluate(OPEN))

        # going to another section: Back returns to the washer page with the menu closed
        await pg.click('#menubtn'); await pg.wait_for_timeout(400)
        await pg.click('.drawer a[href$="/scan/"]')
        await pg.wait_for_url('**/scan/'); await pg.wait_for_timeout(400)
        check('menu link opens the section', await pg.text_content('h1') == 'Сканер')
        await pg.go_back(); await pg.wait_for_timeout(600)
        state = await pg.evaluate("({home: !!document.getElementById('hello'), open: " + OPEN + ", menu: !!(history.state && history.state.menu)})")
        check('Back from the section returns to the home screen, menu closed', state['home'] and not state['open'] and not state['menu'], str(state))
        await pg.go_back(); await pg.wait_for_timeout(300)
        # the page visited before the home screen was the last one in the loop above: no duplicate home entry
        check('no extra history entries left behind', pg.url == base + list(PAGES)[-1], pg.url)
        await browser.close()

asyncio.run(main())
print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
sys.exit(1 if fails else 0)
