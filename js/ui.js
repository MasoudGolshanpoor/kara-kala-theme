/* ============================================================
   VELA — UI Module
   Toast · Carousel · Countdown · Page Transitions · Animations
   ============================================================ */
'use strict';

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 350); }, 3200);
}


/* ══════════════════════════════════════════════════════════
   FLASH SALE COUNTDOWN
══════════════════════════════════════════════════════════ */
function initCountdown() {
  const hEl = document.getElementById('cd-h');
  const mEl = document.getElementById('cd-m');
  const sEl = document.getElementById('cd-s');
  if (!hEl) return;
  let total = (8 * 3600) + (34 * 60) + 52;
  const fmt = n => String(n).padStart(2, '0');
  const flip = (el, v) => {
    el.style.transition = 'transform 80ms ease, opacity 80ms ease';
    el.style.transform = 'translateY(-4px)'; el.style.opacity = '0.3';
    setTimeout(() => { el.textContent = v; el.style.transform = 'translateY(0)'; el.style.opacity = '1'; }, 80);
  };
  setInterval(() => {
    if (total-- <= 0) return;
    flip(hEl, fmt(Math.floor(total / 3600)));
    flip(mEl, fmt(Math.floor((total % 3600) / 60)));
    flip(sEl, fmt(total % 60));
  }, 1000);
}

/* ══════════════════════════════════════════════════════════
   PAGE TRANSITIONS + SCROLL ANIMATIONS
══════════════════════════════════════════════════════════ */
function initPageTransitions() {
  const cards = document.querySelectorAll('.product-card, .category-card, .blog-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }, i * 55);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.04, rootMargin: '0px 0px -40px 0px' });
  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(18px)';
    c.style.transition = 'opacity 380ms ease, transform 380ms ease, box-shadow 300ms ease';
    io.observe(c);
  });

  const stats = document.querySelectorAll('.stats-strip__num');
  const sIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.animation = 'countUp 600ms ease forwards'; sIo.unobserve(e.target); }
    });
  }, { threshold: .5 });
  stats.forEach(s => sIo.observe(s));
}

/* ══════════════════════════════════════════════════════════
   INJECTED KEYFRAME ANIMATIONS
══════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════
   STICKY SCROLL-TO-TOP BUTTON WITH PROGRESS RING
══════════════════════════════════════════════════════════ */
function initScrollTopBtn() {
  const btn = document.getElementById('scrollTopBtn');
  const bar = document.getElementById('scrollProgressBar');
  if (!btn || !bar) return;

  const CIRCUMFERENCE = 138;
  const SHOW_THRESHOLD = 120;

  const update = () => {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(scrolled / maxScroll, 1) : 0;

    bar.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

    if (scrolled > SHOW_THRESHOLD) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function injectGlobalAnimations() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
    @keyframes countUp { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
    @keyframes pop-in  { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
  `;
  document.head.appendChild(s);
}
