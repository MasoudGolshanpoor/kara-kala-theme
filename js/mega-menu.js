/* ============================================================
   VELA — Mega Menu Module
   Handles open/close, tab switching, and body backdrop.
   All category content is static HTML in no-content.html.
   ============================================================ */

let activeCatIndex = 0;

function initMegaMenu() {
  const trigger   = document.getElementById('categoriesMenu');
  const panel     = document.getElementById('megaMenu');
  const backdrop  = document.getElementById('megaBackdrop');
  if (!trigger || !panel) return;

  // trigger is now a standalone <button> — set aria-expanded directly on it
  const setExpanded = (val) => trigger.setAttribute('aria-expanded', String(val));

  // Tab switching — debounced 60ms (replaces window.__megaHover)
  let hoverTimer = null;
  const switchTab = (index) => {
    clearTimeout(hoverTimer);
    if (index === activeCatIndex) return;
    hoverTimer = setTimeout(() => {
      activeCatIndex = index;
      document.querySelectorAll('.mega-cats__tab').forEach((t, i) =>
        t.classList.toggle('is-active', i === index));
      document.querySelectorAll('.mega-cats__panel').forEach((p, i) =>
        p.classList.toggle('is-active', i === index));
    }, 60);
  };

  // Wire data-mega-index links (replaces onmouseenter/onfocus inline handlers)
  panel.querySelectorAll('[data-mega-index]').forEach(link => {
    link.addEventListener('mouseenter', () => switchTab(Number(link.dataset.megaIndex)));
    link.addEventListener('focus',      () => switchTab(Number(link.dataset.megaIndex)));
  });

  let closeTimer;

  const open = () => {
    clearTimeout(closeTimer);
    panel.classList.add('open');
    backdrop?.classList.add('show');
    setExpanded(true);
  };

  const close = () => {
    closeTimer = setTimeout(() => {
      panel.classList.remove('open');
      backdrop?.classList.remove('show');
      setExpanded(false);
    }, 180);
  };

  trigger.addEventListener('mouseenter', open);
  trigger.addEventListener('mouseleave', close);
  panel.addEventListener('mouseenter', open);
  panel.addEventListener('mouseleave', close);
  backdrop?.addEventListener('mouseenter', close);

  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isOpen = panel.classList.toggle('open');
      isOpen ? backdrop?.classList.add('show') : backdrop?.classList.remove('show');
      setExpanded(isOpen);
    }
    if (e.key === 'Escape') {
      panel.classList.remove('open');
      backdrop?.classList.remove('show');
      setExpanded(false);
    }
  });

  document.addEventListener('click', e => {
    if (!trigger.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove('open');
      backdrop?.classList.remove('show');
    }
  });
}

window.initMegaMenu = initMegaMenu;
