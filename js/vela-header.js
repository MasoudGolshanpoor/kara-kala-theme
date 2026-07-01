/* ============================================================
   VELA — Header Module  (vela-header.js)
   مستقل · بدون coordinator
   شامل: Sticky offset · Scroll behavior · Nav underline
          · Nav auto-hide · Header actions (data-action delegate)
   ============================================================
   وابستگی‌ها (همه از طریق namespace و با fallback):
     - Vela.showToast       (از vela-ui.js) — اختیاری، فقط برای اخطار
     - Vela.openSearchModal (از vela-search.js) — هنگام کلیک روی سرچ
     - Vela.openAuthModal / openCartModal / openWishlistModal /
       openSupportSheet / closeSupportSheet (ماژول‌های مربوطه) — همگی
       با typeof check فراخوانی می‌شوند تا نبود ماژول خطا ندهد.
   ============================================================ */
(function () {
  'use strict';

  var Vela = (window.Vela = window.Vela || {});

  /* ══════════════════════════════════════════════════════════
     INIT HEADER  —  نقطه‌ی ورود اصلی
  ═══════════════════════════════════════════════════════════ */
  function velaInitHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;

    velaInitStickyOffset(header);
    velaInitScrollBehavior(header);
    velaInitNavSearchTrigger();
    velaInitNavUnderline();
    velaInitHeaderActions();
    velaInitNavAutoHide(header);
  }

  /* ── Sticky offset: header را به اندازه announce-bar بالا می‌برد ── */
  function velaInitStickyOffset(header) {
    var announceBar = document.getElementById('announceBar');
    if (!announceBar) return;

    function update() {
      header.style.top = '-' + announceBar.offsetHeight + 'px';
    }

    update();
    window.addEventListener('resize', update, { passive: true });

    /* وقتی دکمه‌ی بستن، نوار را مخفی می‌کند offsetHeight → 0 → top:0 */
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(update).observe(announceBar);
    }
  }

  /* ── کلاس scrolled را هنگام عبور از announce-bar اضافه می‌کند ── */
  function velaInitScrollBehavior(header) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var announceBar = document.getElementById('announceBar');
        var announceH = announceBar ? announceBar.offsetHeight : 0;
        header.classList.toggle('site-header--scrolled', window.scrollY >= announceH);
        ticking = false;
      });
    }, { passive: true });
  }

  /* ─ـ باز کردن مودال سرچ با کلیک روی input یا دکمه‌ی سرچ ── */
  function velaInitNavSearchTrigger() {
    document.querySelectorAll('.nav-search__input, .nav-search__btn').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof Vela.openSearchModal === 'function') Vela.openSearchModal();
      });
    });
  }

  /* ── انیمیشن underline زیر لینک‌های nav ── */
  function velaInitNavUnderline() {
    var nav = document.querySelector('.dnav');
    if (!nav) return;
    var list = nav.querySelector('.dnav__list');
    var underline = nav.querySelector('.nav-underline');
    if (!list || !underline) return;

    var topLinks = Array.from(list.querySelectorAll(':scope > .dnav__item > .dnav__link'));
    var activeLink = list.querySelector('.dnav__link--active') || topLinks[0];

    function move(el) {
      if (!el) return;
      var navRect = nav.getBoundingClientRect();
      var elRect = el.getBoundingClientRect();
      underline.style.left = (elRect.left - navRect.left) + 'px';
      underline.style.width = elRect.width + 'px';
    }

    if (activeLink) {
      move(activeLink);
      requestAnimationFrame(function () { underline.classList.add('nav-underline--ready'); });
    }

    topLinks.forEach(function (link) {
      link.addEventListener('mouseenter', function () { move(link); });
    });

    list.addEventListener('mouseleave', function (e) {
      var panel = document.getElementById('megaMenu');
      if (panel && (panel === e.relatedTarget || panel.contains(e.relatedTarget))) return;
      move(activeLink);
    });

    var megaPanel = document.getElementById('megaMenu');
    if (megaPanel) {
      megaPanel.addEventListener('mouseleave', function (e) {
        var trigger = document.getElementById('categoriesMenu');
        if (trigger && (trigger === e.relatedTarget || trigger.contains(e.relatedTarget))) return;
        move(activeLink);
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     HEADER ACTIONS  —  delegate کلیک روی [data-action]
     نکته: هر data-action ای که مربوط به ماژول دیگری باشد با typeof
     check فراخوانی می‌شود تا نبود آن ماژول باعث خطا نشود.
  ═══════════════════════════════════════════════════════════ */
  function velaInitHeaderActions() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action]');
      if (!el) return;

      switch (el.dataset.action) {
        case 'close-announce-bar': {
          var bar = document.getElementById('announceBar');
          if (bar) bar.style.display = 'none';
          break;
        }
        case 'open-auth-modal':
          if (typeof Vela.openAuthModal === 'function') Vela.openAuthModal(el.dataset.tab || 'login');
          break;
        case 'open-cart':
          if (typeof Vela.openCartModal === 'function') Vela.openCartModal();
          break;
        case 'open-wishlist':
          if (typeof Vela.openWishlistModal === 'function') Vela.openWishlistModal();
          break;
        case 'open-support':
          if (typeof Vela.openSupportSheet === 'function') Vela.openSupportSheet();
          break;
        case 'close-support':
          if (typeof Vela.closeSupportSheet === 'function') Vela.closeSupportSheet();
          break;
        case 'toggle-footer-col': {
          var col = el.closest('.ftr-col');
          if (col) col.classList.toggle('is-open');
          break;
        }
        case 'scroll-to-top':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'toggle-footer-about': {
          var about = document.getElementById('ftrAbout');
          if (!about) break;
          var body = document.getElementById('ftrAboutBody');
          var expanded = about.classList.toggle('is-expanded');
          el.setAttribute('aria-expanded', String(expanded));
          if (body) {
            body.style.maxHeight = expanded ? body.scrollHeight + 'px' : '';
          }
          var lbl = el.querySelector('span');
          if (lbl) lbl.textContent = expanded ? 'بستن' : 'مشاهده بیشتر';
          break;
        }
      }
    });
  }

  /* ── Auto-hide header-nav هنگام scroll-down ──
     با transform + margin-bottom ناوبری را جمع می‌کند تا جهش ناگهانی
     layout نباشد، و بعد از هر toggle به مدت 400ms قفل می‌شود تا
     جابجایی محتوا مجدداً handler را فعال نکند. */
  function velaInitNavAutoHide(header) {
    var prevY     = window.scrollY;
    var hidden    = false;
    var locked    = false;
    var lockTimer = null;
    var rafId     = null;

    function isDesktop() { return window.innerWidth > 768; }

    function setLock() {
      locked = true;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(function () {
        locked = false;
        prevY = window.scrollY;
      }, 360);
    }

    function show() {
      if (!hidden) return;
      hidden = false;
      header.classList.remove('nav-hidden');
      setLock();
    }

    function hide() {
      if (hidden) return;
      hidden = true;
      header.classList.add('nav-hidden');
      setLock();
    }

    window.addEventListener('scroll', function () {
      if (!isDesktop() || locked || rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = null;
        var y = window.scrollY;
        var delta = y - prevY;
        prevY = y;
        if (y < 80)          { show(); return; }
        if (delta > 5)       hide();
        else if (delta < -5) show();
      });
    }, { passive: true });

    window.addEventListener('resize', function () {
      prevY  = window.scrollY; /* re-baseline بعد از تغییر layout از resize */
      locked = false;
      clearTimeout(lockTimer);
      if (!isDesktop()) {
        header.classList.remove('nav-hidden');
        hidden = false;
      }
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  +  compat aliases
  ═══════════════════════════════════════════════════════════ */
  Vela.initHeader = Vela.initHeader || velaInitHeader;
  /* کد قدیمی initHeader را global صدا می‌زد */
  if (!window.initHeader) window.initHeader = velaInitHeader;

  document.addEventListener('DOMContentLoaded', velaInitHeader);
})();
