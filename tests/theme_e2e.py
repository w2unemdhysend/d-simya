"""Theme switch (the sun/moon button) in headless Chrome.

  python3 tests/theme_e2e.py     (CHROME=/path/to/chrome to use a system browser)

Covers: the new theme fades in over the old one (no jump in one frame); while it fades, no button, tab or switch runs
a colour transition of its own (that made labels vanish: white text on a white tab for a moment); only the sun/moon icon
turns; two quick taps end on the right theme and the second one fades too; reduced motion switches at once.
Animations run 10x slower, and stop for a moment halfway through the fade so it can be looked at. Exits 1 if a check fails.
"""
import asyncio, functools, http.server, os, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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

# Everything that runs right after the tap: the fade of the new theme and any colour transition of an element
WATCH = """() => new Promise((done) => {
  const seen = { fadeIn: false, colour: new Set(), icon: false };
  const t0 = performance.now();
  (function look() {
    for (const a of document.getAnimations()) {
      const pe = a.effect && a.effect.pseudoElement;
      if (pe === '::view-transition-new(root)' && a.animationName && a.playState === 'running') seen.fadeIn = true;
      if (a.transitionProperty && /color|background|border|fill|stroke|shadow/.test(a.transitionProperty)) {
        const el = a.effect.target; seen.colour.add((el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className.baseVal ?? el.className).split(' ')[0]) + ' ' + a.transitionProperty);
      }
      if (a.transitionProperty === 'transform' && a.effect.target.closest && a.effect.target.closest('.themebtn')) seen.icon = true;
    }
    if (performance.now() - t0 < 2500) requestAnimationFrame(look); else done({ fadeIn: seen.fadeIn, colour: [...seen.colour].slice(0, 8), n: seen.colour.size, icon: seen.icon });
  })();
})"""

TG = """window.Telegram = {WebApp: {platform: 'android', colorScheme: 'light', initData: '', ready() {}, expand() {}, onEvent() {},
  setHeaderColor(c) { (window.__head = window.__head || []).push([Math.round(performance.now()), c]); }, setBackgroundColor() {},
  HapticFeedback: {selectionChanged() {}, impactOccurred() {}, notificationOccurred() {}}, BackButton: {show() {}, hide() {}, onClick() {}}}};"""

async def open_page(browser, base, path, theme='light', rate=0.1, reduce=False, tg='', no_vt=False):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 760}, reduced_motion='reduce' if reduce else 'no-preference')
    await ctx.route('**/telegram.org/**', lambda r: r.fulfill(body=tg, content_type='text/javascript'))
    if no_vt: await ctx.add_init_script("delete Document.prototype.startViewTransition;")   # older WebViews
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(body='', content_type='text/css'))
    await ctx.route('**/*.workers.dev/**', lambda r: r.fulfill(status=404, json={'ok': False}, headers={'Access-Control-Allow-Origin': '*'}))
    await ctx.add_init_script(f"try {{ localStorage.setItem('dsimya-theme', '{theme}'); }} catch (e) {{}}")
    pg = await ctx.new_page(); pg.on('pageerror', lambda e: fails.append(f'page error: {e}'))
    await pg.goto(base + path); await pg.wait_for_timeout(900)
    pg.cdp = await ctx.new_cdp_session(pg); pg.rate = rate
    await pg.cdp.send('Animation.enable')
    if rate != 1: await pg.cdp.send('Animation.setPlaybackRate', {'playbackRate': rate})
    return ctx, pg

# how far the fade is: the new theme fading in (View Transitions) or the page background's colour transition (without)
PROGRESS = """() => { for (const a of document.getAnimations()) {
  const pe = a.effect && a.effect.pseudoElement;
  if (pe === '::view-transition-new(root)' || (!pe && a.transitionProperty === 'background-color' && a.effect.target === document.body)) return a.effect.getComputedTiming().progress || 0;
} return -1; }"""

async def mid_fade(pg):
    """The screen in the middle of the fade: wait until it is about halfway, stop every animation, look, go on."""
    try: await pg.wait_for_function(f'({PROGRESS})() >= 0.4', polling='raf', timeout=4000)
    except Exception: pass   # no fade at all: look anyway (the check then fails with the numbers)
    await pg.cdp.send('Animation.setPlaybackRate', {'playbackRate': 0})
    v = await bg_at(pg)
    await pg.cdp.send('Animation.setPlaybackRate', {'playbackRate': pg.rate})
    return v

async def bg_at(pg):
    """Brightness of an empty strip of the page as drawn on screen (the fade included)."""
    from io import BytesIO
    from PIL import Image
    im = Image.open(BytesIO(await pg.screenshot(clip={'x': 0, 'y': 700, 'width': 6, 'height': 6}, animations='allow'))).convert('L')
    return sum(im.getdata()) / (im.width * im.height)

