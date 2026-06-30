/* ============================================================
   VELA — Cart · Wishlist · Checkout · Newsletter
   ============================================================ */
'use strict';

/* ══════════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════════ */
function addToCart(name, price) {
  state.cartCount++;
  localStorage.setItem('vela_cart', state.cartCount);
  updateCartBadge();
  showToast(`<strong>${name}</strong> به سبد خرید اضافه شد!`, 'success');
  document.querySelectorAll('#cartCount, .bottom-nav__badge').forEach(b => {
    b.style.transform = 'scale(1.5)';
    b.style.transition = 'transform 300ms cubic-bezier(.34,1.56,.64,1)';
    setTimeout(() => b.style.transform = 'scale(1)', 300);
  });
}

function updateCartBadge() {
  document.querySelectorAll('#cartCount, .bottom-nav__badge').forEach(el => {
    el.textContent = state.cartCount;
    el.style.display = state.cartCount > 0 ? 'flex' : 'none';
  });
}

/* ══════════════════════════════════════════════════════════
   WISHLIST
══════════════════════════════════════════════════════════ */
function toggleWishlist(btn) {
  btn.classList.toggle('active');
  const active = btn.classList.contains('active');
  state.wishlistCount = active
    ? state.wishlistCount + 1
    : Math.max(0, state.wishlistCount - 1);
  localStorage.setItem('vela_wishlist', state.wishlistCount);
  updateWishlistBadge();
  btn.style.transition = 'transform 300ms cubic-bezier(.34,1.56,.64,1)';
  btn.style.transform = 'scale(1.35)';
  setTimeout(() => btn.style.transform = '', 300);
  showToast(active ? 'به علاقه‌مندی‌ها اضافه شد ♡' : 'از علاقه‌مندی‌ها حذف شد', 'info');
}

function updateWishlistBadge() {
  document.querySelectorAll('#wishlistCount').forEach(el => {
    el.textContent = state.wishlistCount;
    el.style.display = state.wishlistCount > 0 ? 'flex' : 'none';
  });
}

function initProductActions() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    switch (el.dataset.action) {
      case 'add-to-cart':
        addToCart(el.dataset.name, Number(el.dataset.price));
        break;
      case 'toggle-wishlist':
        toggleWishlist(el);
        break;
      case 'close-cart':
        closeCartModal();
        break;
      case 'close-wishlist':
        closeWishlistModal();
        break;
      case 'mc-qty':
        changeMiniCartQty(el.dataset.id, Number(el.dataset.delta));
        break;
      case 'mc-remove':
        removeMiniCartItem(el.dataset.id);
        break;
      case 'wl-add-to-cart':
        addToCart(el.dataset.name, 0);
        closeWishlistModal();
        break;
      case 'wl-remove':
        removeMiniWishlistItem(el.dataset.id);
        break;
    }
  });
}

/* ══════════════════════════════════════════════════════════
   CART PAGE
══════════════════════════════════════════════════════════ */
const itemPrices = { 'cart-item-1': 249, 'cart-item-2': 150, 'cart-item-3': 899 };
const itemQtys   = { 'cart-item-1': 1,   'cart-item-2': 1,   'cart-item-3': 1   };

function changeQty(itemId, delta) {
  const n = itemId.split('-').pop();
  const qEl = document.getElementById('qty-' + n);
  if (!qEl) return;
  itemQtys[itemId] = Math.max(1, (itemQtys[itemId] || 1) + delta);
  qEl.textContent = itemQtys[itemId];
  qEl.style.transition = 'transform 150ms ease';
  qEl.style.transform = delta > 0 ? 'translateY(-3px)' : 'translateY(3px)';
  setTimeout(() => qEl.style.transform = '', 150);
  recalcCart();
}

function removeCartItem(id) {
  const item = document.getElementById(id);
  if (!item) return;
  item.style.transition = 'all 300ms ease';
  item.style.opacity = '0'; item.style.transform = 'translateX(-24px)';
  setTimeout(() => {
    item.remove(); delete itemPrices[id]; delete itemQtys[id]; recalcCart();
    state.cartCount = Math.max(0, state.cartCount - 1);
    localStorage.setItem('vela_cart', state.cartCount);
    updateCartBadge();
  }, 300);
  showToast('محصول از سبد حذف شد', 'info');
}

