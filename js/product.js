/* ============================================================
   VELA — Product Detail Module
   Gallery · Quantity · Color/Size Variants · Tabs · Sticky CTA
   ============================================================ */
'use strict';

const galleryEmojis = ['🎧', '🎧', '🔌', '📦', '📋'];

function switchGallery(index) {
  document.querySelectorAll('.gallery__thumb').forEach((t, i) => t.classList.toggle('active', i === index));
  const d = document.getElementById('galleryDisplay');
  if (!d) return;
  d.style.transition = 'opacity 150ms ease, transform 150ms ease';
  d.style.opacity = '0'; d.style.transform = 'scale(0.95)';
  setTimeout(() => {
    d.textContent = galleryEmojis[index] ?? '🎧';
    d.style.opacity = '1'; d.style.transform = 'scale(1)';
  }, 150);
}

function adjustQty(delta) {
  state.qty = Math.max(1, Math.min(99, state.qty + delta));
  const el = document.getElementById('qtyVal');
  if (!el) return;
  el.textContent = state.qty;
  el.style.transition = 'transform 150ms ease';
  el.style.transform = delta > 0 ? 'translateY(-3px)' : 'translateY(3px)';
  setTimeout(() => el.style.transform = '', 150);
}

function selectColor(el, name) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  const label = el.closest('.variant-group')?.querySelector('.variant-group__label span');
  if (label) {
    label.style.transition = 'opacity 100ms ease';
    label.style.opacity = '0';
    setTimeout(() => { label.textContent = name; label.style.opacity = '1'; }, 100);
  }
}

function switchTab(btn, id) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const pane = document.getElementById('tab-' + id);
  if (pane) { pane.classList.add('active'); pane.style.animation = 'fadeIn 200ms ease forwards'; }
}

function initStickyCta() {
  const cta     = document.getElementById('stickyCta');
  const trigger = document.getElementById('productInfoTop');
  if (!cta || !trigger) return;
  new IntersectionObserver(
    ([e]) => cta.classList.toggle('visible', !e.isIntersecting),
    { threshold: 0, rootMargin: '0px 0px -80px 0px' }
  ).observe(trigger);
}