async def main():
    base = serve()
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])

        for path, name in [('pralka/', 'washer guide (tabs, panel)'), ('', 'home'), ('pogoda/', 'weather (chips, switch)')]:
            for start in ['light', 'dark']:
                ctx, pg = await open_page(browser, base, path, theme=start)
                before = await bg_at(pg)
                watch = asyncio.ensure_future(pg.evaluate(WATCH))
                await pg.click('#themebtn')
                mid = await mid_fade(pg)
                seen = await watch
                try: await pg.wait_for_function("!document.documentElement.classList.contains('theme-vt') && !document.getAnimations().length", timeout=15000)
                except Exception: pass
                after = await bg_at(pg)
                lo, hi = sorted([before, after])
                tag = f'{name}, {start} → {"dark" if start == "light" else "light"}'
                check(f'{tag}: the new theme fades in', seen['fadeIn'], str(seen))
                check(f'{tag}: halfway it is between the two themes, not already the new one', lo + 0.12 * (hi - lo) < mid < hi - 0.12 * (hi - lo), f'{before:.0f} → {mid:.0f} → {after:.0f}')
                check(f'{tag}: no button or tab changes colour on its own while the theme fades', seen['n'] == 0, f"{seen['n']}: {seen['colour']}")
                check(f'{tag}: the sun/moon icon still turns', seen['icon'])
                check(f'{tag}: done: the new theme, nothing left over', await pg.evaluate("document.documentElement.getAttribute('data-theme')") != start and not await pg.evaluate("document.documentElement.classList.contains('theme-vt')"))
                await ctx.close()

        # two quick taps: back to the first theme, and the second switch fades as well
        ctx, pg = await open_page(browser, base, 'pralka/', rate=1)
        watch = asyncio.ensure_future(pg.evaluate(WATCH))
        await pg.click('#themebtn'); await pg.wait_for_timeout(80); await pg.click('#themebtn')
        seen = await watch
        await pg.wait_for_timeout(400)
        check('two quick taps: back to light, nothing left over', await pg.evaluate("document.documentElement.getAttribute('data-theme')") == 'light' and not await pg.evaluate("document.documentElement.classList.contains('theme-vt')"))
        check('two quick taps: no colour transitions of single buttons either', seen['n'] == 0, str(seen['colour']))
        await ctx.close()

        # a WebView without View Transitions: everything fades its colours together, the icon turns
        for start in ['light', 'dark']:
            ctx, pg = await open_page(browser, base, 'pralka/', theme=start, no_vt=True)
            before = await bg_at(pg)
            await pg.click('#themebtn')
            mid = await mid_fade(pg)
            icon = await pg.evaluate("document.getAnimations().some(a => a.transitionProperty === 'transform' && a.effect.target.closest('.themebtn'))")
            tabs = await pg.evaluate("document.getAnimations().filter(a => a.transitionProperty === 'color' && a.effect.target.closest('.tabs')).map(a => a.effect.getComputedTiming().duration)")
            # the fade runs 10x slower here: wait for its end itself, not for a fixed time (a slow machine needs longer)
            try: await pg.wait_for_function("!document.documentElement.classList.contains('theme-fade') && !document.getAnimations().length", timeout=15000)
            except Exception: pass
            after = await bg_at(pg)
            lo, hi = sorted([before, after])
            check(f'no View Transitions, {start}: one colour fade, halfway between the themes', lo + 0.12 * (hi - lo) < mid < hi - 0.12 * (hi - lo), f'{before:.0f} → {mid:.0f} → {after:.0f}')
            check(f'no View Transitions, {start}: the tabs fade with the page, not on their own time', len(tabs) > 0 and all(abs(d - 420) < 1 for d in tabs), str(tabs))
            check(f'no View Transitions, {start}: the icon turns', icon)
            check(f'no View Transitions, {start}: done: the new theme, nothing left over', await pg.evaluate("document.documentElement.getAttribute('data-theme')") != start and not await pg.evaluate("document.documentElement.classList.contains('theme-fade')"))
            await ctx.close()

        # inside Telegram: its header (which can't fade) switches once, halfway through the fade, to the new background
        ctx, pg = await open_page(browser, base, 'pralka/', rate=1, tg=TG)
        await pg.evaluate("window.__head = []; window.__t = performance.now()")
        await pg.click('#themebtn'); await pg.wait_for_timeout(800)
        head = await pg.evaluate("window.__head.map(([t, c]) => [t - window.__t, c])")
        bg = await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()")
        check('Telegram header: set once, to the dark background, halfway (not at the tap)', len(head) == 1 and head[0][1] == bg and 150 < head[0][0] < 450, f'{head} vs {bg}')
        await ctx.close()

        # reduced motion: at once
        ctx, pg = await open_page(browser, base, 'pralka/', rate=1, reduce=True)
        await pg.click('#themebtn'); await pg.wait_for_timeout(50)
        check('reduced motion: the theme changes at once', await pg.evaluate("document.documentElement.getAttribute('data-theme')") == 'dark' and await bg_at(pg) < 60)
        await ctx.close()
        await browser.close()
    print('ALL PASS' if not fails else f'{len(fails)} FAILED: {fails}')
    sys.exit(1 if fails else 0)

asyncio.run(main())