function recalcCart() {
  const sub = Object.keys(itemPrices).reduce((s, id) => s + itemPrices[id] * (itemQtys[id] || 1), 0);
  const tax = sub * .09;
  const total = sub + tax;
  const fmt = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('subtotal', fmt(sub)); set('tax', fmt(tax)); set('total', fmt(total));
}

function applyPromo() {
  const input = document.getElementById('promoInput');
  const msg   = document.getElementById('promoMsg');
  if (!input || !msg) return;
  const code = input.value.trim().toUpperCase();
  if (code === 'VELA20' || code === 'SAVE20') {
    msg.style.display = 'block';
    input.style.borderColor = 'var(--success)';
    input.disabled = true;
    showToast('کد تخفیف اعمال شد! ۲۰٪ تخفیف 🎉', 'success');
  } else if (!code) {
    showToast('لطفاً کد تخفیف را وارد کنید', 'error');
  } else {
    showToast(`کد "${code}" معتبر نیست`, 'error');
    input.style.borderColor = 'var(--danger)';
    input.style.animation = 'shake 300ms ease';
    setTimeout(() => { input.style.borderColor = ''; input.style.animation = ''; }, 400);
  }
}

function selectShipping(card, type) {
  document.querySelectorAll('.shipping-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  const costEl = document.getElementById('shippingCost');
  const prices = { free: 'رایگان', express: '$9.99', 'same-day': '$14.99' };
  if (costEl) {
    costEl.textContent = prices[type] || 'رایگان';
    costEl.style.color = type === 'free' ? 'var(--success)' : 'var(--n-800)';
  }
}

function selectPayment(option) {
  document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
  option.classList.add('selected');
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

/* ══════════════════════════════════════════════════════════
   CHECKOUT STEPS
══════════════════════════════════════════════════════════ */
function goToStep(step) {
  const names = { 1: 'cart', 2: 'shipping', 3: 'payment', 4: 'confirm' };
  document.querySelectorAll('.checkout-section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('section-' + names[step]);
  if (target) {
    target.classList.add('active');
    target.style.animation = 'fadeIn 250ms ease forwards';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.querySelectorAll('.checkout-step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i + 1 < step) el.classList.add('done');
    if (i + 1 === step) el.classList.add('active');
  });
  const titles = { 1: 'سبد خرید', 2: 'اطلاعات ارسال', 3: 'پرداخت', 4: 'سفارش ثبت شد' };
  const h1 = document.querySelector('.checkout-header h1');
  if (h1) {
    h1.style.transition = 'opacity 150ms ease'; h1.style.opacity = '0';
    setTimeout(() => { h1.textContent = titles[step]; h1.style.opacity = '1'; }, 150);
  }
}

function placeOrder() {
  const btn = document.getElementById('placeOrderBtn');
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 600ms linear infinite">⟳</span> در حال پردازش…';
  btn.style.opacity = '.8';
  setTimeout(() => {
    goToStep(4);
    state.cartCount = 0;
    localStorage.setItem('vela_cart', '0');
    updateCartBadge();
    showToast('سفارش با موفقیت ثبت شد! 🎉', 'success');
    btn.disabled = false; btn.innerHTML = 'ثبت سفارش'; btn.style.opacity = '';
  }, 1800);
}

/* ══════════════════════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════════════════════ */
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const btn   = e.target.querySelector('button');
  if (!input?.value.trim()) { showToast('لطفاً ایمیل خود را وارد کنید', 'error'); return; }
  btn.textContent = '✓ عضو شدید!';
  btn.style.background = 'var(--success)'; btn.style.color = 'white';
  input.value = ''; input.disabled = true;
  showToast('خوش آمدید! ۱۵٪ تخفیف به ایمیل شما ارسال شد 🎁', 'success');
  setTimeout(() => {
    btn.textContent = 'عضویت رایگان';
    btn.style.background = btn.style.color = '';
    input.disabled = false;
  }, 4000);
}

/* ══════════════════════════════════════════════════════════
   MINI CART MODAL
══════════════════════════════════════════════════════════ */
const CART_DEMO_ITEMS = [
  { id: 'mc1', emoji: '🎧', brand: 'Sony',  name: 'هدفون بیسیم WH-1000XM5', variant: 'رنگ: مشکی', price: '$249', qty: 1 },
  { id: 'mc2', emoji: '👟', brand: 'Nike',  name: 'نایک ایر مکس ۲۷۰',        variant: 'سایز: ۴۲',  price: '$150', qty: 1 },
  { id: 'mc3', emoji: '📱', brand: 'Apple', name: 'آیفون ۱۶ پرو ۲۵۶ گیگ',   variant: 'رنگ: تیتانیوم', price: '$899', qty: 1 },
];

function openCartModal() {
  _renderMiniCart();
  const panel = document.getElementById('miniCart');
  if (!panel) return;
  panel.removeAttribute('aria-hidden');
  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => panel.querySelector('.mini-panel__close')?.focus(), 50);
}
function closeCartModal() {
  const panel = document.getElementById('miniCart');
  if (!panel) return;
  if (panel.contains(document.activeElement)) document.activeElement.blur();
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function _renderMiniCart() {
  const body    = document.getElementById('miniCartBody');
  const countEl = document.getElementById('miniCartCount');
  const totalEl = document.getElementById('miniCartTotal');
  if (!body) return;

  const visible = CART_DEMO_ITEMS.slice(0, Math.min(state.cartCount, CART_DEMO_ITEMS.length));

  if (!visible.length) {
    body.innerHTML = `
      <div class="mini-panel__empty">
        <span class="mini-panel__empty-icon">🛒</span>
        <p class="mini-panel__empty-title">سبد خرید خالی است</p>
        <p class="mini-panel__empty-sub">محصول مورد نظر خود را پیدا کرده و اضافه کنید</p>
        <a href="shop.html" class="btn btn--primary btn--sm" data-action="close-cart">شروع خرید</a>
      </div>`;
    if (countEl) countEl.textContent = '۰ محصول';
    if (totalEl) totalEl.textContent = '$0';
    return;
  }

  body.innerHTML = visible.map(it => `
    <div class="mini-item" id="mc-row-${it.id}">
      <div class="mini-item__img">${it.emoji}</div>
      <div class="mini-item__info">
        <div class="mini-item__brand">${it.brand}</div>
        <div class="mini-item__name">${it.name}</div>
        <div class="mini-item__variant">${it.variant}</div>
        <div class="mini-qty">
          <button class="mini-qty__btn" data-action="mc-qty" data-id="${it.id}" data-delta="-1">−</button>
          <span class="mini-qty__val" id="mc-qty-${it.id}">${it.qty}</span>
          <button class="mini-qty__btn" data-action="mc-qty" data-id="${it.id}" data-delta="1">+</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <button class="mini-item__remove" data-action="mc-remove" data-id="${it.id}" aria-label="حذف">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
        <span class="mini-item__price">${it.price}</span>
      </div>
    </div>`).join('');

  const total = visible.reduce((s, it) => s + parseInt(it.price.replace(/\D/g, '')), 0);
  if (countEl) countEl.textContent = visible.length + ' محصول';
  if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
}

function changeMiniCartQty(id, delta) {
  const el = document.getElementById('mc-qty-' + id);
  if (!el) return;
  el.textContent = Math.max(1, (parseInt(el.textContent) || 1) + delta);
}

function removeMiniCartItem(id) {
  const row = document.getElementById('mc-row-' + id);
  if (!row) return;
  row.style.transition = 'all 240ms ease';
  row.style.opacity = '0';
  row.style.transform = 'translateX(20px)';
  setTimeout(() => {
    row.remove();
    state.cartCount = Math.max(0, state.cartCount - 1);
    localStorage.setItem('vela_cart', state.cartCount);
    updateCartBadge();
    const countEl = document.getElementById('miniCartCount');
    if (countEl) countEl.textContent = state.cartCount + ' محصول';
    if (!state.cartCount) _renderMiniCart();
  }, 240);
  showToast('محصول از سبد حذف شد', 'info');
}

/* ══════════════════════════════════════════════════════════
   MINI WISHLIST MODAL
══════════════════════════════════════════════════════════ */
const WISHLIST_DEMO_ITEMS = [
  { id: 'wl1', emoji: '💻', brand: 'Apple', name: 'مک‌بوک ایر ۱۵ اینچ M3', variant: 'رنگ: نقره‌ای', price: '$1,299', old: '$1,499' },
  { id: 'wl2', emoji: '⌚', brand: 'Apple', name: 'اپل واچ اولترا ۲',        variant: 'سایز: ۴۹mm',  price: '$799',   old: '' },
  { id: 'wl3', emoji: '🎮', brand: 'Sony',  name: 'پلی‌استیشن ۵',            variant: '',              price: '$499',   old: '$549' },
];

function openWishlistModal() {
  _renderMiniWishlist();
  const panel = document.getElementById('miniWishlist');
  if (!panel) return;
  panel.removeAttribute('aria-hidden');
  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => panel.querySelector('.mini-panel__close')?.focus(), 50);
}
function closeWishlistModal() {
  const panel = document.getElementById('miniWishlist');
  if (!panel) return;
  if (panel.contains(document.activeElement)) document.activeElement.blur();
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function _renderMiniWishlist() {
  const body    = document.getElementById('miniWishlistBody');
  const countEl = document.getElementById('miniWishlistCount');
  if (!body) return;

  const visible = WISHLIST_DEMO_ITEMS.slice(0, Math.min(state.wishlistCount, WISHLIST_DEMO_ITEMS.length));

  if (!visible.length) {
    body.innerHTML = `
      <div class="mini-panel__empty">
        <span class="mini-panel__empty-icon">🤍</span>
        <p class="mini-panel__empty-title">علاقه‌مندی‌ها خالی است</p>
        <p class="mini-panel__empty-sub">محصولات موردعلاقه‌تان را ذخیره کنید تا بعداً راحت پیدا کنید</p>
        <a href="shop.html" class="btn btn--primary btn--sm" data-action="close-wishlist">مشاهده محصولات</a>
      </div>`;
    if (countEl) countEl.textContent = '۰ محصول';
    return;
  }

  body.innerHTML = visible.map(it => `
    <div class="mini-item" id="wl-row-${it.id}">
      <div class="mini-item__img">${it.emoji}</div>
      <div class="mini-item__info">
        <div class="mini-item__brand">${it.brand}</div>
        <div class="mini-item__name">${it.name}</div>
        ${it.variant ? `<div class="mini-item__variant">${it.variant}</div>` : ''}
        <div>
          <span class="mini-item__price">${it.price}</span>
          ${it.old ? `<span class="mini-item__original">${it.old}</span>` : ''}
        </div>
        <button class="mini-item__add-btn" data-action="wl-add-to-cart" data-name="${it.name}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          افزودن به سبد
        </button>
      </div>
      <button class="mini-item__remove" data-action="wl-remove" data-id="${it.id}" aria-label="حذف">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>`).join('');

  if (countEl) countEl.textContent = visible.length + ' محصول';
}

function removeMiniWishlistItem(id) {
  const row = document.getElementById('wl-row-' + id);
  if (!row) return;
  row.style.transition = 'all 240ms ease';
  row.style.opacity = '0';
  row.style.transform = 'translateX(20px)';
  setTimeout(() => {
    row.remove();
    state.wishlistCount = Math.max(0, state.wishlistCount - 1);
    localStorage.setItem('vela_wishlist', state.wishlistCount);
    updateWishlistBadge();
    const countEl = document.getElementById('miniWishlistCount');
    if (countEl) countEl.textContent = state.wishlistCount + ' محصول';
    if (!state.wishlistCount) _renderMiniWishlist();
  }, 240);
  showToast('از علاقه‌مندی‌ها حذف شد', 'info');
}
