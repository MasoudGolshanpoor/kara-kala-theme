/* ============================================================
   VELA — Mobile Nav Module  (vela-mobile-nav.js)
   مستقل · بدون coordinator
   شامل: Mobile drawer · Drawer tabs · Bottom nav · FAB
          · Support sheet · Category accordion
   ============================================================
   وابستگی‌ها (همه از طریق namespace با fallback):
     - Vela.state / Vela.openPanel / Vela.closePanel  (vela-ui.js)
     - Vela.openSearchModal / velaCloseSearchModal    (vela-search.js) — typeof-checked
   ============================================================ */
(function () {
  'use strict';

  var Vela = (window.Vela = window.Vela || {});
  /* در صورت نبود vela-ui.js، یک state خالی بساز تا این ماژول کار کند */
  Vela.state = Vela.state || { activePanel: null };

  /* ══════════════════════════════════════════════════════════
     MOBILE DRAWER
  ═══════════════════════════════════════════════════════════ */
  function velaInitMobileDrawer() {
    var hamburger = document.getElementById('navHamburger');
    if (hamburger) hamburger.addEventListener('click', velaOpenMobileDrawer);
    velaInitDrawerTabs();
    velaInitDrawerActions();
  }

  function velaInitDrawerTabs() {
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

  function velaInitDrawerActions() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action]');
      if (!el) return;
      switch (el.dataset.action) {
        case 'close-mobile-drawer':
          velaCloseMobileDrawer();
          break;
        case 'open-search':
          velaCloseMobileDrawer();
          if (typeof Vela.openSearchModal === 'function') Vela.openSearchModal();
          break;
        case 'switch-drawer-cat-tab':
          velaSwitchDrawerCatTab(Number(el.dataset.dcat));
          break;
        case 'toggle-drawer-subcat':
          velaToggleDrawerSubCat(Number(el.dataset.parent), Number(el.dataset.child));
          break;
      }
    });
  }

  function velaToggleDrawerCat(index) {
    var items = document.querySelectorAll('.drawer-cat-item');
    var target = items[index];
    if (!target) return;
    var wasOpen = target.classList.contains('is-open');
    items.forEach(function (el) { el.classList.remove('is-open'); });
    if (!wasOpen) target.classList.add('is-open');
  }

  function velaToggleDrawerSubCat(catIndex, childIndex) {
    var items = document.querySelectorAll('.drawer-subcat-item[data-parent="' + catIndex + '"]');
    var target = Array.from(items).find(function (el) { return el.dataset.child === String(childIndex); });
    if (!target) return;
    var wasOpen = target.classList.contains('is-open');
    items.forEach(function (el) { el.classList.remove('is-open'); });
    if (!wasOpen) target.classList.add('is-open');
  }

  function velaOpenMobileDrawer() {
    var d = document.getElementById('mobileDrawer');    if (d) d.classList.add('open');
    var o = document.getElementById('drawerOverlay');   if (o) o.classList.add('open');
    var h = document.getElementById('navHamburger');    if (h) h.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function velaCloseMobileDrawer() {
    var d = document.getElementById('mobileDrawer');    if (d) d.classList.remove('open');
    var o = document.getElementById('drawerOverlay');   if (o) o.classList.remove('open');
    var h = document.getElementById('navHamburger');    if (h) h.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ══════════════════════════════════════════════════════════
     SUPPORT SHEET  (پنل پایین پشتیبانی)
  ═══════════════════════════════════════════════════════════ */
  function velaOpenSupportSheet() {
    var sheet = document.getElementById('supportSheet');
    if (!sheet) return;
    sheet.classList.remove('closing');
    sheet.classList.add('open');
    sheet.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    if (typeof Vela.openPanel === 'function') Vela.openPanel('support');
  }

  function velaCloseSupportSheet() {
    var sheet = document.getElementById('supportSheet');
    if (!sheet) return;
    sheet.classList.add('closing');
    setTimeout(function () {
      sheet.classList.remove('open', 'closing');
      sheet.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (typeof Vela.closePanel === 'function') Vela.closePanel('support');
    }, 240);
  }

  /* ══════════════════════════════════════════════════════════
     BOTTOM NAV + FAB
  ═══════════════════════════════════════════════════════════ */
  function velaInitBottomNav() {
    var fab    = document.getElementById('bottomFab');
    var catBtn = document.getElementById('bottomCatBtn');
    if (!fab) return;

    /* اگر پنلی باز است → همه را ببند؛ در غیر این صورت سرچ را باز کن */
    fab.addEventListener('click', function () {
      if (Vela.state.activePanel) {
        if (typeof Vela.closeMobileFilters === 'function') Vela.closeMobileFilters();
        if (typeof Vela.closeSearchModal  === 'function') Vela.closeSearchModal();
        velaCloseSupportSheet();
      } else {
        if (typeof Vela.openSearchModal === 'function') Vela.openSearchModal();
      }
    });

    /* دسته‌بندی: drawer را باز کن و مستقیماً تب cats را فعال کن */
    if (catBtn) {
      catBtn.addEventListener('click', function () {
        velaOpenMobileDrawer();
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
    if (supportBackdrop) supportBackdrop.addEventListener('click', velaCloseSupportSheet);

    /* علامت‌گذاری دکمه‌ی فعال bottom-nav بر اساس صفحه‌ی جاری */
    var page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.bottom-nav__btn[data-page]').forEach(function (el) {
      el.classList.toggle('is-active', el.dataset.page === page);
    });
  }

  function velaSwitchDrawerCatTab(index) {
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
  Vela.initMobileDrawer  = Vela.initMobileDrawer  || velaInitMobileDrawer;
  Vela.initBottomNav     = Vela.initBottomNav     || velaInitBottomNav;
  Vela.openMobileDrawer  = Vela.openMobileDrawer  || velaOpenMobileDrawer;
  Vela.closeMobileDrawer = Vela.closeMobileDrawer || velaCloseMobileDrawer;
  Vela.openSupportSheet  = Vela.openSupportSheet  || velaOpenSupportSheet;
  Vela.closeSupportSheet = Vela.closeSupportSheet || velaCloseSupportSheet;
  Vela.toggleDrawerCat    = Vela.toggleDrawerCat    || velaToggleDrawerCat;
  Vela.toggleDrawerSubCat = Vela.toggleDrawerSubCat || velaToggleDrawerSubCat;
  Vela.switchDrawerCatTab = Vela.switchDrawerCatTab || velaSwitchDrawerCatTab;

  /* compat با کد قدیمی (global‌های نام‌دار) */
  if (!window.initMobileDrawer)    window.initMobileDrawer    = velaInitMobileDrawer;
  if (!window.initBottomNav)       window.initBottomNav       = velaInitBottomNav;
  if (!window.openMobileDrawer)    window.openMobileDrawer    = velaOpenMobileDrawer;
  if (!window.closeMobileDrawer)   window.closeMobileDrawer   = velaCloseMobileDrawer;
  if (!window.openSupportSheet)    window.openSupportSheet    = velaOpenSupportSheet;
  if (!window.closeSupportSheet)   window.closeSupportSheet   = velaCloseSupportSheet;
  if (!window.toggleDrawerCat)     window.toggleDrawerCat     = velaToggleDrawerCat;
  if (!window.toggleDrawerSubCat)  window.toggleDrawerSubCat  = velaToggleDrawerSubCat;
  if (!window.switchDrawerCatTab)  window.switchDrawerCatTab  = velaSwitchDrawerCatTab;

  document.addEventListener('DOMContentLoaded', function () {
    velaInitMobileDrawer();
    velaInitBottomNav();
  });
})();
