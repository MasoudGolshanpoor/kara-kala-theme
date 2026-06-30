/* ============================================================
   VELA — Mobile Nav Module
   mobile drawer open/close · bottom nav · category panel
   Category accordion HTML is static in no-content.html.
   ============================================================ */

/* ─── MOBILE DRAWER ─── */
function initMobileDrawer() {
  const hamburger = document.getElementById('navHamburger');
  if (hamburger) hamburger.addEventListener('click', openMobileDrawer);
  initDrawerTabs();
  initDrawerActions();
}

function initDrawerTabs() {
  document.querySelectorAll('.drawer-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.drawer-tab').forEach(t => {
        t.classList.toggle('is-active', t.dataset.tab === target);
        t.setAttribute('aria-selected', String(t.dataset.tab === target));
      });
      const panelId = 'drawerPanel' + target.charAt(0).toUpperCase() + target.slice(1);
      document.querySelectorAll('.drawer-panel').forEach(p => {
        p.classList.toggle('is-active', p.id === panelId);
      });
    });
  });
}

function initDrawerActions() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    switch (el.dataset.action) {
      case 'close-mobile-drawer':
        closeMobileDrawer();
        break;
      case 'open-search':
        closeMobileDrawer();
        if (typeof openSearchModal === 'function') openSearchModal();
        break;
      case 'switch-drawer-cat-tab':
        switchDrawerCatTab(Number(el.dataset.dcat));
        break;
      case 'toggle-drawer-subcat':
        toggleDrawerSubCat(Number(el.dataset.parent), Number(el.dataset.child));
        break;
    }
  });
}

function toggleDrawerCat(index) {
  const items = document.querySelectorAll('.drawer-cat-item');
  const target = items[index];
  if (!target) return;
  const wasOpen = target.classList.contains('is-open');
  items.forEach(el => el.classList.remove('is-open'));
  if (!wasOpen) target.classList.add('is-open');
}

function toggleDrawerSubCat(catIndex, childIndex) {
  const items = document.querySelectorAll(`.drawer-subcat-item[data-parent="${catIndex}"]`);
  const target = Array.from(items).find(el => el.dataset.child === String(childIndex));
  if (!target) return;
  const wasOpen = target.classList.contains('is-open');
  items.forEach(el => el.classList.remove('is-open'));
  if (!wasOpen) target.classList.add('is-open');
}

function openMobileDrawer() {
  document.getElementById('mobileDrawer')?.classList.add('open');
  document.getElementById('drawerOverlay')?.classList.add('open');
  document.getElementById('navHamburger')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
  document.getElementById('mobileDrawer')?.classList.remove('open');
  document.getElementById('drawerOverlay')?.classList.remove('open');
  document.getElementById('navHamburger')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── SUPPORT SHEET ─── */
function openSupportSheet() {
  const sheet = document.getElementById('supportSheet');
  if (!sheet) return;
  sheet.classList.remove('closing');
  sheet.classList.add('open');
  sheet.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  openPanel('support');
}

function closeSupportSheet() {
  const sheet = document.getElementById('supportSheet');
  if (!sheet) return;
  sheet.classList.add('closing');
  setTimeout(() => {
    sheet.classList.remove('open', 'closing');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    closePanel('support');
  }, 240);
}

/* ─── BOTTOM NAV + FAB ─── */
function initBottomNav() {
  const fab    = document.getElementById('bottomFab');
  const catBtn = document.getElementById('bottomCatBtn');

  if (!fab) return;

  fab.addEventListener('click', () => {
    if (state.activePanel) {
      closeFilterSheet();
      closeSearchModal();
      closeSupportSheet();
    } else {
      openSearchModal();
    }
  });

  /* دسته‌بندی: drawer را باز کن و مستقیماً تب cats را فعال کن */
  catBtn?.addEventListener('click', () => {
    openMobileDrawer();
    document.querySelectorAll('.drawer-tab').forEach(t => {
      const isCats = t.dataset.tab === 'cats';
      t.classList.toggle('is-active', isCats);
      t.setAttribute('aria-selected', String(isCats));
    });
    document.querySelectorAll('.drawer-panel').forEach(p => {
      p.classList.toggle('is-active', p.id === 'drawerPanelCats');
    });
  });

  /* Support sheet backdrop click */
  document.getElementById('supportBackdrop')?.addEventListener('click', closeSupportSheet);

  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.bottom-nav__btn[data-page]').forEach(el => {
    el.classList.toggle('is-active', el.dataset.page === page);
  });
}

function switchDrawerCatTab(index) {
  document.querySelectorAll('.drawer-cats-tab').forEach(t => {
    t.classList.toggle('is-active', Number(t.dataset.dcat) === index);
  });
  document.querySelectorAll('.drawer-cats-panel').forEach(p => {
    p.classList.toggle('is-active', Number(p.dataset.dcatPanel) === index);
  });
}

window.switchDrawerCatTab = switchDrawerCatTab;
window.initMobileDrawer   = initMobileDrawer;
window.initBottomNav      = initBottomNav;
window.openMobileDrawer   = openMobileDrawer;
window.closeMobileDrawer  = closeMobileDrawer;
window.toggleDrawerCat    = toggleDrawerCat;
window.toggleDrawerSubCat = toggleDrawerSubCat;
