/* Shared UI layer for all sections: light/dark theme, the section menu, sliding tab indicators, view and page transitions */
(function(){
  // The section menu. A new Mini App = one line here (path relative to the site root, name, one-line note, icon).
  var SECTIONS = [
    ['Побутова техніка', [['', 'Пралка', 'Beko: кнопки, програми, проблеми', 'wash'], ['sushka/', 'Сушарка', 'Gorenje SensoCare', 'dry']]],
    ['Документи', [['scan/', 'Сканер', 'Фото аркуша в PDF', 'scan']]],
    ['Дім', [['smittia/', 'Сміття', 'Вивіз баків і нагадування', 'trash']]],
    ['Покупки', [['prospekty/', 'Проспекти', 'Акції магазинів Ксантена й Везеля', 'tag']]],
    ['Щодня', [['transport/', 'Транспорт', 'D-Ticket і відправлення наживо', 'bus'], ['pogoda/', 'Погода', 'Зараз, на добу й тиждень', 'sun']]],
  ];
  var ICONS = {
    wash: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="13" r="4.5"/><path d="M7.5 6.5h2"/>',
    dry: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="13" r="4.5"/><path d="M10.2 11.8c.6.6 1.2.6 1.8 0s1.2-.6 1.8 0M10.2 14.6c.6.6 1.2.6 1.8 0s1.2-.6 1.8 0"/>',
    scan: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M7.5 12h9"/>',
    trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10.5 11v5.5M13.5 11v5.5"/>',
    tag: '<path d="M3.5 12.3V5A1.5 1.5 0 0 1 5 3.5h7.3l8.2 8.2a1.5 1.5 0 0 1 0 2.1l-6.7 6.7a1.5 1.5 0 0 1-2.1 0z"/><circle cx="8" cy="8" r="1.4"/>',
    bus: '<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8.5 20.5v-3M15.5 20.5v-3M8.5 14.3h.01M15.5 14.3h.01M9 6.5h6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    game: '<path d="M7.5 7.5h9a4.5 4.5 0 0 1 4.4 5.4l-.8 3.8a2.4 2.4 0 0 1-4.2 1L14.6 16H9.4l-1.3 1.7a2.4 2.4 0 0 1-4.2-1l-.8-3.8a4.5 4.5 0 0 1 4.4-5.4z"/><path d="M8.5 10.5v3M7 12h3"/><circle cx="15.5" cy="11.2" r=".6"/><circle cx="17" cy="12.8" r=".6"/>',
  };
  // not in the list on purpose: a quiet icon in the bottom-left corner of the menu
  var SECRET = 'igry/';
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
  function setTheme(t, animate){
    var apply = function(){ root.setAttribute('data-theme', t); label(); paintTg(); };
    if (root.getAttribute('data-theme') === t){ label(); paintTg(); return; }
    if (!animate || reduce){ apply(); return; }
    if (document.startViewTransition){ try { document.startViewTransition(apply); return; } catch(e){} }
    root.classList.add('theme-fade');
    apply();
    setTimeout(function(){ root.classList.remove('theme-fade'); }, 480);
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

  /* view switching: fade the old view out, then let the new one rise in */
  var timer = null;
  function switchView(views, next, opts){
    opts = opts || {};
    var cur = null;
    views.forEach(function(v){ if (v !== next && !v.hidden) cur = v; });
    clearTimeout(timer);
    var animate = !!cur && !opts.instant && !reduce;
    function finish(){
      views.forEach(function(v){ v.classList.remove('leaving'); v.hidden = v !== next; });
      if (!opts.keepScroll) window.scrollTo(0, 0);
      if (animate){ next.classList.remove('entering'); void next.offsetWidth; next.classList.add('entering'); }
      if (opts.done) opts.done();
    }
    if (animate){ cur.classList.add('leaving'); timer = setTimeout(finish, 160); }
    else finish();
  }

  /* section menu: a button top-left opens a panel from the side with every section */
  function svg(name){ return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>'; }
  function samePage(href){ var a = new URL(href, location.href), b = new URL(location.href); return a.origin === b.origin && a.pathname.replace(/index\.html$/, '') === b.pathname.replace(/index\.html$/, ''); }
  function initMenu(){
    var btn = document.getElementById('menubtn'); if (!btn) return;
    var d = document.createElement('div');
    d.className = 'drawer'; d.id = 'drawer';
    d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Розділи');
    d.innerHTML = '<div class="drawer-scrim" data-close></div><div class="drawer-panel">' +
      '<div class="drawer-head"><div><div class="drawer-brand">D-SIM’YA</div><div class="drawer-sub">Домашні помічники</div></div>' +
      '<button class="drawer-close" type="button" data-close aria-label="Закрити меню">' + svg('close') + '</button></div><nav aria-label="Розділи">' +
      SECTIONS.map(function(g){
        return '<div class="drawer-group">' + g[0] + '</div><ul>' + g[1].map(function(it){
          var href = new URL(it[0], SITE).href;
          return '<li><a href="' + href + '"' + (samePage(href) ? ' aria-current="page"' : '') + '><span class="ic">' + svg(it[3]) + '</span><span><b>' + it[1] + '</b><small>' + it[2] + '</small></span></a></li>';
        }).join('') + '</ul>';
      }).join('') + '</nav>' + (function(){
        var href = new URL(SECRET, SITE).href;
        return '<a class="drawer-secret" href="' + href + '" aria-label="Мініігри" title="Мініігри"' + (samePage(href) ? ' aria-current="page"' : '') + '>' + svg('game') + '</a>';
      })() + '</div>';
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
      document.body.classList.add('page-out');
      setTimeout(go, 230);
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
  }

  window.UI = { setTheme: setTheme, sync: sync, tabsThumb: tabsThumb, switchView: switchView, reduce: reduce };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
