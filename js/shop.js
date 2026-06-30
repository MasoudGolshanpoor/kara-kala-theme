/* ============================================================
   VELA — Shop Module
   Shop Filters · Price Range
   ============================================================ */
'use strict';

/* ══════════════════════════════════════════════════════════
   SHOP FILTER SIDEBAR
══════════════════════════════════════════════════════════ */
function closeFilterSheet() { closeMobileFilters(); }

function openMobileFilters() {
  document.getElementById('filtersSidebar')?.classList.add('is-open');
  document.getElementById('filtersSidebarOverlay')?.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeMobileFilters() {
  document.getElementById('filtersSidebar')?.classList.remove('is-open');
  document.getElementById('filtersSidebarOverlay')?.classList.remove('is-open');
  document.body.style.overflow = '';
}

function toggleFilterGroup(titleEl) {
  titleEl.closest('.filter-group').classList.toggle('collapsed');
}

function removeFilter(chip) {
  chip.style.transition = 'all 200ms ease';
  chip.style.transform = 'scale(0)'; chip.style.opacity = '0';
  setTimeout(() => chip.remove(), 200);
  showToast('فیلتر حذف شد', 'info');
}

function clearFilters() {
  document.querySelectorAll('#activeFilters .filter-chip').forEach(c => {
    c.style.transition = 'all 200ms ease';
    c.style.transform = 'scale(0)'; c.style.opacity = '0';
    setTimeout(() => c.remove(), 200);
  });
  showToast('همه فیلترها پاک شدند', 'info');
}

function toggleSortDropdown() {
  const dd = document.getElementById('sortDropdown');
  if (!dd) return;
  const isOpen = dd.classList.toggle('is-open');
  const btn = dd.querySelector('.sort-dropdown__btn');
  if (btn) btn.setAttribute('aria-expanded', isOpen);
}
function closeSortDropdown() {
  const dd = document.getElementById('sortDropdown');
  if (!dd || !dd.classList.contains('is-open')) return;
  dd.classList.remove('is-open');
  const btn = dd.querySelector('.sort-dropdown__btn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}
function setSortOption(el) {
  const val = el.dataset.value;
  if (!val) return;
  const valEl = document.getElementById('sortVal');
  if (valEl) valEl.textContent = val;
  document.querySelectorAll('.sort-dropdown__item').forEach(i => {
    const active = i === el;
    i.classList.toggle('is-active', active);
    i.setAttribute('aria-selected', active);
  });
  closeSortDropdown();
  showToast(`مرتب‌سازی: ${val}`, 'info');
}
function toggleCatTree(btn) {
  const parent = btn.closest('.cat-tree__parent');
  if (!parent) return;
  const isOpen = parent.classList.toggle('is-open');
  btn.setAttribute('aria-expanded', isOpen);
  parent.setAttribute('aria-expanded', isOpen);
}

function toggleShopAbout() {
  const el = document.getElementById('shopAbout');
  if (!el) return;
  const isOpen = el.classList.toggle('is-open');
  const btn = el.querySelector('[data-action="toggle-shop-about"]');
  if (btn) {
    btn.setAttribute('aria-expanded', isOpen);
    const span = btn.querySelector('span');
    if (span) span.textContent = isOpen ? 'بستن' : 'مشاهده بیشتر';
  }
}

/* ══════════════════════════════════════════════════════════
   SHOP PAGE INIT — data-action handlers
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  /* delegate data-action clicks for shop-specific actions */
  document.addEventListener('click', e => {
    if (!e.target.closest('#sortDropdown')) closeSortDropdown();

    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    if (action === 'open-mobile-filters')  { openMobileFilters(); }
    if (action === 'close-mobile-filters') { closeMobileFilters(); }
    if (action === 'remove-filter')        { removeFilter(el); }
    if (action === 'clear-filters')        { clearFilters(); }
    if (action === 'toggle-filter-group')  { toggleFilterGroup(el); }
    if (action === 'toggle-sort-dropdown') { toggleSortDropdown(); e.stopPropagation(); }
    if (action === 'set-sort-option')      { setSortOption(el); }
    if (action === 'toggle-cat-tree')      { toggleCatTree(el); }
    if (action === 'toggle-shop-about')    { toggleShopAbout(); }
  });
});

/* ══════════════════════════════════════════════════════════
   PRICE RANGE (responsive + RTL)
══════════════════════════════════════════════════════════ */
// function initPriceRange() {
//   const minInput = document.getElementById('priceMinInput');
//   const maxInput = document.getElementById('priceMaxInput');
//   const fill     = document.getElementById('priceRangeFill');
//   const minVal   = document.getElementById('priceMinVal');
//   const maxVal   = document.getElementById('priceMaxVal');
//   if (!minInput || !maxInput) return;

//   const MIN = parseInt(minInput.min) || 0;
//   const MAX = parseInt(minInput.max) || 100000000;
//   const GAP = 1000000;

//   const fmt = v => Number(v).toLocaleString('fa-IR');

//   function update() {
//     let lo = parseInt(minInput.value);
//     let hi = parseInt(maxInput.value);
//     if (lo > hi - GAP) { lo = hi - GAP; if (lo < MIN) lo = MIN; minInput.value = lo; }
//     if (hi < lo + GAP) { hi = lo + GAP; if (hi > MAX) hi = MAX; maxInput.value = hi; }

//     const range = MAX - MIN;
//     const leftPct  = ((lo - MIN) / range) * 100;
//     const rightPct = ((MAX - hi) / range) * 100;

//     // چون wrapper با scaleX(-1) برعکس شده،
//     // left و right هم باید جابه‌جا بشن
//     if (fill) {
//       fill.style.left  = rightPct + '%';
//       fill.style.right = leftPct  + '%';
//     }

//     if (minVal) minVal.textContent = fmt(lo);
//     if (maxVal) maxVal.textContent = fmt(hi);
//   }

//   minInput.addEventListener('input', update);
//   maxInput.addEventListener('input', update);
//   update();
// }
function initPriceRange() {
  const minInput = document.getElementById('priceMinInput');
  const maxInput = document.getElementById('priceMaxInput');
  const fill   = document.getElementById('priceRangeFill');
  const minVal = document.getElementById('priceMinVal');
  const maxVal = document.getElementById('priceMaxVal');
  if (!minInput || !maxInput) return;

  const MIN = parseInt(minInput.min) || 0;
  const MAX = parseInt(minInput.max) || 100000000;

  // تبدیل ارقام فارسی/عربی به انگلیسی + حذف جداکننده
  const toEn = s => String(s)
    .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584))
    .replace(/,|،/g, '');

  // نمایش فارسی
  const fmt = v => Number(v).toLocaleString('fa-IR');

  function updateFill() {
    const lo = parseInt(minInput.value) || MIN;
    const hi = parseInt(maxInput.value) || MAX;
    const range = MAX - MIN || 1;
    const leftPct  = ((lo - MIN) / range) * 100;
    const rightPct = ((MAX - hi) / range) * 100;
    if (fill) {
      fill.style.left  = rightPct + '%';
      fill.style.right = leftPct  + '%';
    }
  }

  // اسلایدر تغییر کرد → باکس‌ها رو آپدیت کن
  function onSliderInput() {
    if (minVal) minVal.value = fmt(minInput.value);
    if (maxVal) maxVal.value = fmt(maxInput.value);
    updateFill();
  }

  // کاربر داره تایپ می‌کنه → فقط اسلایدر sync کن، به باکس دست نزن
  function onBoxInput(isMin) {
    const el  = isMin ? minVal : maxVal;
    const num = parseInt(toEn(el.value)) || 0;
    if (isMin) minInput.value = Math.max(MIN, Math.min(num, MAX));
    else       maxInput.value = Math.max(MIN, Math.min(num, MAX));
    updateFill();
  }

  // کاربر فیلد رو رها کرد → حالا فرمت کن
  function onBoxBlur(isMin) {
    const el  = isMin ? minVal : maxVal;
    const num = parseInt(toEn(el.value)) || 0;
    el.value  = fmt(num);
    if (isMin) minInput.value = Math.max(MIN, Math.min(num, MAX));
    else       maxInput.value = Math.max(MIN, Math.min(num, MAX));
    updateFill();
  }

  minInput.addEventListener('input', onSliderInput);
  maxInput.addEventListener('input', onSliderInput);

  if (minVal) {
    minVal.addEventListener('input', () => onBoxInput(true));
    minVal.addEventListener('blur',  () => onBoxBlur(true));
  }
  if (maxVal) {
    maxVal.addEventListener('input', () => onBoxInput(false));
    maxVal.addEventListener('blur',  () => onBoxBlur(false));
  }

  // مقدار اولیه
  if (minVal) minVal.value = fmt(minInput.value);
  if (maxVal) maxVal.value = fmt(maxInput.value);
  updateFill();
}
