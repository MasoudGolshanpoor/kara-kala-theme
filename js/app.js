/* ============================================================
   VELA  —  app.js  v5.0  (coordinator)
   State · Search Data · Panel Manager · Init
   Modules: ui.js · search.js · shop.js · product.js · cart.js
            header.js · mega-menu.js · mobile-nav.js
   ============================================================ */
'use strict';

/* ─── SHARED STATE ─── */
const state = {
  cartCount:     parseInt(localStorage.getItem('vela_cart')     || '3'),
  wishlistCount: parseInt(localStorage.getItem('vela_wishlist') || '0'),
  qty: 1,
  activePanel: null,   /* 'cat' | 'search' | 'filter' | null */
};

/* ─── SEARCH DATA ─── */
const SEARCH_DATA = [
  { name: 'هدفون بیسیم سونی WH-1000XM5',       cat: 'الکترونیک',  emoji: '🎧', price: '$۲۴۹' },
  { name: 'آیفون ۱۶ پرو ۲۵۶ گیگابایت',         cat: 'گوشی موبایل', emoji: '📱', price: '$۹۹۹' },
  { name: 'مک‌بوک ایر ۱۵ اینچ M3',              cat: 'لپتاپ',       emoji: '💻', price: '$۱,۲۹۹' },
  { name: 'سامسونگ گلکسی S24 اولترا',           cat: 'گوشی موبایل', emoji: '📱', price: '$۱,۲۹۹' },
  { name: 'نایک ایر مکس ۲۷۰',                  cat: 'کفش ورزشی',   emoji: '👟', price: '$۱۵۰' },
  { name: 'اپل واچ اولترا ۲',                   cat: 'ساعت هوشمند',  emoji: '⌚', price: '$۷۹۹' },
  { name: 'پلی‌استیشن ۵',                       cat: 'گیمینگ',       emoji: '🎮', price: '$۴۹۹' },
  { name: 'آیپد پرو ۱۳ اینچ M4',               cat: 'تبلت',         emoji: '📲', price: '$۱,۰۹۹' },
  { name: 'جاروبرقی دایسون V15',                cat: 'خانه',         emoji: '🧹', price: '$۷۴۹' },
  { name: 'ایرپاد پرو نسل دوم',                 cat: 'صوتی',         emoji: '🎵', price: '$۲۴۹' },
  { name: 'تلویزیون OLED ال‌جی ۶۵ اینچ',        cat: 'تلویزیون',     emoji: '📺', price: '$۱,۷۹۹' },
  { name: 'دوربین بدون آینه کانن EOS R50',      cat: 'دوربین',       emoji: '📷', price: '$۶۷۹' },
  { name: 'هدفون بوز QuietComfort 45',          cat: 'صوتی',         emoji: '🎧', price: '$۲۷۹' },
  { name: 'لپتاپ دل XPS 15',                   cat: 'لپتاپ',        emoji: '💻', price: '$۱,۸۹۹' },
];
const RECENT_SEARCHES = ['هدفون سونی', 'آیفون ۱۶', 'لپتاپ گیمینگ', 'ساعت هوشمند'];
const TRENDING = [
  { text: 'گوشی موبایل سامسونگ', hot: true  },
  { text: 'هدفون بیسیم',         hot: true  },
  { text: 'لپتاپ گیمینگ',        hot: false },
  { text: 'آیپد اپل',             hot: false },
  { text: 'دوربین عکاسی',         hot: false },
];

/* ──────────────────────────────────────────────────────────
   PANEL MANAGER — only one panel open at a time
────────────────────────────────────────────────────────── */
function openPanel(name) {
  if (state.activePanel && state.activePanel !== name) closePanel(state.activePanel);
  state.activePanel = name;
  setFabOpen(true);
}
function closePanel(name) {
  if (state.activePanel === name || !name) {
    state.activePanel = null;
    setFabOpen(false);
  }
}
function setFabOpen(isOpen) {
  const fab = document.getElementById('bottomFab');
  if (fab) fab.classList.toggle('is-open', isOpen);
}

/* ──────────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectGlobalAnimations();
  initHeader();
  initMegaMenu();
  initSearchModal();
  initBottomNav();
  initMobileDrawer();
  initCountdown();
  if (typeof initStickyCta === 'function') initStickyCta();
  if (typeof initPriceRange === 'function') initPriceRange();
  initPageTransitions();
  initScrollTopBtn();
  updateCartBadge();
  updateWishlistBadge();
  initProductActions();
  initAuthActions();
});
