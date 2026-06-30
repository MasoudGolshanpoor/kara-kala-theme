/* ============================================================
   VELA — Header Module
   scroll behavior · sticky logic · nav search trigger
   ============================================================ */
'use strict';

function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  initStickyOffset(header);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const announceBar = document.getElementById('announceBar');
        const announceH = announceBar ? announceBar.offsetHeight : 0;
        header.classList.toggle('site-header--scrolled', window.scrollY >= announceH);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  document.querySelectorAll('.nav-search__input, .nav-search__btn').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); openSearchModal(); });
  });

  initNavUnderline();
  initHeaderActions();
  initNavAutoHide(header);
}

function initStickyOffset(header) {
  const announceBar = document.getElementById('announceBar');
  if (!announceBar) return;

  function update() {
    header.style.top = `-${announceBar.offsetHeight}px`;
  }

  update();
  window.addEventListener('resize', update, { passive: true });

  /* When close button hides the bar, offsetHeight → 0 → top:0 */
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(update).observe(announceBar);
  }
}

function initHeaderActions() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    switch (el.dataset.action) {
      case 'close-announce-bar': {
        const bar = document.getElementById('announceBar');
        if (bar) bar.style.display = 'none';
        break;
      }
      case 'open-auth-modal':
        if (typeof openAuthModal === 'function') openAuthModal(el.dataset.tab || 'login');
        break;
      case 'open-cart':
        if (typeof openCartModal === 'function') openCartModal();
        break;
      case 'open-wishlist':
        if (typeof openWishlistModal === 'function') openWishlistModal();
        break;
      case 'open-support':
        if (typeof openSupportSheet === 'function') openSupportSheet();
        break;
      case 'close-support':
        if (typeof closeSupportSheet === 'function') closeSupportSheet();
        break;
      case 'toggle-footer-col': {
        const col = el.closest('.ftr-col');
        if (col) col.classList.toggle('is-open');
        break;
      }
      case 'scroll-to-top':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'toggle-footer-about': {
        const about = document.getElementById('ftrAbout');
        if (!about) break;
        const body = document.getElementById('ftrAboutBody');
        const expanded = about.classList.toggle('is-expanded');
        el.setAttribute('aria-expanded', String(expanded));
        if (body) {
          body.style.maxHeight = expanded ? body.scrollHeight + 'px' : '';
        }
        const lbl = el.querySelector('span');
        if (lbl) lbl.textContent = expanded ? 'بستن' : 'مشاهده بیشتر';
        break;
      }
    }
  });
}

/* ── Auto-hide header-nav on scroll-down, reveal on scroll-up ──
   Uses transform + margin-bottom to collapse the nav without an
   abrupt layout jump, and locks for 400ms after each toggle so
   the content-shift from the collapse cannot retrigger the handler. */
function initNavAutoHide(header) {
  let prevY     = window.scrollY;
  let hidden    = false;
  let locked    = false;
  let lockTimer = null;
  let rafId     = null;

  function isDesktop() { return window.innerWidth > 768; }

  function setLock() {
    locked = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => {
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

  window.addEventListener('scroll', () => {
    if (!isDesktop() || locked || rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const y = window.scrollY;
      const delta = y - prevY;
      prevY = y;
      if (y < 80)          { show(); return; }
      if (delta > 5)       hide();
      else if (delta < -5) show();
    });
  }, { passive: true });

  window.addEventListener('resize', () => {
    prevY  = window.scrollY; // re-baseline after layout shift from resize
    locked = false;
    clearTimeout(lockTimer);
    if (!isDesktop()) {
      // mobile: always show nav (CSS hides it via display:none)
      header.classList.remove('nav-hidden');
      hidden = false;
    }
  }, { passive: true });
}

function initNavUnderline() {
  const nav = document.querySelector('.dnav');
  if (!nav) return;
  const list = nav.querySelector('.dnav__list');
  const underline = nav.querySelector('.nav-underline');
  if (!list || !underline) return;

  const topLinks = Array.from(list.querySelectorAll(':scope > .dnav__item > .dnav__link'));
  const activeLink = list.querySelector('.dnav__link--active') || topLinks[0];

  function move(el) {
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    underline.style.left = (elRect.left - navRect.left) + 'px';
    underline.style.width = elRect.width + 'px';
  }

  if (activeLink) {
    move(activeLink);
    requestAnimationFrame(() => underline.classList.add('nav-underline--ready'));
  }

  topLinks.forEach(link => {
    link.addEventListener('mouseenter', () => move(link));
  });

  list.addEventListener('mouseleave', (e) => {
    const panel = document.getElementById('megaMenu');
    if (panel && (panel === e.relatedTarget || panel.contains(e.relatedTarget))) return;
    if (activeLink) move(activeLink);
  });

  const megaPanel = document.getElementById('megaMenu');
  if (megaPanel) {
    megaPanel.addEventListener('mouseleave', (e) => {
      const trigger = document.getElementById('categoriesMenu');
      if (trigger && (trigger === e.relatedTarget || trigger.contains(e.relatedTarget))) return;
      if (activeLink) move(activeLink);
    });
  }
}
