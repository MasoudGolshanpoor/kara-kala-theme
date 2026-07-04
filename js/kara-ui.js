/* ============================================================
   VELA — UI Core Module  (kara-ui.js)
   مستقل · بدون coordinator
   شامل: Shared State · Panel Manager · Toast · Countdown
          · Page Transitions · Scroll-top · Global Animations
   ============================================================
   این فایل هسته‌ی رابط کاربری است. سایر ماژول‌ها از طریق
   window.Kara به state و showToast دسترسی دارند. هر فایل به‌صورت
   defensive با namespace کار می‌کند (Kara = Kara || {}) پس اگر این
   فایل لود نشد، بقیه ماژول‌ها خطا نمی‌دهند — فقط feature مربوطه غیرفعال می‌ماند.
   ============================================================ */
(function () {
  'use strict';

  /* ─── NAMESPACE (defensive — همه فایل‌ها همین را می‌نویسند) ─── */
  /** @type {Window.Kara} */
  var Kara = (window.Kara = window.Kara || {});

  /* ══════════════════════════════════════════════════════════
     SHARED STATE  —  اولین ماژولی که اجرا شود این را می‌سازد
     بقیه فایل‌ها با `Kara.state = Kara.state || {...}` فقط در صورت
     نبودن آن را می‌سازند.
  ═══════════════════════════════════════════════════════════ */
  Kara.state = Kara.state || {
    cartCount:     parseInt(localStorage.getItem('kara_cart')     || '3', 10),
    wishlistCount: parseInt(localStorage.getItem('kara_wishlist') || '0', 10),
    qty: 1,
    activePanel: null,   /* 'cat' | 'search' | 'filter' | 'support' | null */
  };

  /* ══════════════════════════════════════════════════════════
     PANEL MANAGER  —  فقط یک پنل همزمان باز باشد
     در وردپرس این منطق برای هماهنگی modal ها (search / cart /
     filter موبایل / support) استفاده می‌شود.
  ═══════════════════════════════════════════════════════════ */
  function karaOpenPanel(name) {
    if (Kara.state.activePanel && Kara.state.activePanel !== name) {
      karaClosePanel(Kara.state.activePanel);
    }
    Kara.state.activePanel = name;
    karaSetFabOpen(true);
  }

  function karaClosePanel(name) {
    if (Kara.state.activePanel === name || !name) {
      Kara.state.activePanel = null;
      karaSetFabOpen(false);
    }
  }

  function karaSetFabOpen(isOpen) {
    var fab = document.getElementById('bottomFab');
    if (fab) fab.classList.toggle('is-open', isOpen);
  }

  /* ══════════════════════════════════════════════════════════
     TOAST  —  پیام‌های موقت (موفقیت/خطا/اطلاع)
     روی namespace به‌عنوان رابط مشترک expose می‌شود تا سایر
     ماژول‌ها به جای global مستقیم، از Kara.showToast استفاده کنند.
  ═══════════════════════════════════════════════════════════ */
  function karaShowToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    };

    var t = document.createElement('div');
    t.className = 'toast toast--' + type;
    t.innerHTML = (icons[type] || icons.info) + '<span>' + message + '</span>';
    container.appendChild(t);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { t.remove(); }, 350);
    }, 3200);
  }

  /* ══════════════════════════════════════════════════════════
     FLASH SALE COUNTDOWN
  ═══════════════════════════════════════════════════════════ */
  function karaInitCountdown() {
    var hEl = document.getElementById('cd-h');
    var mEl = document.getElementById('cd-m');
    var sEl = document.getElementById('cd-s');
    if (!hEl) return;

    var total = (8 * 3600) + (34 * 60) + 52;
    var fmt = function (n) { return String(n).padStart(2, '0'); };
    var flip = function (el, v) {
      el.style.transition = 'transform 80ms ease, opacity 80ms ease';
      el.style.transform = 'translateY(-4px)'; el.style.opacity = '0.3';
      setTimeout(function () {
        el.textContent = v;
        el.style.transform = 'translateY(0)'; el.style.opacity = '1';
      }, 80);
    };
    setInterval(function () {
      if (total-- <= 0) return;
      flip(hEl, fmt(Math.floor(total / 3600)));
      flip(mEl, fmt(Math.floor((total % 3600) / 60)));
      flip(sEl, fmt(total % 60));
    }, 1000);
  }

  /* ══════════════════════════════════════════════════════════
     PAGE TRANSITIONS + SCROLL ANIMATIONS
     در وردپرس این برای انیمیشن ورود کارت‌محصول‌ها و آمار استفاده
     می‌شود. توجه: بعد از AJAX load محصول جدید، observer فقط برای
     عناصر اولیه فعال است — برای آیتم‌های lazy باید دوباره صدا زده شود.
  ═══════════════════════════════════════════════════════════ */
  function karaInitPageTransitions() {
    var cards = document.querySelectorAll('.product-card, .category-card, .blog-card');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          setTimeout(function () {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }, i * 55);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(function (c) {
      c.style.opacity = '0';
      c.style.transform = 'translateY(18px)';
      c.style.transition = 'opacity 380ms ease, transform 380ms ease, box-shadow 300ms ease';
      io.observe(c);
    });

    var stats = document.querySelectorAll('.stats-strip__num');
    var sIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.animation = 'countUp 600ms ease forwards';
          sIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(function (s) { sIo.observe(s); });
  }

  /* ══════════════════════════════════════════════════════════
     STICKY SCROLL-TO-TOP BUTTON WITH PROGRESS RING
  ═══════════════════════════════════════════════════════════ */
  function karaInitScrollTopBtn() {
    var btn = document.getElementById('scrollTopBtn');
    var bar = document.getElementById('scrollProgressBar');
    if (!btn || !bar) return;

    var CIRCUMFERENCE = 138;
    var SHOW_THRESHOLD = 120;

    var update = function () {
      var scrolled = window.scrollY;
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var progress = maxScroll > 0 ? Math.min(scrolled / maxScroll, 1) : 0;

      bar.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

      if (scrolled > SHOW_THRESHOLD) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════════════════
     INJECTED KEYFRAME ANIMATIONS
     در وردپرس ترجیحاً این keyframe‌ها را به style.css منتقل کنید؛
     اینجا فقط برای حفظ رفتار تزریق می‌شوند.
  ═══════════════════════════════════════════════════════════ */
  function karaInjectGlobalAnimations() {
    var s = document.createElement('style');
    s.textContent =
      '@keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }' +
      '@keyframes countUp { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }' +
      '@keyframes spin    { to{transform:rotate(360deg)} }' +
      '@keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }' +
      '@keyframes pop-in  { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }';
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  —  رابط عمومی روی namespace و aliases برای HTML
  ═══════════════════════════════════════════════════════════ */
  Kara.openPanel  = Kara.openPanel  || karaOpenPanel;
  Kara.closePanel = Kara.closePanel || karaClosePanel;
  Kara.showToast  = Kara.showToast  || karaShowToast;
  Kara.initCountdown        = Kara.initCountdown        || karaInitCountdown;
  Kara.initPageTransitions  = Kara.initPageTransitions  || karaInitPageTransitions;
  Kara.initScrollTopBtn     = Kara.initScrollTopBtn     || karaInitScrollTopBtn;
  Kara.injectGlobalAnimations = Kara.injectGlobalAnimations || karaInjectGlobalAnimations;

  /* compat با کد قدیمی که showToast/openPanel را global صدا می‌زند */
  if (!window.showToast)  window.showToast  = karaShowToast;
  if (!window.openPanel)  window.openPanel  = karaOpenPanel;
  if (!window.closePanel) window.closePanel = karaClosePanel;

  /* ══════════════════════════════════════════════════════════
     INIT  —  هر فایل DOMContentLoaded مخصوص خودش را دارد
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    karaInjectGlobalAnimations();
    karaInitCountdown();
    karaInitPageTransitions();
    karaInitScrollTopBtn();
  });
})();
