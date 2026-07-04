/* ============================================================
   VELA — Shop Module  (kara-shop.js)
   مستقل · بدون coordinator
   شامل: Filter sidebar (mobile) · Sort dropdown · Filter chips
          · Cat-tree accordion · Price range · Shop about toggle
   ============================================================
   وابستگی‌ها (همه از طریق namespace با fallback):
     - Kara.showToast  (از kara-ui.js) — اختیاری، فقط پیام
   ────────────────────────────────────────────────────────────
   ⚠️  بخش‌های WordPress / WooCommerce:
     - فیلترها فعلاً فقط روی DOM عمل می‌کنند (افکت بصری). در وردپرس
       باید state فیلترها را جمع کرده و به query ارسال کنید:
         · دسته‌بندی/برند/سایز → WP_Query tax_query
         · محدوده قیمت → meta_query روی '_price'
         · مرتب‌سازی → 'orderby' / 'order'  (price, date, popularity)
       راه ساده: ارسال پارامترها به admin-ajax.php?action=kara_shop_filter
       و رندر مجدد حلقه‌ی محصولات (مثلاً در #shopResults).
   ============================================================ */
(function () {
  'use strict';

  var Kara = (window.Kara = window.Kara || {});
  /* اگر kara-ui.js لود نشد، showToast خالی بساز تا خطا ندهد */
  var toast = function (msg, type) {
    if (typeof Kara.showToast === 'function') Kara.showToast(msg, type);
  };

  /* ══════════════════════════════════════════════════════════
     SHOP FILTER SIDEBAR  (موبایل)
  ═══════════════════════════════════════════════════════════ */
  function karaOpenMobileFilters() {
    var sb = document.getElementById('filtersSidebar');
    var ov = document.getElementById('filtersSidebarOverlay');
    if (sb) sb.classList.add('is-open');
    if (ov) ov.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function karaCloseMobileFilters() {
    var sb = document.getElementById('filtersSidebar');
    var ov = document.getElementById('filtersSidebarOverlay');
    if (sb) sb.classList.remove('is-open');
    if (ov) ov.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function karaToggleFilterGroup(titleEl) {
    var group = titleEl.closest('.filter-group');
    if (group) group.classList.toggle('collapsed');
  }

  function karaRemoveFilter(chip) {
    chip.style.transition = 'all 200ms ease';
    chip.style.transform = 'scale(0)';
    chip.style.opacity = '0';
    setTimeout(function () { chip.remove(); }, 200);
    toast('فیلتر حذف شد', 'info');
  }

  function karaClearFilters() {
    document.querySelectorAll('#activeFilters .filter-chip').forEach(function (c) {
      c.style.transition = 'all 200ms ease';
      c.style.transform = 'scale(0)';
      c.style.opacity = '0';
      setTimeout(function () { c.remove(); }, 200);
    });
    toast('همه فیلترها پاک شدند', 'info');
  }

  /* ══════════════════════════════════════════════════════════
     SORT DROPDOWN
  ═══════════════════════════════════════════════════════════ */
  function karaToggleSortDropdown() {
    var dd = document.getElementById('sortDropdown');
    if (!dd) return;
    var isOpen = dd.classList.toggle('is-open');
    var btn = dd.querySelector('.sort-dropdown__btn');
    if (btn) btn.setAttribute('aria-expanded', String(isOpen));
  }

  function karaCloseSortDropdown() {
    var dd = document.getElementById('sortDropdown');
    if (!dd || !dd.classList.contains('is-open')) return;
    dd.classList.remove('is-open');
    var btn = dd.querySelector('.sort-dropdown__btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function karaSetSortOption(el) {
    var val = el.dataset.value;
    if (!val) return;
    var valEl = document.getElementById('sortVal');
    if (valEl) valEl.textContent = val;
    document.querySelectorAll('.sort-dropdown__item').forEach(function (i) {
      var active = i === el;
      i.classList.toggle('is-active', active);
      i.setAttribute('aria-selected', String(active));
    });
    karaCloseSortDropdown();
    toast('مرتب‌سازی: ' + val, 'info');

    /* ── WP: مقدار انتخاب‌شده را برای query ذخیره کنید ──
       مثال: Kara.shopState.sort = val;  karaApplyShopQuery(); */
  }

  /* ══════════════════════════════════════════════════════════
     CATEGORY TREE ACCORDION
  ═══════════════════════════════════════════════════════════ */
  function karaToggleCatTree(btn) {
    var parent = btn.closest('.cat-tree__parent');
    if (!parent) return;
    var isOpen = parent.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    parent.setAttribute('aria-expanded', String(isOpen));
  }

  function karaToggleShopAbout() {
    var el = document.getElementById('shopAbout');
    if (!el) return;
    var isOpen = el.classList.toggle('is-open');
    var btn = el.querySelector('[data-action="toggle-shop-about"]');
    if (btn) {
      btn.setAttribute('aria-expanded', String(isOpen));
      var span = btn.querySelector('span');
      if (span) span.textContent = isOpen ? 'بستن' : 'مشاهده بیشتر';
    }
  }

  /* ══════════════════════════════════════════════════════════
     PRICE RANGE  —  دو اسلایدر + دو باکس ورودی فارسی
     تبدیل ارقام فارسی/عربی ↔ انگلیسی و سینک دو طرفه.
  ═══════════════════════════════════════════════════════════ */
  function karaInitPriceRange() {
    var minInput = document.getElementById('priceMinInput');
    var maxInput = document.getElementById('priceMaxInput');
    var fill     = document.getElementById('priceRangeFill');
    var minVal   = document.getElementById('priceMinVal');
    var maxVal   = document.getElementById('priceMaxVal');
    if (!minInput || !maxInput) return;

    var MIN = parseInt(minInput.min, 10) || 0;
    var MAX = parseInt(minInput.max, 10) || 100000000;

    /* تبدیل ارقام فارسی/عربی به انگلیسی + حذف جداکننده */
    var toEn = function (s) {
      return String(s)
        .replace(/[۰-۹]/g, function (d) { return String.fromCharCode(d.charCodeAt(0) - 1728); })
        .replace(/[٠-٩]/g, function (d) { return String.fromCharCode(d.charCodeAt(0) - 1584); })
        .replace(/,|،/g, '');
    };

    /* نمایش فارسی */
    var fmt = function (v) { return Number(v).toLocaleString('fa-IR'); };

    function updateFill() {
      var lo = parseInt(minInput.value, 10) || MIN;
      var hi = parseInt(maxInput.value, 10) || MAX;
      var range = MAX - MIN || 1;
      var leftPct  = ((lo - MIN) / range) * 100;
      var rightPct = ((MAX - hi) / range) * 100;
      if (fill) {
        fill.style.left  = rightPct + '%';
        fill.style.right = leftPct  + '%';
      }
    }

    /* اسلایدر تغییر کرد → باکس‌ها را آپدیت کن */
    function onSliderInput() {
      if (minVal) minVal.value = fmt(minInput.value);
      if (maxVal) maxVal.value = fmt(maxInput.value);
      updateFill();
    }

    /* کاربر در حال تایپ است → فقط اسلایدر را sync کن، به باکس دست نزن */
    function onBoxInput(isMin) {
      var el  = isMin ? minVal : maxVal;
      var num = parseInt(toEn(el.value), 10) || 0;
      if (isMin) minInput.value = Math.max(MIN, Math.min(num, MAX));
      else       maxInput.value = Math.max(MIN, Math.min(num, MAX));
      updateFill();
    }

    /* کاربر فیلد را رها کرد → حالا فرمت کن */
    function onBoxBlur(isMin) {
      var el  = isMin ? minVal : maxVal;
      var num = parseInt(toEn(el.value), 10) || 0;
      el.value = fmt(num);
      if (isMin) minInput.value = Math.max(MIN, Math.min(num, MAX));
      else       maxInput.value = Math.max(MIN, Math.min(num, MAX));
      updateFill();
    }

    minInput.addEventListener('input', onSliderInput);
    maxInput.addEventListener('input', onSliderInput);

    if (minVal) {
      minVal.addEventListener('input', function () { onBoxInput(true); });
      minVal.addEventListener('blur',  function () { onBoxBlur(true); });
    }
    if (maxVal) {
      maxVal.addEventListener('input', function () { onBoxInput(false); });
      maxVal.addEventListener('blur',  function () { onBoxBlur(false); });
    }

    /* مقدار اولیه */
    if (minVal) minVal.value = fmt(minInput.value);
    if (maxVal) maxVal.value = fmt(maxInput.value);
    updateFill();
  }

  /* ══════════════════════════════════════════════════════════
     SHOP INIT  —  راه‌اندازی کلیک‌های data-action مخصوص shop
  ═══════════════════════════════════════════════════════════ */
  function karaInitShop() {
    /* کلیک‌های data-action مربوط به shop را delegate کن */
    document.addEventListener('click', function (e) {
      /* بستن sort dropdown هنگام کلیک بیرون از آن */
      if (!e.target.closest('#sortDropdown')) karaCloseSortDropdown();

      var el = e.target.closest('[data-action]');
      if (!el) return;
      var action = el.dataset.action;

      if (action === 'open-mobile-filters')  { karaOpenMobileFilters(); }
      if (action === 'close-mobile-filters') { karaCloseMobileFilters(); }
      if (action === 'remove-filter')        { karaRemoveFilter(el); }
      if (action === 'clear-filters')        { karaClearFilters(); }
      if (action === 'toggle-filter-group')  { karaToggleFilterGroup(el); }
      if (action === 'toggle-sort-dropdown') { karaToggleSortDropdown(); e.stopPropagation(); }
      if (action === 'set-sort-option')      { karaSetSortOption(el); }
      if (action === 'toggle-cat-tree')      { karaToggleCatTree(el); }
      if (action === 'toggle-shop-about')    { karaToggleShopAbout(); }
    });

    karaInitPriceRange();
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  +  compat aliases
  ═══════════════════════════════════════════════════════════ */
  Kara.openMobileFilters   = Kara.openMobileFilters   || karaOpenMobileFilters;
  Kara.closeMobileFilters  = Kara.closeMobileFilters  || karaCloseMobileFilters;
  Kara.toggleFilterGroup   = Kara.toggleFilterGroup   || karaToggleFilterGroup;
  Kara.removeFilter        = Kara.removeFilter        || karaRemoveFilter;
  Kara.clearFilters        = Kara.clearFilters        || karaClearFilters;
  Kara.toggleSortDropdown  = Kara.toggleSortDropdown  || karaToggleSortDropdown;
  Kara.closeSortDropdown   = Kara.closeSortDropdown   || karaCloseSortDropdown;
  Kara.setSortOption       = Kara.setSortOption       || karaSetSortOption;
  Kara.toggleCatTree       = Kara.toggleCatTree       || karaToggleCatTree;
  Kara.toggleShopAbout     = Kara.toggleShopAbout     || karaToggleShopAbout;
  Kara.initPriceRange      = Kara.initPriceRange      || karaInitPriceRange;
  Kara.initShop            = Kara.initShop            || karaInitShop;

  /* compat با کد قدیمی (global‌های نام‌دار) */
  if (!window.openMobileFilters)   window.openMobileFilters   = karaOpenMobileFilters;
  if (!window.closeMobileFilters)  window.closeMobileFilters  = karaCloseMobileFilters;
  if (!window.closeFilterSheet)    window.closeFilterSheet    = karaCloseMobileFilters;
  if (!window.toggleFilterGroup)   window.toggleFilterGroup   = karaToggleFilterGroup;
  if (!window.removeFilter)        window.removeFilter        = karaRemoveFilter;
  if (!window.clearFilters)        window.clearFilters        = karaClearFilters;
  if (!window.toggleSortDropdown)  window.toggleSortDropdown  = karaToggleSortDropdown;
  if (!window.closeSortDropdown)   window.closeSortDropdown   = karaCloseSortDropdown;
  if (!window.setSortOption)       window.setSortOption       = karaSetSortOption;
  if (!window.toggleCatTree)       window.toggleCatTree       = karaToggleCatTree;
  if (!window.toggleShopAbout)     window.toggleShopAbout     = karaToggleShopAbout;
  if (!window.initPriceRange)      window.initPriceRange      = karaInitPriceRange;

  document.addEventListener('DOMContentLoaded', karaInitShop);
})();
