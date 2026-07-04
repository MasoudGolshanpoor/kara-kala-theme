/* ============================================================
   VELA — Mega Menu Module  (kara-mega-menu.js)
   مستقل · بدون coordinator
   شامل: Open/close · Tab switching (debounced) · Body backdrop
   ============================================================
   نکته‌ی وردپرس: محتوای دسته‌بندی‌ها در نسخه‌ی HTML استاتیک داخل
   قالب است. در وردپرس این HTML را از طریق Walker یا get_terms()
   در header.php رندر کنید؛ این ماژول فقط رفتار open/close و tab
   switching را مدیریت می‌کند و به ساختار DOM وابسته‌ست نه به محتوا.
   هیچ وابستگی به ماژول دیگر ندارد.
   ============================================================ */
(function () {
  'use strict';

  var Kara = (window.Kara = window.Kara || {});

  /* index دسته‌بندی فعال — برای debounce روی hover */
  var activeCatIndex = 0;

  function karaInitMegaMenu() {
    var trigger  = document.getElementById('categoriesMenu');
    var panel    = document.getElementById('megaMenu');
    var backdrop = document.getElementById('megaBackdrop');
    if (!trigger || !panel) return;

    /* trigger یک <button> مستقل است — aria-expanded مستقیم روی آن */
    function setExpanded(val) { trigger.setAttribute('aria-expanded', String(val)); }

    /* ── Tab switching با debounce 60ms (جایگزین window.__megaHover) ── */
    var hoverTimer = null;
    function switchTab(index) {
      clearTimeout(hoverTimer);
      if (index === activeCatIndex) return;
      hoverTimer = setTimeout(function () {
        activeCatIndex = index;
        document.querySelectorAll('.mega-cats__tab').forEach(function (t, i) {
          t.classList.toggle('is-active', i === index);
        });
        document.querySelectorAll('.mega-cats__panel').forEach(function (p, i) {
          p.classList.toggle('is-active', i === index);
        });
      }, 60);
    }

    /* اتصال لینک‌های [data-mega-index] (جایگزین inline onmouseenter/onfocus) */
    panel.querySelectorAll('[data-mega-index]').forEach(function (link) {
      link.addEventListener('mouseenter', function () { switchTab(Number(link.dataset.megaIndex)); });
      link.addEventListener('focus',      function () { switchTab(Number(link.dataset.megaIndex)); });
    });

    var closeTimer;

    function open() {
      clearTimeout(closeTimer);
      panel.classList.add('open');
      backdrop && backdrop.classList.add('show');
      setExpanded(true);
    }

    function close() {
      closeTimer = setTimeout(function () {
        panel.classList.remove('open');
        backdrop && backdrop.classList.remove('show');
        setExpanded(false);
      }, 180);
    }

    trigger.addEventListener('mouseenter', open);
    trigger.addEventListener('mouseleave', close);
    panel.addEventListener('mouseenter', open);
    panel.addEventListener('mouseleave', close);
    backdrop && backdrop.addEventListener('mouseenter', close);

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var isOpen = panel.classList.toggle('open');
        isOpen ? backdrop && backdrop.classList.add('show')
               : backdrop && backdrop.classList.remove('show');
        setExpanded(isOpen);
      }
      if (e.key === 'Escape') {
        panel.classList.remove('open');
        backdrop && backdrop.classList.remove('show');
        setExpanded(false);
      }
    });

    document.addEventListener('click', function (e) {
      if (!trigger.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.remove('open');
        backdrop && backdrop.classList.remove('show');
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  +  compat aliases
  ═══════════════════════════════════════════════════════════ */
  Kara.initMegaMenu = Kara.initMegaMenu || karaInitMegaMenu;
  if (!window.initMegaMenu) window.initMegaMenu = karaInitMegaMenu;

  document.addEventListener('DOMContentLoaded', karaInitMegaMenu);
})();
