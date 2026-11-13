/* Shared UI layer for all sections: light/dark theme, the section menu, sliding tab indicators, view and page transitions,
   swipes (between tabs, from the left edge for the menu), and steady heights for boxes whose text changes */
(function(){
  // The section menu. A new Mini App = one line here (path relative to the site root, name, one-line note, icon).
  // Life in Germany first; the appliance instructions are helpers, so they sit at the bottom. A group without a title has no heading.
  var SECTIONS = [
    ['', [['', 'Головна', 'Усе важливе на сьогодні', 'home']]],
    ['Щодня', [['transport/', 'Транспорт', 'D-Ticket і відправлення наживо', 'bus'], ['marshrut/', 'Маршрут', 'Як доїхати: час і пересадки', 'route'], ['mapa/', 'Мапа', 'Зупинки, шлях пішки, де зараз автобус', 'map'], ['pogoda/', 'Погода', 'Зараз, на добу й тиждень', 'sun']]],
    ['Дім', [['smittia/', 'Сміття', 'Вивіз баків і нагадування', 'trash']]],
    ['Покупки', [['spysok/', 'Список покупок', 'Спільний для родини', 'cart'], ['prospekty/', 'Проспекти', 'Акції магазинів Ксантена й Везеля', 'tag']]],
    ['Документи', [['scan/', 'Сканер', 'Фото аркуша в PDF і переклад', 'scan']]],
    ['Допомога', [['ekstreno/', 'Екстрено', '112, черговий лікар, аптека', 'sos'], ['rozmovnyk/', 'Розмовник', 'Фрази для лікаря, установ, магазину', 'talk']]],
    ['Навчання', [['a1/', 'Німецька A1', 'Граматика, словник, вправи', 'book']]],
    ['Інструкції', [['pralka/', 'Пралка', 'Beko: кнопки, програми, проблеми', 'wash'], ['sushka/', 'Сушарка', 'Gorenje SensoCare', 'dry']]],
    ['Telegram', [['bot/', 'Бот', 'Ранкове зведення, команди, сповіщення', 'bell']]],
    ['Ігри', [['igry/', 'Мініігри', 'Німецька граючись і пригоди шкарпетки', 'game']]],
  ];
  var ICONS = {
    route: '<circle cx="6.500" cy="6.500" r="2.500"/><circle cx="17.500" cy="17.500" r="2.500"/><path d="M9 6.500h6.500a3 3 0 0 1 0 6h-7a3 3 0 0 0 0 6H15"/>',
    sos: '<path d="M12 3.5l8.5 15h-17z"/><path d="M12 10v4M12 16.6h.01"/>',
    talk: '<path d="M4.5 5.5h15v10h-8l-4.500 3.500v-3.500h-2.500z"/><path d="M8.500 9.500h7M8.500 12.200h4.500"/>',
    bell: '<path d="M6.500 16.500v-5.500a5.500 5.500 0 0 1 11 0v5.500l1.500 1.500h-14z"/><path d="M10.200 20.500a2 2 0 0 0 3.600 0"/>',
    cart: '<path d="M3 4h2.2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
    home: '<path d="M4 11.2L12 4.5l8 6.7"/><path d="M6.5 9.5v10h11v-10"/><path d="M10 19.5v-5h4v5"/>',
    wash: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="13" r="4.5"/><path d="M7.5 6.5h2"/>',
    dry: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="13" r="4.5"/><path d="M10.2 11.8c.6.6 1.2.6 1.8 0s1.2-.6 1.8 0M10.2 14.6c.6.6 1.2.6 1.8 0s1.2-.6 1.8 0"/>',
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M7.5 12h9"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10.5 11v5.5M13.5 11v5.5"/>',
    tag: '<path d="M3.5 12.3V5A1.5 1.5 0 0 1 5 3.5h7.3l8.2 8.2a1.5 1.5 0 0 1 0 2.1l-6.7 6.7a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.4"/>',
    bus: '<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8.5 20.5v-3M15.5 20.5v-3M8.5 14.3h.01M15.5 14.3h.01M9 6.5h6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    book: '<path d="M12 6.5c-1.800-1.300-4.300-2-7.500-2v13c3.200 0 5.700.700 7.500 2 1.800-1.300 4.300-2 7.500-2v-13c-3.200 0-5.700.700-7.500 2z"/><path d="M12 6.500v13"/>',
    map: '<path d="M9 4.5l-5 2v13l5-2 6 2 5-2v-13l-5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    dl: '<path d="M12 4v10M7.5 9.5L12 14l4.5-4.5M5 19.5h14"/>',
    full: '<path d="M4 9.5V4h5.5"/><path d="M14.5 4H20v5.5"/><path d="M20 14.5V20h-5.5"/><path d="M9.5 20H4v-5.5"/>',
    game: '<path d="M7.5 7.5h9a4.5 4.5 0 0 1 4.4 5.4l-.8 3.8a2.4 2.4 0 0 1-4.2 1L14.6 16H9.4l-1.3 1.7a2.4 2.4 0 0 1-4.2-1l-.8-3.8a4.5 4.5 0 0 1 4.4-5.4z"/><path d="M8.5 10.5v3M7 12h3"/><circle cx="15.5" cy="11.2" r=".6"/><circle cx="17" cy="12.8" r=".6"/>',
  };
  var SITE = (function(){ try { return new URL('..', document.currentScript.src).href; } catch(e){ return location.href; } })();
  var root = document.documentElement;
  var KEY = 'dsimya-theme';
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var tgApp = window.Telegram && window.Telegram.WebApp;
  var tg = (tgApp && tgApp.platform && tgApp.platform !== 'unknown') ? tgApp : null;

  function saved(){ try { return localStorage.getItem(KEY); } catch(e){ return null; } }
  function systemTheme(){ return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; }
  function current(){ return root.getAttribute('data-theme') || systemTheme(); }

  function paintTg(){
    if (!tg) return;
    try {
      var bg = getComputedStyle(root).getPropertyValue('--bg').trim();
      if (!bg) return;
      if (tg.setHeaderColor) tg.setHeaderColor(bg);
      if (tg.setBackgroundColor) tg.setBackgroundColor(bg);
    } catch(e){}
  }
  function label(){
    var b = document.getElementById('themebtn'); if (!b) return;
    var text = current() === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему';
    b.setAttribute('aria-label', text); b.setAttribute('title', text);
  }
  var themeVT = null, themeFade = null, tgPaint = 0;
  function setTheme(t, animate){
    // Telegram's own header and background can't fade: they switch halfway through the page's fade
    var apply = function(){ root.setAttribute('data-theme', t); label(); clearTimeout(tgPaint); if (animate && !reduce) tgPaint = setTimeout(paintTg, 200); else paintTg(); };
    if (root.getAttribute('data-theme') === t){ label(); paintTg(); return; }
    if (!animate || reduce){ apply(); return; }
    if (document.startViewTransition){
      try {
        root.classList.add('theme-vt');
        var vt = document.startViewTransition(apply);
        themeVT = vt;
        // a second tap cuts the first fade short: only the last one takes the class away
        var done = function(){ if (themeVT === vt){ themeVT = null; root.classList.remove('theme-vt'); } };
        vt.finished.then(done, done);
        return;
      } catch(e){ root.classList.remove('theme-vt'); }
    }
    root.classList.add('theme-fade');
    apply();
    // The shared fade (.42s) ends on the same clock as the colour transitions: an empty animation that starts in the
    // same frame they do. A plain setTimeout runs on even when a busy phone starts them late, and taking the class away
    // before they end let each button finish on its own timing.
    var token = themeFade = {};
    var off = function(){ if (themeFade === token){ themeFade = null; root.classList.remove('theme-fade'); } };
    try { root.animate([{}, {}], { duration: 480 }).finished.then(off, off); } catch(e){ setTimeout(off, 600); }
  }
  function sync(animate){
    var t = saved() || (tg ? (tg.colorScheme === 'dark' ? 'dark' : 'light') : systemTheme());
    setTheme(t, animate);
  }

  /* sliding thumbs */
  function place(container, thumb, active, instant){
    if (!container || !thumb || !active) return;
    if (instant) container.classList.add('no-anim');
    thumb.style.width = active.offsetWidth + 'px';
    thumb.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    if (instant){ void thumb.offsetWidth; container.classList.remove('no-anim'); }
  }
  function tabsThumb(instant){
    var tabs = document.querySelector('.tabs');
    if (tabs) place(tabs, tabs.querySelector('.tthumb'), tabs.querySelector('[aria-selected="true"]'), instant);
  }

  /* view switching: the old view slides out the way the tabs go, the new one slides in from the other side.
     Direction comes from the order of the views (the same as the tabs), so buttons and swipes look alike. */
  var timer = null;
  function switchView(views, next, opts){
    opts = opts || {};
    var cur = null;
    views.forEach(function(v){ if (v !== next && !v.hidden) cur = v; });
    clearTimeout(timer);
    var animate = !!cur && !opts.instant && !reduce;
    var dir = cur && views.indexOf(next) < views.indexOf(cur) ? -1 : 1;
    function finish(){
      views.forEach(function(v){ v.classList.remove('leaving', 'entering'); v.style.removeProperty('transform'); v.style.removeProperty('opacity'); v.hidden = v !== next; });
      if (!opts.keepScroll) window.scrollTo(0, 0);
      if (animate){ next.style.setProperty('--dx', (dir * 28) + 'px'); void next.offsetWidth; next.classList.add('entering'); }
      if (opts.done) opts.done();
    }
    if (animate){
      cur.style.setProperty('--dx', (-dir * 28) + 'px');
      cur.style.removeProperty('transform'); cur.style.removeProperty('opacity');   // a swipe may have moved it: carry on from there
      cur.classList.add('leaving'); timer = setTimeout(finish, 150);
    }
    else finish();
  }

  /* Boxes whose text changes (what a button or a program means) keep the height of their longest text, so nothing below
     them moves. Without this, at the bottom of a page a shorter text shortens the page, the browser scrolls up, and the
     program knob slides away under the finger: it then picks another program, and the page jumps back and forth. */
  function reserve(box, list){
    if (!box || !list || !list.length) return;
    var lastW = 0;
    function measure(){
      var w = box.getBoundingClientRect().width;
      if (!w || Math.abs(w - lastW) < 1) return;
      lastW = w;
      var probe = box.cloneNode(false);
      probe.removeAttribute('id'); probe.removeAttribute('aria-live'); probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;min-height:0;animation:none;width:' + w + 'px';
      box.parentNode.appendChild(probe);
      var max = 0;
      list.forEach(function(html){ probe.innerHTML = html; max = Math.max(max, probe.getBoundingClientRect().height); });
      probe.remove();
      box.style.minHeight = Math.ceil(max) + 'px';
    }
    measure();
    var t = null;
    window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(measure, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ lastW = 0; measure(); });
  }

  /* section menu: a button top-left opens a panel from the side with every section */
  function svg(name){ return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>'; }
  function samePage(href){ var a = new URL(href, location.href), b = new URL(location.href); return a.origin === b.origin && a.pathname.replace(/index\.html$/, '') === b.pathname.replace(/index\.html$/, ''); }
  var menu = null;   // {open, close, isOpen, d, panel} once the menu exists; the swipes use it
  // Browsers that animate between pages themselves (cross-document View Transitions): no need to fade out by hand first
  var pageVT = !reduce && 'PageSwapEvent' in window;
  if (pageVT) root.classList.add('page-vt');
  // a page transition that the browser skips (Back, a reload, a page left before it was drawn) is fine: say nothing
  function quiet(e){
    var vt = e && e.viewTransition; if (!vt) return;
    [vt.ready, vt.finished, vt.updateCallbackDone].forEach(function(p){ if (p && p.catch) p.catch(function(){}); });
  }
  window.addEventListener('pageswap', quiet);
  window.addEventListener('pagereveal', quiet);
  function initMenu(){
    var btn = document.getElementById('menubtn'); if (!btn) return;
    var d = document.createElement('div');
    d.className = 'drawer'; d.id = 'drawer';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Розділи');
    d.innerHTML = '<div class="drawer-scrim" data-close></div><div class="drawer-panel">' +
      '<div class="drawer-head"><div><div class="drawer-brand">D-SIM’YA</div><div class="drawer-sub">Помічник для життя в Німеччині</div></div>' +
      '<div class="drawer-acts' + (canFull() ? ' two' : '') + '">' + (canFull() ? '<button class="fsbtn" type="button" aria-pressed="false" aria-label="На весь екран" title="На весь екран">' + svg('full') + '</button><span class="sep" aria-hidden="true"></span>' : '') +
      '<button class="drawer-close" type="button" data-close aria-label="Закрити меню" title="Закрити меню">' + svg('close') + '</button></div></div><nav aria-label="Розділи">' +
      SECTIONS.map(function(g){
        return (g[0] ? '<div class="drawer-group">' + g[0] + '</div>' : '') + '<ul>' + g[1].map(function(it){
          var href = new URL(it[0], SITE).href;
          return '<li><a href="' + href + '"' + (samePage(href) ? ' aria-current="page"' : '') + '><span class="ic">' + svg(it[3]) + '</span><span><b>' + it[1] + '</b><small>' + it[2] + '</small></span></a></li>';
        }).join('') + '</ul>';
      }).join('') + '</nav><div class="drawer-foot" id="dfoot"><div class="drawer-set" id="dset"></div><div id="dinst"></div></div></div>';
    document.body.appendChild(d);
    var wrap = document.querySelector('.wrap'), panel = d.querySelector('.drawer-panel');
    var isOpen = function(){ return d.classList.contains('open'); };
    function open(){
      if (isOpen()) return;
      d.classList.add('open'); root.classList.add('menu-open'); btn.setAttribute('aria-expanded', 'true');
      if (wrap) wrap.inert = true;
      try { history.pushState({menu: 1}, ''); } catch(e){}   // so the phone's Back button closes the menu
      try { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); } catch(e){}
      var first = d.querySelector('[aria-current="page"]') || d.querySelector('a');
      setTimeout(function(){ if (first) first.focus({preventScroll: true}); }, 60);
    }
    function close(fromHistory){
      if (!isOpen()) return;
      d.classList.remove('open'); root.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false');
      if (wrap) wrap.inert = false;
      btn.focus({preventScroll: true});
      if (!fromHistory && history.state && history.state.menu) history.back();
    }
    btn.addEventListener('click', open);
    window.addEventListener('popstate', function(){ close(true); });
    d.addEventListener('click', function(e){
      if (e.target.closest('[data-close]')){ close(); return; }
      var a = e.target.closest('a'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (a.getAttribute('aria-current') === 'page'){ close(); return; }
      try { if (tg && tg.HapticFeedback) tg.HapticFeedback.selectionChanged(); } catch(err){}
      // replace the menu's history entry, so Back from the new section returns to this page, not to an open menu
      var go = function(){ if (history.state && history.state.menu) location.replace(a.href); else location.href = a.href; };
      d.classList.remove('open'); root.classList.remove('menu-open');
      if (reduce){ go(); return; }
      if (pageVT){ setTimeout(go, 90); return; }   // the browser cross-fades to the next page; just let the panel start closing
      document.body.classList.add('page-out');
      setTimeout(go, 200);
    });
    document.addEventListener('keydown', function(e){
      if (!isOpen()) return;
      if (e.key === 'Escape'){ e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = panel.querySelectorAll('a[href], button'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
    window.addEventListener('pageshow', function(){
      document.body.classList.remove('page-out');
      if (!(history.state && history.state.menu)) close(true);
    });
    var fs = d.querySelector('.fsbtn');
    if (fs) fs.addEventListener('click', function(){
      try { if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); } catch(e){}
      toggleFull();
    });
    paintFull();
    paintInstall(); paintSet();
    d.querySelector('#dfoot').addEventListener('click', function(e){
      var b = e.target.closest('[data-install]'); if (b) { install(b.getAttribute('data-install')); return; }
      var g = e.target.closest('[data-gender]'); if (g) { try { if (tg && tg.HapticFeedback) tg.HapticFeedback.selectionChanged(); } catch(err){} setGender(g.getAttribute('data-gender')); }
    });
    menu = { open: open, close: close, isOpen: isOpen, d: d, panel: panel };
  }

  /* Telegram's full screen (Bot API 8.0): the Mini App takes the whole screen, without Telegram's header. Telegram keeps it
     from page to page, and its script remembers it, so every page knows at once whether it is in full screen. A browser
     leaves full screen on every new page, so there the button is not shown. */
  var FULL_NO = 'dsimya-full-no';
  function canFull(){
    if (!tg || typeof tg.requestFullscreen !== 'function' || !(tg.isVersionAtLeast && tg.isVersionAtLeast('8.0'))) return false;
    try { return sessionStorage.getItem(FULL_NO) !== '1'; } catch(e){ return true; }
  }
  function paintFull(){
    var on = !!(tg && tg.isFullscreen);
    root.classList.toggle('tg-fs', on);
    var b = document.querySelector('.fsbtn'); if (!b) return;
    b.setAttribute('aria-pressed', String(on));
    b.title = on ? 'Звичайний розмір' : 'На весь екран';
  }
  function noFull(){   // this Telegram (on a computer, say) has no full screen: the button goes, here and on the next pages
    try { sessionStorage.setItem(FULL_NO, '1'); } catch(e){}
    var b = document.querySelector('.fsbtn'); if (!b) return;
    var box = b.parentNode; b.nextSibling && b.nextSibling.remove(); b.remove(); box.classList.remove('two');
    try { if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error'); } catch(e){}
  }
  if (tg && tg.onEvent){
    try {
      tg.onEvent('fullscreenChanged', paintFull);
      tg.onEvent('fullscreenFailed', function(e){ if (e && e.error === 'UNSUPPORTED') noFull(); else paintFull(); });
    } catch(e){}
  }
  paintFull();

  /* ---------- swipes ----------
     · from the left edge to the right: the menu follows the finger and opens; on the open menu, to the left: it closes
     · sideways on a page with tabs: the next or previous tab, the page and the tab marker follow the finger
     A swipe only starts when the finger clearly moves sideways, so scrolling up and down stays as it was. Nothing starts on
     fields, sliders, the program knob, strips that scroll sideways themselves, or anything marked data-noswipe. */
  var EDGE = 24;
  function scrollsSideways(el){
    for (; el && el !== document.body; el = el.parentElement){
      if (el.scrollWidth > el.clientWidth + 2){
        var o = getComputedStyle(el).overflowX;
        if (o === 'auto' || o === 'scroll') return true;
      }
    }
    return false;
  }
  function blocked(el){
    return !el || !el.closest || !!el.closest('input, textarea, select, [contenteditable="true"], [data-noswipe], #dial, .knobhit, canvas, .drawer-panel a, dialog') ||
      document.body.classList.contains('playing') || scrollsSideways(el);
  }
  function initSwipes(){
    if (!('ontouchstart' in window) && !(navigator.maxTouchPoints > 0)) return;
    var tabs = document.querySelector('.tabs[role="tablist"]');
    var g = null;
    function tabList(){ return tabs ? Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]')).filter(function(b){ return !b.hidden && !b.disabled; }) : []; }
    function currentView(){
      var sel = tabs && tabs.querySelector('[aria-selected="true"]'), id = sel && sel.getAttribute('aria-controls');
      return id ? document.getElementById(id) : null;
    }
    function panelW(){ return menu ? menu.panel.getBoundingClientRect().width || 300 : 300; }
    function setDrawer(p){   // 0 closed … 1 open, while the finger is down
      menu.panel.style.transform = 'translateX(' + ((p - 1) * 102) + '%)';
      menu.d.querySelector('.drawer-scrim').style.opacity = String(p);
    }
    function clearDrawer(){ menu.d.classList.remove('dragging'); menu.panel.style.removeProperty('transform'); menu.d.querySelector('.drawer-scrim').style.removeProperty('opacity'); }

    document.addEventListener('touchstart', function(e){
      g = null;
      if (e.touches.length !== 1) return;
      var t = e.touches[0], kind = null;
      if (menu && menu.isOpen()) kind = 'close';
      else if (menu && t.clientX <= EDGE && !(e.target.closest && e.target.closest('[data-noedge]'))) kind = 'open';   // not on the map: there the finger moves the map
      else if (tabs && !blocked(e.target) && e.target.closest('main, .view')) kind = 'tabs';
      if (kind) g = { kind: kind, x: t.clientX, y: t.clientY, t: Date.now(), dx: 0, lock: null };
    }, { passive: true });

    document.addEventListener('touchmove', function(e){
      if (!g || e.touches.length !== 1) return;
      var t = e.touches[0], dx = t.clientX - g.x, dy = t.clientY - g.y;
      if (!g.lock){
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        g.lock = Math.abs(dx) > Math.abs(dy) * 1.3 ? 'x' : 'y';
        if (g.lock === 'y'){ g = null; return; }
        if (g.kind === 'open'){ menu.d.classList.add('dragging'); }
        if (g.kind === 'close'){ menu.d.classList.add('dragging'); }
        if (g.kind === 'tabs'){ g.view = currentView(); g.list = tabList(); g.i = g.list.indexOf(tabs.querySelector('[aria-selected="true"]')); tabs.classList.add('dragging'); }
      }
      if (e.cancelable) e.preventDefault();   // sideways: the page must not scroll at the same time
      g.dx = dx;
      if (g.kind === 'open') setDrawer(Math.max(0, Math.min(1, dx / panelW())));
      else if (g.kind === 'close') setDrawer(Math.max(0, Math.min(1, 1 + dx / panelW())));
      else if (g.kind === 'tabs' && g.view){
        var to = g.list[g.i + (dx < 0 ? 1 : -1)];
        // follow the finger, slower past the first or the last tab
        var shift = to ? dx * 0.42 : dx * 0.14;
        g.view.style.transform = 'translateX(' + Math.max(-90, Math.min(90, shift)) + 'px)';
        g.view.style.opacity = String(1 - Math.min(0.35, Math.abs(shift) / 260));
        var thumb = tabs.querySelector('.tthumb'), from = g.list[g.i];
        if (thumb && from && to){
          var k = Math.min(1, Math.abs(dx) / (window.innerWidth * 0.55));
          thumb.style.width = (from.offsetWidth + (to.offsetWidth - from.offsetWidth) * k) + 'px';
          thumb.style.transform = 'translateX(' + (from.offsetLeft + (to.offsetLeft - from.offsetLeft) * k) + 'px)';
        }
      }
    }, { passive: false });

    function end(){
      if (!g || g.lock !== 'x'){ g = null; return; }
      var dt = Math.max(1, Date.now() - g.t), v = g.dx / dt, k = g;   // v in px per ms; a quick flick counts too
      g = null;
      if (k.kind === 'open' || k.kind === 'close'){
        var p = k.kind === 'open' ? k.dx / panelW() : 1 + k.dx / panelW();
        var want = v > 0.35 ? true : v < -0.35 ? false : p > 0.4;
        clearDrawer();
        if (want && k.kind === 'open') menu.open();
        else if (!want && k.kind === 'close') menu.close();
        return;
      }
      tabs.classList.remove('dragging');
      var to = k.list[k.i + (k.dx < 0 ? 1 : -1)];
      if (to && (Math.abs(k.dx) > Math.min(90, window.innerWidth * 0.22) || Math.abs(v) > 0.4)) { to.click(); return; }
      // not far enough: everything springs back
      if (k.view){
        k.view.classList.add('snap');
        k.view.style.removeProperty('transform'); k.view.style.removeProperty('opacity');
        setTimeout(function(){ k.view.classList.remove('snap'); }, 320);
      }
      tabsThumb(false);
    }
    document.addEventListener('touchend', end);
    document.addEventListener('touchcancel', end);
  }

  /* explanation boxes fade their new text in */
  function initExplain(){
    if (reduce || !window.MutationObserver) return;
    Array.prototype.forEach.call(document.querySelectorAll('.explain'), function(box){
      new MutationObserver(function(){
        box.classList.remove('swap'); void box.offsetWidth; box.classList.add('swap');
      }).observe(box, {childList:true});
    });
  }

  function init(){
    var b = document.getElementById('themebtn');
    if (b) b.addEventListener('click', function(){
      var t = current() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, t); } catch(e){}
      setTheme(t, true);
      try { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); } catch(e){}
    });
    if (window.matchMedia){
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onSys = function(){ if (!saved() && !tg) setTheme(systemTheme(), true); };
      if (mq.addEventListener) mq.addEventListener('change', onSys); else if (mq.addListener) mq.addListener(onSys);
    }
    if (tg){ try { tg.onEvent('themeChanged', function(){ if (!saved()) sync(true); else paintTg(); }); } catch(e){} }
    sync(false);
    tabsThumb(true);
    window.addEventListener('resize', function(){ tabsThumb(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ tabsThumb(true); });
    initMenu();
    initExplain();
    initSwipes();
    initOffline();
    showInstall();
    initReveal();
  }

  /* ---------- motion: the blocks of a page rise in one after another; those further down as they scroll into view.
     (Pages that animate their own blocks keep their own; with "less motion" asked for, nothing moves.) ---------- */
  var RV = '.card, .hcard, .tile, .help, .notice, details.trip, .wrap > section, .wrap > main > section';
  function initReveal(){
    if (reduce || !('IntersectionObserver' in window) || document.body.classList.contains('mapapp')) return;
    var wrap = document.querySelector('.wrap'); if (!wrap) return;
    var all = [].slice.call(wrap.querySelectorAll(RV));
    var els = all.filter(function(el){
      if (el.closest('[hidden]') || el.closest('.drawer')) return false;
      for (var p = el.parentElement; p && p !== wrap; p = p.parentElement) if (all.indexOf(p) >= 0) return false;   // the outer block moves, not each part of it
      var cs = getComputedStyle(el);
      return cs.animationName === 'none' && cs.display !== 'none';
    });
    if (!els.length) return;
    root.classList.add('rv-on');
    var vh = window.innerHeight, i = 0;
    var done = function(el){ el.addEventListener('transitionend', function f(e){ if (e.target !== el) return; el.removeEventListener('transitionend', f); el.classList.remove('rv', 'rv-in'); el.style.removeProperty('--rv'); }); };
    var io = new IntersectionObserver(function(list){
      list.forEach(function(en){ if (en.isIntersecting) { io.unobserve(en.target); done(en.target); en.target.classList.add('rv-in'); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function(el){
      var top = el.getBoundingClientRect().top;
      el.classList.add('rv');
      if (top < vh) { el.style.setProperty('--rv', Math.min(i++, 9)); done(el); requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('rv-in'); }); }); }
      else io.observe(el);
    });
  }

  /* A list drawn again from new HTML (live departures every few seconds): rows with the same data-key stay where they
     are and only their content changes (a number marked data-tick rolls to its new value), new rows come in, rows that
     moved glide to their new place. Without keys, or with less motion asked for, it is simply replaced. */
  function morph(box, html){
    if (!box) return;
    var tpl = document.createElement('template'); tpl.innerHTML = html;
    var next = [].slice.call(tpl.content.children);
    var keyed = next.length && next.every(function(n){ return n.getAttribute('data-key'); });
    var old = {}, any = false;
    [].slice.call(box.children).forEach(function(el){ var k = el.getAttribute('data-key'); if (k) { old[k] = el; any = true; } });
    if (!keyed || !any || reduce) { box.innerHTML = html; return; }
    var first = {};
    Object.keys(old).forEach(function(k){ first[k] = old[k].getBoundingClientRect().top; });
    var rows = next.map(function(n){
      var k = n.getAttribute('data-key'), o = old[k];
      if (!o) { n.classList.add('mo-in'); return n; }
      delete old[k];
      if (o.outerHTML !== n.outerHTML) {
        var was = [].slice.call(o.querySelectorAll('[data-tick]')).map(function(e){ return e.textContent; });
        [].slice.call(o.attributes).forEach(function(a){ if (!n.hasAttribute(a.name)) o.removeAttribute(a.name); });
        [].slice.call(n.attributes).forEach(function(a){ o.setAttribute(a.name, a.value); });
        o.innerHTML = n.innerHTML;
        [].slice.call(o.querySelectorAll('[data-tick]')).forEach(function(e, i){ if (was[i] != null && was[i] !== e.textContent) e.classList.add('ticked'); });
      }
      return o;
    });
    Object.keys(old).forEach(function(k){ old[k].remove(); });
    rows.forEach(function(el, i){ if (box.children[i] !== el) box.insertBefore(el, box.children[i] || null); });
    rows.forEach(function(el){
      var k = el.getAttribute('data-key');
      if (first[k] != null && el.animate) { var dy = first[k] - el.getBoundingClientRect().top; if (Math.abs(dy) > 1) el.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' }); }
    });
    setTimeout(function(){ [].slice.call(box.querySelectorAll('.mo-in, .ticked')).forEach(function(e){ e.classList.remove('mo-in', 'ticked'); }); }, 700);
  }

  /* Offline mode: the service worker keeps the pages on the phone (see sw.js). Not in automated browsers, unless a test
     asks for it, so the other tests see the network as it is. A small label says when there is no internet. */
  function initOffline(){
    var want = !navigator.webdriver; try { if (localStorage.getItem('dsimya-sw-test')) want = true; } catch(e){}
    if (want && 'serviceWorker' in navigator && window.isSecureContext){
      navigator.serviceWorker.register(SITE + 'sw.js', { scope: SITE }).catch(function(){});
    }
    var tag = document.createElement('div');
    tag.className = 'offline'; tag.setAttribute('role', 'status'); tag.hidden = true;
    tag.textContent = 'Немає інтернету: показано збережене';
    document.body.appendChild(tag);
    function show(){ tag.hidden = navigator.onLine !== false; root.classList.toggle('is-offline', !tag.hidden); }
    window.addEventListener('online', show); window.addEventListener('offline', show); show();
  }

  /* Without internet. Telegram itself has to ask its server before it opens a Mini App, so with no connection it only
     shows its spinner, whatever the page keeps. The same pages installed as an app (from Chrome or Safari) open from
     their own icon with what sw.js keeps: so the menu offers that. In Telegram: open the site in the phone's browser to
     install it there; in a browser: Chrome's own install question, or how to do it by hand (Safari). */
  var askInstall = null, installClosed = false;
  var installed = function(){ return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; };
  var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (tg && tg.platform === 'ios');
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); askInstall = e; paintInstall(); var b = document.querySelector('.install'); if (b) { b.remove(); } showInstall(); });
  window.addEventListener('appinstalled', function(){ askInstall = null; paintInstall(); var b = document.querySelector('.install'); if (b) b.remove(); });
  function installHow(){ return ios ? 'У Safari: «Поділитися» → «На екран „Додому“».' : 'У меню Chrome ⋮ вибери «Установити додаток» або «Додати на головний екран».'; }
  /* settings: who speaks in the examples of the course (Тарас, masculine, or Леся, feminine); pages that use it listen
     for "dsimya-gender" */
  var GKEY = 'dsimya-gender';
  function gender(){ try { return localStorage.getItem(GKEY) === 'f' ? 'f' : 'm'; } catch(e){ return 'm'; } }
  function setGender(g){
    g = g === 'f' ? 'f' : 'm';
    if (g === gender()) return;
    try { localStorage.setItem(GKEY, g); } catch(e){}
    paintSet();
    try { window.dispatchEvent(new CustomEvent('dsimya-gender', { detail: g })); } catch(e){}
  }
  function paintSet(){
    var s = document.getElementById('dset'); if (!s) return;
    var g = gender(), opt = function(v, name, kind){ return '<button type="button" role="radio" data-gender="' + v + '" aria-checked="' + (g === v) + '"><b>' + name + '</b><small>' + kind + '</small></button>'; };
    s.innerHTML = '<div class="drawer-group">Налаштування</div><div class="set-row"><span class="set-t"><b>Рід у прикладах</b><small>Від чийого імені говорять приклади й діалоги курсу</small></span>' +
      '<div class="seg" role="radiogroup" aria-label="Рід у прикладах">' + opt('m', 'Тарас', 'чоловічий') + opt('f', 'Леся', 'жіночий') + '</div></div>';
  }
  function paintInstall(){
    var f = document.getElementById('dinst'); if (!f) return;
    if (installed()) { f.innerHTML = ''; return; }
    var what = tg ? ['tg', 'Працювати без інтернету', 'Встановити D-SIM’YA на телефон як застосунок']
      : askInstall ? ['ask', 'Встановити застосунок', 'Іконка на екрані, працює й без інтернету']
      : ['how', 'Встановити застосунок', installHow()];
    f.innerHTML = '<button class="drawer-install" type="button" data-install="' + what[0] + '"><span class="ic">' + svg('dl') + '</span><span><b>' + what[1] + '</b><small>' + what[2] + '</small></span></button>';
  }
  function install(how){
    if (how === 'tg') {
      try { if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); } catch(e){}
      try { tg.openLink(SITE + '?install=1', { try_browser: 'chrome' }); } catch(e){ try { tg.openLink(SITE + '?install=1'); } catch(e2){} }
      return;
    }
    if (askInstall) { var a = askInstall; askInstall = null; a.prompt(); if (a.userChoice) a.userChoice.then(function(){ paintInstall(); }); return; }
    showInstall(true);
  }
  // opened from Telegram's button (?install=1): say what installing gives, and offer it
  function showInstall(force){
    if (installed() || tg || installClosed || document.querySelector('.install')) return;
    var asked = /[?&]install=1\b/.test(location.search);
    if (!force && !asked) return;
    var b = document.createElement('div');
    b.className = 'install'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Встановити D-SIM’YA');
    b.innerHTML = '<img src="' + SITE + 'assets/icons/icon-192.png" alt="" width="48" height="48"><div><b>D-SIM’YA на телефоні</b><p>Окрема іконка на екрані, і транспорт, мапа міста, сміття, інструкції працюють навіть без інтернету.</p>' +
      (askInstall ? '' : '<p class="how">' + installHow() + '</p>') + '<div class="acts">' + (askInstall ? '<button class="primary" type="button" data-i="go">Встановити</button>' : '') +
      '<button type="button" data-i="no">' + (askInstall ? 'Пізніше' : 'Зрозуміло') + '</button></div></div>';
    b.addEventListener('click', function(e){
      var x = e.target.closest('[data-i]'); if (!x) return;
      if (x.getAttribute('data-i') === 'go') install('ask');
      installClosed = true; b.classList.add('out'); setTimeout(function(){ b.remove(); }, 250);
    });
    document.body.appendChild(b);
  }

  // full screen for a page's own button (the platformer's pause): can it, is it on, switch it
  function toggleFull(){ try { if (tg.isFullscreen) tg.exitFullscreen(); else tg.requestFullscreen(); } catch(e){ noFull(); } }
  window.UI = { setTheme: setTheme, sync: sync, tabsThumb: tabsThumb, switchView: switchView, reserve: reserve, reduce: reduce, morph: morph,
    canFull: canFull, isFull: function(){ return !!(tg && tg.isFullscreen); }, toggleFull: toggleFull, gender: gender, setGender: setGender };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
