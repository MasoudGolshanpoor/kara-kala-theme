/* ============================================================
   VELA — Mobile Nav Module  (kara-mobile-nav.js)
   مستقل · بدون coordinator
   شامل: Mobile drawer · Drawer tabs · Bottom nav · FAB
          · Support sheet · Category accordion
   ============================================================
   وابستگی‌ها (همه از طریق namespace با fallback):
     - Kara.state / Kara.openPanel / Kara.closePanel  (kara-ui.js)
     - Kara.openSearchModal / karaCloseSearchModal    (kara-search.js) — typeof-checked
   ============================================================ */
(function () {
  'use strict';

  var Kara = (window.Kara = window.Kara || {});
  /* در صورت نبود kara-ui.js، یک state خالی بساز تا این ماژول کار کند */
  Kara.state = Kara.state || { activePanel: null };

  /* ══════════════════════════════════════════════════════════
     MOBILE DRAWER
  ═══════════════════════════════════════════════════════════ */
  function karaInitMobileDrawer() {
    var hamburger = document.getElementById('navHamburger');
    if (hamburger) hamburger.addEventListener('click', karaOpenMobileDrawer);
    karaInitDrawerTabs();
    karaInitDrawerActions();
  }

  function karaInitDrawerTabs() {
    document.querySelectorAll('.drawer-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.dataset.tab;
        document.querySelectorAll('.drawer-tab').forEach(function (t) {
          var on = t.dataset.tab === target;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', String(on));
        });
        var panelId = 'drawerPanel' + target.charAt(0).toUpperCase() + target.slice(1);
        document.querySelectorAll('.drawer-panel').forEach(function (p) {
          p.classList.toggle('is-active', p.id === panelId);
        });
      });
    });
  }

  function karaInitDrawerActions() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action]');
      if (!el) return;
      switch (el.dataset.action) {
        case 'close-mobile-drawer':
          karaCloseMobileDrawer();
          break;
        case 'open-search':
          karaCloseMobileDrawer();
          if (typeof Kara.openSearchModal === 'function') Kara.openSearchModal();
          break;
        case 'switch-drawer-cat-tab':
          karaSwitchDrawerCatTab(Number(el.dataset.dcat));
          break;
        case 'toggle-drawer-subcat':
          karaToggleDrawerSubCat(Number(el.dataset.parent), Number(el.dataset.child));
          break;
      }
    });
  }

  function karaToggleDrawerCat(index) {
    var items = document.querySelectorAll('.drawer-cat-item');
    var target = items[index];
    if (!target) return;
    var wasOpen = target.classList.contains('is-open');
    items.forEach(function (el) { el.classList.remove('is-open'); });
    if (!wasOpen) target.classList.add('is-open');
  }

  function karaToggleDrawerSubCat(catIndex, childIndex) {
    var items = document.querySelectorAll('.drawer-subcat-item[data-parent="' + catIndex + '"]');
    var target = Array.from(items).find(function (el) { return el.dataset.child === String(childIndex); });
    if (!target) return;
    var wasOpen = target.classList.contains('is-open');
    items.forEach(function (el) { el.classList.remove('is-open'); });
    if (!wasOpen) target.classList.add('is-open');
  }

  function karaOpenMobileDrawer() {
    var d = document.getElementById('mobileDrawer');    if (d) d.classList.add('open');
    var o = document.getElementById('drawerOverlay');   if (o) o.classList.add('open');
    var h = document.getElementById('navHamburger');    if (h) h.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function karaCloseMobileDrawer() {
    var d = document.getElementById('mobileDrawer');    if (d) d.classList.remove('open');
    var o = document.getElementById('drawerOverlay');   if (o) o.classList.remove('open');
    var h = document.getElementById('navHamburger');    if (h) h.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ══════════════════════════════════════════════════════════
     SUPPORT SHEET  (پنل پایین پشتیبانی)
  ═══════════════════════════════════════════════════════════ */
  function karaOpenSupportSheet() {
    var sheet = document.getElementById('supportSheet');
    if (!sheet) return;
    sheet.classList.remove('closing');
    sheet.classList.add('open');
    sheet.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    if (typeof Kara.openPanel === 'function') Kara.openPanel('support');
  }

  function karaCloseSupportSheet() {
    var sheet = document.getElementById('supportSheet');
    if (!sheet) return;
    sheet.classList.add('closing');
    setTimeout(function () {
      sheet.classList.remove('open', 'closing');
      sheet.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (typeof Kara.closePanel === 'function') Kara.closePanel('support');
    }, 240);
  }

  /* ══════════════════════════════════════════════════════════
     BOTTOM NAV + FAB
  ═══════════════════════════════════════════════════════════ */
  function karaInitBottomNav() {
    var fab    = document.getElementById('bottomFab');
    var catBtn = document.getElementById('bottomCatBtn');
    if (!fab) return;

    /* اگر پنلی باز است → همه را ببند؛ در غیر این صورت سرچ را باز کن */
    fab.addEventListener('click', function () {
      if (Kara.state.activePanel) {
        if (typeof Kara.closeMobileFilters === 'function') Kara.closeMobileFilters();
        if (typeof Kara.closeSearchModal  === 'function') Kara.closeSearchModal();
        karaCloseSupportSheet();
      } else {
        if (typeof Kara.openSearchModal === 'function') Kara.openSearchModal();
      }
    });

    /* دسته‌بندی: drawer را باز کن و مستقیماً تب cats را فعال کن */
    if (catBtn) {
      catBtn.addEventListener('click', function () {
        karaOpenMobileDrawer();
        document.querySelectorAll('.drawer-tab').forEach(function (t) {
          var isCats = t.dataset.tab === 'cats';
          t.classList.toggle('is-active', isCats);
          t.setAttribute('aria-selected', String(isCats));
        });
        document.querySelectorAll('.drawer-panel').forEach(function (p) {
          p.classList.toggle('is-active', p.id === 'drawerPanelCats');
        });
      });
    }

    /* Support sheet backdrop click */
    var supportBackdrop = document.getElementById('supportBackdrop');
    if (supportBackdrop) supportBackdrop.addEventListener('click', karaCloseSupportSheet);

    /* علامت‌گذاری دکمه‌ی فعال bottom-nav بر اساس صفحه‌ی جاری */
    var page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.bottom-nav__btn[data-page]').forEach(function (el) {
      el.classList.toggle('is-active', el.dataset.page === page);
    });
  }

  function karaSwitchDrawerCatTab(index) {
    document.querySelectorAll('.drawer-cats-tab').forEach(function (t) {
      t.classList.toggle('is-active', Number(t.dataset.dcat) === index);
    });
    document.querySelectorAll('.drawer-cats-panel').forEach(function (p) {
      p.classList.toggle('is-active', Number(p.dataset.dcatPanel) === index);
    });
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  +  compat aliases
  ═══════════════════════════════════════════════════════════ */
  Kara.initMobileDrawer  = Kara.initMobileDrawer  || karaInitMobileDrawer;
  Kara.initBottomNav     = Kara.initBottomNav     || karaInitBottomNav;
  Kara.openMobileDrawer  = Kara.openMobileDrawer  || karaOpenMobileDrawer;
  Kara.closeMobileDrawer = Kara.closeMobileDrawer || karaCloseMobileDrawer;
  Kara.openSupportSheet  = Kara.openSupportSheet  || karaOpenSupportSheet;
  Kara.closeSupportSheet = Kara.closeSupportSheet || karaCloseSupportSheet;
  Kara.toggleDrawerCat    = Kara.toggleDrawerCat    || karaToggleDrawerCat;
  Kara.toggleDrawerSubCat = Kara.toggleDrawerSubCat || karaToggleDrawerSubCat;
  Kara.switchDrawerCatTab = Kara.switchDrawerCatTab || karaSwitchDrawerCatTab;

  /* compat با کد قدیمی (global‌های نام‌دار) */
  if (!window.initMobileDrawer)    window.initMobileDrawer    = karaInitMobileDrawer;
  if (!window.initBottomNav)       window.initBottomNav       = karaInitBottomNav;
  if (!window.openMobileDrawer)    window.openMobileDrawer    = karaOpenMobileDrawer;
  if (!window.closeMobileDrawer)   window.closeMobileDrawer   = karaCloseMobileDrawer;
  if (!window.openSupportSheet)    window.openSupportSheet    = karaOpenSupportSheet;
  if (!window.closeSupportSheet)   window.closeSupportSheet   = karaCloseSupportSheet;
  if (!window.toggleDrawerCat)     window.toggleDrawerCat     = karaToggleDrawerCat;
  if (!window.toggleDrawerSubCat)  window.toggleDrawerSubCat  = karaToggleDrawerSubCat;
  if (!window.switchDrawerCatTab)  window.switchDrawerCatTab  = karaSwitchDrawerCatTab;

  document.addEventListener('DOMContentLoaded', function () {
    karaInitMobileDrawer();
    karaInitBottomNav();
  });
})();
