"""The Погода page /pogoda/ in headless Chrome, with the Worker's weather answer from tests/fixtures (Open-Meteo,
11.11.2026) or changed per case.

  python3 tests/pogoda_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Covers: now (temperature, words, feels like, wind, humidity, sunrise and sunset), the advice lines (umbrella,
"maybe rain", snow, slippery roads, wind, dry), 24 hours and 7 days, the place chips (home place from the
Сміття page, Xanten, Wesel; the choice is remembered), "Тут" from the phone's location rounded to about a
kilometre, errors with a retry, 340 px and dark theme. Exits 1 if a check fails.
"""
import asyncio, copy, functools, http.server, json, os, sys, threading, urllib.parse
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WX = json.load(open(os.path.join(ROOT, 'tests', 'fixtures', 'weather.json')))
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
    return f'http://127.0.0.1:{srv.server_address[1]}/pogoda/'

def weather(change=None):
    d = copy.deepcopy(WX)
    if change: change(d)
    return d

class Worker:
    def __init__(self, answer=None, fail=0):
        self.calls, self.answer, self.fail = [], answer or weather(), fail
    async def __call__(self, route):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(route.request.url).query)
        self.calls.append((q.get('lat', [''])[0], q.get('lon', [''])[0]))
        if self.fail:
            self.fail -= 1
            return await route.fulfill(status=502, json={'ok': False, 'error': 'upstream'})
        await route.fulfill(json=self.answer)

async def page(browser, url, worker=None, prefs=None, width=390, scheme='light', geo=None):
    opts = {'viewport': {'width': width, 'height': 860}, 'color_scheme': scheme}
    if geo: opts.update(geolocation=geo, permissions=['geolocation'])
    ctx = await browser.new_context(**opts)
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body='', content_type='text/javascript'))
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    w = worker or Worker()
    await ctx.route('**/*.workers.dev/**', w)
    ctx.osm = []
    async def osm(route):
        ctx.osm.append(route.request.url)
        await route.fulfill(json={'address': {'town': 'Rheinberg', 'state': 'Nordrhein-Westfalen'}})
    await ctx.route('**/nominatim.openstreetmap.org/**', osm)
    if prefs: await ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ localStorage.setItem('smittia-prefs', {json.dumps(json.dumps(prefs))}); sessionStorage.setItem('seeded', '1'); }}")
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.clock.install(time=WX['at'])
    await pg.goto(url)
    await pg.wait_for_selector('#now-body:not([hidden]), #now-wait.err', timeout=8000)
    return ctx, pg, w

TIPS = "() => [...document.querySelectorAll('.tips li')].map(l => l.className + ': ' + l.textContent)"

