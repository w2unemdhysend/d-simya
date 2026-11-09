/* Shared UI layer for both guides: light/dark theme, sliding indicators, view and page transitions */
(function(){
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
  function devThumb(instant, target){
    var nav = document.querySelector('.devices');
    if (nav) place(nav, nav.querySelector('.dthumb'), target || nav.querySelector('[aria-current="page"]'), instant);
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

  /* device links: slide the thumb, fade the page out, then go */
  function initDevices(){
    var nav = document.querySelector('.devices'); if (!nav) return;
    nav.addEventListener('click', function(e){
      var a = e.target.closest('a'); if (!a) return;
      if (a.getAttribute('aria-current') === 'page'){ e.preventDefault(); return; }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      nav.classList.add('going');
      a.classList.add('to');
      devThumb(false, a);
      try { if (tg && tg.HapticFeedback) tg.HapticFeedback.selectionChanged(); } catch(err){}
      if (reduce){ location.href = a.href; return; }
      document.body.classList.add('page-out');
      setTimeout(function(){ location.href = a.href; }, 230);
    });
    window.addEventListener('pageshow', function(){
      document.body.classList.remove('page-out');
      nav.classList.remove('going');
      Array.prototype.forEach.call(nav.querySelectorAll('a.to'), function(x){ x.classList.remove('to'); });
      devThumb(true);
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
    tabsThumb(true); devThumb(true);
    window.addEventListener('resize', function(){ tabsThumb(true); devThumb(true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ tabsThumb(true); devThumb(true); });
    initDevices();
    initExplain();
  }

  window.UI = { setTheme: setTheme, sync: sync, tabsThumb: tabsThumb, switchView: switchView, reduce: reduce };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
