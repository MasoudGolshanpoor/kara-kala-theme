/* ============================================================
   VELA — Search Modal Module  (kara-search.js)
   مستقل · بدون coordinator
   شامل: Search modal open/close · Live results · Recent/trending
   ============================================================
   وابستگی‌ها (همه از طریق namespace با fallback):
     - Kara.openPanel / Kara.closePanel / Kara.showToast  (kara-ui.js)
   ────────────────────────────────────────────────────────────
   ⚠️  بخش‌های WordPress / AJAX:
     - SEARCH_DATA / RECENT_SEARCHES / TRENDING فعلاً demo هستند.
       در وردپرس این‌ها را از سرور بیاورید:
         · نتایج زنده → admin-ajax.php?action=kara_live_search  (WP_Comment_Query یا WP_REST)
         · جستجوهای اخیر → localStorage کلاینت یا user meta
         · پرجستجوها → wp_options یا آمار سرچ سایت
     - تابع karaSearchServer نمونه‌ای است برای جایگزینی renderSearchResults.
   ============================================================ */
(function () {
  'use strict';

  var Kara = (window.Kara = window.Kara || {});

  /* ══════════════════════════════════════════════════════════
     SEARCH DATA  —  دمو. در وردپرس از سرور REPLACE شود.
  ═══════════════════════════════════════════════════════════ */
  var SEARCH_DATA = [
    { name: 'هدفون بیسیم سونی WH-1000XM5',       cat: 'الکترونیک',   emoji: '🎧', price: '$۲۴۹' },
    { name: 'آیفون ۱۶ پرو ۲۵۶ گیگابایت',         cat: 'گوشی موبایل', emoji: '📱', price: '$۹۹۹' },
    { name: 'مک‌بوک ایر ۱۵ اینچ M3',              cat: 'لپتاپ',       emoji: '💻', price: '$۱,۲۹۹' },
    { name: 'سامسونگ گلکسی S24 اولترا',           cat: 'گوشی موبایل', emoji: '📱', price: '$۱,۲۹۹' },
    { name: 'نایک ایر مکس ۲۷۰',                  cat: 'کفش ورزشی',   emoji: '👟', price: '$۱۵۰' },
    { name: 'اپل واچ اولترا ۲',                   cat: 'ساعت هوشمند', emoji: '⌚', price: '$۷۹۹' },
    { name: 'پلی‌استیشن ۵',                       cat: 'گیمینگ',       emoji: '🎮', price: '$۴۹۹' },
    { name: 'آیپد پرو ۱۳ اینچ M4',               cat: 'تبلت',         emoji: '📲', price: '$۱,۰۹۹' },
    { name: 'جاروبرقی دایسون V15',                cat: 'خانه',         emoji: '🧹', price: '$۷۴۹' },
    { name: 'ایرپاد پرو نسل دوم',                 cat: 'صوتی',         emoji: '🎵', price: '$۲۴۹' },
    { name: 'تلویزیون OLED ال‌جی ۶۵ اینچ',        cat: 'تلویزیون',     emoji: '📺', price: '$۱,۷۹۹' },
    { name: 'دوربین بدون آینه کانن EOS R50',      cat: 'دوربین',       emoji: '📷', price: '$۶۷۹' },
    { name: 'هدفون بوز QuietComfort 45',          cat: 'صوتی',         emoji: '🎧', price: '$۲۷۹' },
    { name: 'لپتاپ دل XPS 15',                   cat: 'لپتاپ',        emoji: '💻', price: '$۱,۸۹۹' },
  ];
  var RECENT_SEARCHES = ['هدفون سونی', 'آیفون ۱۶', 'لپتاپ گیمینگ', 'ساعت هوشمند'];
  var TRENDING = [
    { text: 'گوشی موبایل سامسونگ', hot: true  },
    { text: 'هدفون بیسیم',         hot: true  },
    { text: 'لپتاپ گیمینگ',        hot: false },
    { text: 'آیپد اپل',             hot: false },
    { text: 'دوربین عکاسی',         hot: false },
  ];

  /* ══════════════════════════════════════════════════════════
     SEARCH MODAL  —  راه‌اندازی event ها
  ═══════════════════════════════════════════════════════════ */
  function karaInitSearchModal() {
    var input     = document.getElementById('searchModalInput');
    var clearBtn  = document.getElementById('searchModalClear');
    var cancelBtn = document.getElementById('searchModalCancel');
    var backdrop  = document.getElementById('searchModalBackdrop');
    if (!input) return;

    karaRenderSearchDefault();

    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearBtn && clearBtn.classList.toggle('visible', q.length > 0);
      q.length >= 1 ? karaRenderSearchResults(q) : karaRenderSearchDefault();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') karaCloseSearchModal();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        clearBtn.classList.remove('visible');
        karaRenderSearchDefault();
        input.focus();
      });
    }

    if (cancelBtn) cancelBtn.addEventListener('click', karaCloseSearchModal);
    if (backdrop)  backdrop.addEventListener('click', karaCloseSearchModal);
  }

  function karaOpenSearchModal() {
    if (typeof Kara.openPanel === 'function') Kara.openPanel('search');
    var m = document.getElementById('searchModal');
    if (m) m.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var i = document.getElementById('searchModalInput');
      if (i) i.focus();
    }, 300);
  }

  function karaCloseSearchModal() {
    if (typeof Kara.closePanel === 'function') Kara.closePanel('search');
    var m = document.getElementById('searchModal');
    if (m) m.classList.remove('open');
    document.body.style.overflow = '';
  }

  function karaRenderSearchDefault() {
    var body = document.getElementById('searchModalBody');
    if (!body) return;
    body.innerHTML =
      '<p class="search-section-title">جستجوهای اخیر</p>' +
      '<div class="search-chips">' +
        RECENT_SEARCHES.map(function (s) {
          return '<button class="search-chip" onclick="karaFillSearch(\'' + s + '\')">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>' +
            s + '</button>';
        }).join('') +
      '</div>' +
      '<p class="search-section-title">پرجستجوها</p>' +
      '<div class="search-trending">' +
        TRENDING.map(function (t, i) {
          return '<div class="search-trending__item" onclick="karaFillSearch(\'' + t.text + '\')">' +
            '<span class="search-trending__rank' + (t.hot ? ' search-trending__rank--hot' : '') + '">' + (i + 1) + '</span>' +
            '<span class="search-trending__text">' + t.text + '</span>' +
            (t.hot ? '<span>🔥</span>' : '') +
          '</div>';
        }).join('') +
      '</div>';
  }

  function karaRenderSearchResults(query) {
    var body = document.getElementById('searchModalBody');
    if (!body) return;
    var q = query.toLowerCase();
    var matches = SEARCH_DATA.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 || p.cat.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 8);

    if (!matches.length) {
      body.innerHTML =
        '<div class="search-no-results">' +
          '<div style="font-size:2.5rem;margin-bottom:var(--s-3)">🔍</div>' +
          '<p>نتیجه‌ای برای <strong>"' + query + '"</strong> یافت نشد</p>' +
        '</div>';
      return;
    }

    var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    var hi  = function (t) { return t.replace(new RegExp(esc(query), 'gi'), function (m) { return '<mark>' + m + '</mark>'; }); };

    body.innerHTML =
      '<p class="search-section-title">' + matches.length + ' نتیجه</p>' +
      '<div class="search-results">' +
        matches.map(function (p) {
          return '<a href="product.html" class="search-result-item">' +
            '<div class="search-result-item__thumb">' + p.emoji + '</div>' +
            '<div class="search-result-item__info">' +
              '<div class="search-result-item__name">' + hi(p.name) + '</div>' +
              '<div class="search-result-item__cat">' + p.cat + '</div>' +
            '</div>' +
            '<div class="search-result-item__price">' + p.price + '</div>' +
          '</a>';
        }).join('') +
      '</div>' +
      '<button class="search-all-btn" onclick="Kara.showToast(\'در حال جستجو…\',\'info\')">' +
        'مشاهده همه نتایج «' + query + '»' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
      '</button>';
  }

  function karaFillSearch(text) {
    var input    = document.getElementById('searchModalInput');
    var clearBtn = document.getElementById('searchModalClear');
    if (!input) return;
    input.value = text;
    clearBtn && clearBtn.classList.add('visible');
    karaRenderSearchResults(text);
    input.focus();
  }

  /* ══════════════════════════════════════════════════════════
     WordPress / AJAX  —  نمونه‌ی سرچ از سرور (اختیاری)
     برای فعال‌سازی، در karaInitSearchModal به جای karaRenderSearchResults
     از karaSearchServer استفاده کنید و یک endpoint با wp_ajax تعریف کنید.
  ═══════════════════════════════════════════════════════════ */
  function karaSearchServer(query) {
    /* var ajaxUrl = Kara.ajaxUrl || '/wp-admin/admin-ajax.php';
    fetch(ajaxUrl + '?action=kara_live_search&q=' + encodeURIComponent(query))
      .then(function (r) { return r.json(); })
      .then(function (items) { ...render... }); */
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  +  compat aliases
  ═══════════════════════════════════════════════════════════ */
  Kara.initSearchModal  = Kara.initSearchModal  || karaInitSearchModal;
  Kara.openSearchModal  = Kara.openSearchModal  || karaOpenSearchModal;
  Kara.closeSearchModal = Kara.closeSearchModal || karaCloseSearchModal;
  Kara.fillSearch       = Kara.fillSearch       || karaFillSearch;

  /* compat با کد قدیمی + global‌های موردنیاز برای inline HTML */
  if (!window.initSearchModal)  window.initSearchModal  = karaInitSearchModal;
  if (!window.openSearchModal)  window.openSearchModal  = karaOpenSearchModal;
  if (!window.closeSearchModal) window.closeSearchModal = karaCloseSearchModal;
  /* karaFillSearch به‌خاطر inline onclick در دمو روی window لازم است */
  if (!window.karaFillSearch)   window.karaFillSearch   = karaFillSearch;
  /* alias قدیمی fillSearch */
  if (!window.fillSearch)       window.fillSearch       = karaFillSearch;

  document.addEventListener('DOMContentLoaded', karaInitSearchModal);
})();