async def main():
    url = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        ctx, pg, w = await page(browser, url, prefs={'district': '2', 'place': 'Lüttingen'})
        chips = await pg.evaluate("() => [...document.querySelectorAll('#places .chip')].map(b => [b.textContent, b.getAttribute('aria-pressed')])")
        check('places: home first and chosen, then Xanten, Wesel, Тут', chips == [['Lüttingen · дім', 'true'], ['Xanten', 'false'], ['Wesel', 'false'], ['Тут', 'false']], str(chips))
        check('asked for Lüttingen, rounded to two decimals', w.calls[0] == ('51.67', '6.46'), str(w.calls))
        check('eyebrow names the place', await pg.text_content('#eyebrow') == 'Lüttingen')
        now = await pg.inner_text('#now-body')
        check('now: 5°, Хмарно, feels like 3°', '5°' in now and 'Хмарно' in now and 'Відчувається як 3°' in now, now[:120])
        check('now: wind, gusts, humidity, sunrise and sunset', all(x in now for x in ['км/год, пориви', 'Вологість', '92 %', 'Схід', 'Захід', 'оновлено о 14:15']), now)
        check('no "-0°" anywhere', '-0°' not in await pg.inner_text('main'))
        check('rain "до кінця дня" from the hours left, matching the advice (29 %, not the 100 % of the whole day)', 'Дощ до кінця дня\n29 %' in now and '100 %' not in now, now)
        tips = await pg.evaluate(TIPS)
        check('advice from the recorded day: maybe rain at 19:00, umbrella not a must', any('Можливий дощ з 19:00 (29 %)' in t for t in tips), str(tips))
        hours = await pg.locator('.hour').count()
        check('24 hours, the first is "Зараз"', hours == 24 and (await pg.inner_text('.hour.first .h')) == 'Зараз', hours)
        days = await pg.evaluate("() => [...document.querySelectorAll('.day .d')].map(d => d.textContent)")
        check('7 days: Сьогодні, Завтра, then weekday and date', len(days) == 7 and days[:2] == ['Сьогодні', 'Завтра'] and days[2].startswith('пт'), str(days))
        bars = await pg.evaluate("() => [...document.querySelectorAll('.bar i')].map(i => [parseFloat(i.style.left), parseFloat(i.style.right)])")
        check('temperature bars inside the track', all(0 <= a <= 100 and 0 <= b <= 100 and a + b <= 100 for a, b in bars), str(bars))
        check('fits 390 px (the hour strip scrolls inside its card)', await pg.evaluate('document.documentElement.scrollWidth') <= 390)
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'pogoda-390.png'), full_page=True)

        await pg.click('#places [data-place="Wesel"]')
        await pg.wait_for_function("document.getElementById('eyebrow').textContent === 'Wesel'")
        await pg.wait_for_timeout(200)
        check('Wesel: asked for 51.66, 6.62', w.calls[-1] == ('51.66', '6.62'), str(w.calls))
        await pg.reload(); await pg.wait_for_selector('#now-body:not([hidden])')
        check('choice remembered after reload', await pg.get_attribute('#places [data-place="Wesel"]', 'aria-pressed') == 'true' and w.calls[-1] == ('51.66', '6.62'))
        await ctx.close()

        # rain, snow, frost, wind
        def wet(d):
            h = d['hourly']
            h['precipitation_probability'] = [10, 20, 70] + [80] * 21
            h['weather_code'] = [3, 3, 63] + [71] * 21
            h['temperature_2m'] = [3, 2, 1, 0.4] + [-0.4] * 20
            h['wind_gusts_10m'] = [30, 40, 82] + [50] * 21
        ctx, pg, w = await page(browser, url, worker=Worker(weather(wet)))
        tips = await pg.evaluate(TIPS)
        check('umbrella: rain likely from 16:00 (70 %)', any('Візьми парасольку: дощ імовірний з 16:00 (70 %)' in t for t in tips), str(tips))
        check('snow from 17:00', any('Можливий сніг з 17:00' in t for t in tips))
        check('slippery roads below +1° (and "-0°" never shown)', any('ожеледиця (Glätte)' in t and 'До 0°' in t for t in tips), str(tips))
        check('strong gusts 82 km/h', any('Сильні пориви вітру до 82' in t for t in tips))
        check('no "dry" line when it rains', not any(t.startswith('dry') for t in tips))
        hour = await pg.evaluate("() => [...document.querySelectorAll('.hour small')].map(s => [s.textContent, s.className])")
        check('rain chance shown from 10 %, highlighted from 50 %', hour[0] == ['10 %', ''] and hour[2] == ['70 %', 'wet'], str(hour[:3]))
        await ctx.close()

        def dry(d):
            h = d['hourly']; h['precipitation_probability'] = [0] * 24; h['precipitation'] = [0] * 24; h['weather_code'] = [1] * 24
            h['temperature_2m'] = [12] * 24; h['wind_gusts_10m'] = [10] * 24; d['now']['weather_code'] = 0; d['now']['wind_gusts_10m'] = 10
        ctx, pg, w = await page(browser, url, worker=Worker(weather(dry)))
        tips = await pg.evaluate(TIPS)
        check('dry day: one calm line', tips == ['dry: Опадів найближчі 12 годин не очікується.'], str(tips))
        check('no Сміття choice: Xanten', await pg.text_content('#eyebrow') == 'Xanten' and w.calls[0] == ('51.66', '6.45'))
        await ctx.close()

        # "Тут": the phone's spot, rounded before anything is sent
        ctx, pg, w = await page(browser, url, geo={'latitude': 51.59321, 'longitude': 6.55894})
        await pg.click('#places [data-place="here"]')
        await pg.wait_for_function("document.querySelector('#places [data-place=\"here\"]').textContent.includes('Rheinberg')")
        check('Тут: weather for the rounded spot', w.calls[-1] == ('51.59', '6.56'), str(w.calls))
        check('Тут: the town name comes from one OSM lookup with the rounded spot', len(ctx.osm) == 1 and 'lat=51.59&lon=6.56' in ctx.osm[0], str(ctx.osm))
        check('Тут is not remembered on the device', 'here' not in (await pg.evaluate("localStorage.getItem('pogoda-place') || ''")))
        await ctx.close()

        # the Worker fails once: message, then retry works
        ctx, pg, w = await page(browser, url, worker=Worker(fail=1))
        check('error: clear message with a retry button', 'Не вдалося завантажити погоду' in await pg.inner_text('#now-wait') and await pg.is_visible('#again'))
        await pg.click('#again'); await pg.wait_for_selector('#now-body:not([hidden])')
        check('retry shows the weather', '5°' in await pg.inner_text('#now-body'))
        await ctx.close()

        ctx, pg, w = await page(browser, url, width=340, scheme='dark', prefs={'place': 'Obermörmter', 'district': '2'})
        check('340 px, long place name: no sideways scrolling', await pg.evaluate('document.documentElement.scrollWidth') <= 340, await pg.evaluate('document.documentElement.scrollWidth'))
        if OUT: await pg.screenshot(path=os.path.join(OUT, 'pogoda-340-dark.png'), full_page=True)
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
