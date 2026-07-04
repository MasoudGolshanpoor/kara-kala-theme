/* ============================================================
   VELA — Cart · Wishlist · Checkout · Newsletter  (kara-cart.js)
   مستقل · بدون coordinator
   شامل: Add to cart · Wishlist toggle · Cart/Wishlist badges
          · Cart page (qty, remove, promo, totals)
          · Checkout steps · Newsletter
          · Mini cart modal · Mini wishlist modal
   ============================================================
   وابستگی‌ها (همه از طریق namespace با fallback):
     - Kara.state          (از kara-ui.js) — شمارش‌ها
     - Kara.showToast      (از kara-ui.js) — پیام‌ها
   ────────────────────────────────────────────────────────────
   ⚠️  بخش‌های WordPress / WooCommerce (مهم):
     - addToCart: فعلاً فقط شمارنده را زیاد می‌کند. در وردپرس باید
       به WooCommerce AJAX وصل شود:
           jQuery.post( wc_add_to_cart_params.ajax_url, {
             action: 'woocommerce_ajax_add_to_cart',
             product_id, quantity, variation_id
           }, function(res){ ….fragments برای آپدیت mini-cart });
       یا معادل fetch آن با nonce.
     - Mini cart: در وردپرس محتوای آن از widget «Mini Cart» یا
       AJAX فرگمنت‌ها می‌آید — render دستی (_renderMiniCart) حذف شود.
     - removeMiniCartItem / changeMiniCartQty →
       woocommerce ajax remove_from_cart / update_cart.
     - placeOrder → فرایند واقعی Checkout/Payment گیت‌وی.
     - handleNewsletterSubmit → Mailchimp/افزونه خبرنامه.
     - promo code → Coupon API ووکامرس (apply_coupon).
   ============================================================ */
(function () {
  'use strict';

  var Kara = (window.Kara = window.Kara || {});

  /* در صورت نبود kara-ui.js، state و showToast حداقلی بساز */
  Kara.state = Kara.state || {
    cartCount:     parseInt(localStorage.getItem('kara_cart')     || '3', 10),
    wishlistCount: parseInt(localStorage.getItem('kara_wishlist') || '0', 10),
  };
  var toast = function (msg, type) {
    if (typeof Kara.showToast === 'function') Kara.showToast(msg, type);
  };

  /* ══════════════════════════════════════════════════════════
     ADD TO CART  +  BADGES
  ═══════════════════════════════════════════════════════════ */
  function karaAddToCart(name, price) {
    Kara.state.cartCount = (Kara.state.cartCount || 0) + 1;
    localStorage.setItem('kara_cart', Kara.state.cartCount);
    karaUpdateCartBadge();
    toast('<strong>' + name + '</strong> به سبد خرید اضافه شد!', 'success');

    document.querySelectorAll('#cartCount, .bottom-nav__badge').forEach(function (b) {
      b.style.transform = 'scale(1.5)';
      b.style.transition = 'transform 300ms cubic-bezier(.34,1.56,.64,1)';
      setTimeout(function () { b.style.transform = 'scale(1)'; }, 300);
    });

    /* ── WP/WooCommerce: افزودن واقعی به سبد ──
       fetch(woocommerce_params.ajax_url, { method:'POST', body: new URLSearchParams({
         action:'woocommerce_ajax_add_to_cart', product_id, quantity
       })}).then(… refresh mini-cart via fragments); */
  }

  function karaUpdateCartBadge() {
    document.querySelectorAll('#cartCount, .bottom-nav__badge').forEach(function (el) {
      el.textContent = Kara.state.cartCount;
      el.style.display = Kara.state.cartCount > 0 ? 'flex' : 'none';
    });
  }

  /* ══════════════════════════════════════════════════════════
     WISHLIST
  ═══════════════════════════════════════════════════════════ */
  function karaToggleWishlist(btn) {
    btn.classList.toggle('active');
    var active = btn.classList.contains('active');
    Kara.state.wishlistCount = active
      ? Kara.state.wishlistCount + 1
      : Math.max(0, Kara.state.wishlistCount - 1);
    localStorage.setItem('kara_wishlist', Kara.state.wishlistCount);
    karaUpdateWishlistBadge();
    btn.style.transition = 'transform 300ms cubic-bezier(.34,1.56,.64,1)';
    btn.style.transform = 'scale(1.35)';
    setTimeout(function () { btn.style.transform = ''; }, 300);
    toast(active ? 'به علاقه‌مندی‌ها اضافه شد ♡' : 'از علاقه‌مندی‌ها حذف شد', 'info');

    /* ── WP: افزودن/حذف از wishlist (YITH WC Wishlist یا user meta) ── */
  }

  function karaUpdateWishlistBadge() {
    document.querySelectorAll('#wishlistCount').forEach(function (el) {
      el.textContent = Kara.state.wishlistCount;
      el.style.display = Kara.state.wishlistCount > 0 ? 'flex' : 'none';
    });
  }

  /* ══════════════════════════════════════════════════════════
     PRODUCT ACTIONS  —  delegate کلیک [data-action] سبد/علاقه‌مندی
  ═══════════════════════════════════════════════════════════ */
  function karaInitProductActions() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action]');
      if (!el) return;
      switch (el.dataset.action) {
        case 'add-to-cart':
          karaAddToCart(el.dataset.name, Number(el.dataset.price));
          break;
        case 'toggle-wishlist':
          karaToggleWishlist(el);
          break;
        case 'close-cart':
          karaCloseCartModal();
          break;
        case 'close-wishlist':
          karaCloseWishlistModal();
          break;
        case 'mc-qty':
          karaChangeMiniCartQty(el.dataset.id, Number(el.dataset.delta));
          break;
        case 'mc-remove':
          karaRemoveMiniCartItem(el.dataset.id);
          break;
        case 'wl-add-to-cart':
          karaAddToCart(el.dataset.name, 0);
          karaCloseWishlistModal();
          break;
        case 'wl-remove':
          karaRemoveMiniWishlistItem(el.dataset.id);
          break;
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     CART PAGE  —  qty/remove/recalc/promo/shipping/payment/card
     این توابع فقط روی cart.html دمو کار می‌کنند. در وردپرس کل
     صفحه‌ی سبد را WooCommerce رندر می‌کند و این بخش‌ها حذف می‌شوند.
  ═══════════════════════════════════════════════════════════ */
  var itemPrices = { 'cart-item-1': 249, 'cart-item-2': 150, 'cart-item-3': 899 };
  var itemQtys   = { 'cart-item-1': 1,   'cart-item-2': 1,   'cart-item-3': 1   };

  function karaChangeQty(itemId, delta) {
    var n = itemId.split('-').pop();
    var qEl = document.getElementById('qty-' + n);
    if (!qEl) return;
    itemQtys[itemId] = Math.max(1, (itemQtys[itemId] || 1) + delta);
    qEl.textContent = itemQtys[itemId];
    qEl.style.transition = 'transform 150ms ease';
    qEl.style.transform = delta > 0 ? 'translateY(-3px)' : 'translateY(3px)';
    setTimeout(function () { qEl.style.transform = ''; }, 150);
    karaRecalcCart();
  }

  function karaRemoveCartItem(id) {
    var item = document.getElementById(id);
    if (!item) return;
    item.style.transition = 'all 300ms ease';
    item.style.opacity = '0';
    item.style.transform = 'translateX(-24px)';
    setTimeout(function () {
      item.remove();
      delete itemPrices[id];
      delete itemQtys[id];
      karaRecalcCart();
      Kara.state.cartCount = Math.max(0, Kara.state.cartCount - 1);
      localStorage.setItem('kara_cart', Kara.state.cartCount);
      karaUpdateCartBadge();
    }, 300);
    toast('محصول از سبد حذف شد', 'info');
  }

  function karaRecalcCart() {
    var sub = Object.keys(itemPrices).reduce(function (s, id) {
      return s + itemPrices[id] * (itemQtys[id] || 1);
    }, 0);
    var tax = sub * 0.09;
    var total = sub + tax;
    var fmt = function (n) {
      return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    var set = function (id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    set('subtotal', fmt(sub));
    set('tax', fmt(tax));
    set('total', fmt(total));
  }

  function karaApplyPromo() {
    var input = document.getElementById('promoInput');
    var msg   = document.getElementById('promoMsg');
    if (!input || !msg) return;
    var code = input.value.trim().toUpperCase();
    if (code === 'VELA20' || code === 'SAVE20') {
      msg.style.display = 'block';
      input.style.borderColor = 'var(--success)';
      input.disabled = true;
      toast('کد تخفیف اعمال شد! ۲۰٪ تخفیف 🎉', 'success');
      /* ── WP: WooCommerce apply_coupon(code) ── */
    } else if (!code) {
      toast('لطفاً کد تخفیف را وارد کنید', 'error');
    } else {
      toast('کد "' + code + '" معتبر نیست', 'error');
      input.style.borderColor = 'var(--danger)';
      input.style.animation = 'shake 300ms ease';
      setTimeout(function () { input.style.borderColor = ''; input.style.animation = ''; }, 400);
    }
  }

  function karaSelectShipping(card, type) {
    document.querySelectorAll('.shipping-card').forEach(function (c) {
      c.classList.remove('selected');
    });
    card.classList.add('selected');
    var costEl = document.getElementById('shippingCost');
    var prices = { free: 'رایگان', express: '$9.99', 'same-day': '$14.99' };
    if (costEl) {
      costEl.textContent = prices[type] || 'رایگان';
      costEl.style.color = type === 'free' ? 'var(--success)' : 'var(--n-800)';
    }
  }

  function karaSelectPayment(option) {
    document.querySelectorAll('.payment-option').forEach(function (o) {
      o.classList.remove('selected');
    });
    option.classList.add('selected');
  }

  function karaFormatCard(input) {
    var v = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
  }

  /* ══════════════════════════════════════════════════════════
     CHECKOUT STEPS  (دموی چندمرحله‌ای)
     در وردپرس با صفحه‌ی Checkout ووکامرس جایگزین می‌شود.
  ═══════════════════════════════════════════════════════════ */
  function karaGoToStep(step) {
    var names = { 1: 'cart', 2: 'shipping', 3: 'payment', 4: 'confirm' };
    document.querySelectorAll('.checkout-section').forEach(function (s) {
      s.classList.remove('active');
    });
    var target = document.getElementById('section-' + names[step]);
    if (target) {
      target.classList.add('active');
      target.style.animation = 'fadeIn 250ms ease forwards';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.querySelectorAll('.checkout-step').forEach(function (el, i) {
      el.classList.remove('active', 'done');
      if (i + 1 < step) el.classList.add('done');
      if (i + 1 === step) el.classList.add('active');
    });
    var titles = { 1: 'سبد خرید', 2: 'اطلاعات ارسال', 3: 'پرداخت', 4: 'سفارش ثبت شد' };
    var h1 = document.querySelector('.checkout-header h1');
    if (h1) {
      h1.style.transition = 'opacity 150ms ease';
      h1.style.opacity = '0';
      setTimeout(function () { h1.textContent = titles[step]; h1.style.opacity = '1'; }, 150);
    }
  }

  function karaPlaceOrder() {
    var btn = document.getElementById('placeOrderBtn');
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-block;animation:spin 600ms linear infinite">⟳</span> در حال پردازش…';
    btn.style.opacity = '.8';
    setTimeout(function () {
      karaGoToStep(4);
      Kara.state.cartCount = 0;
      localStorage.setItem('kara_cart', '0');
      karaUpdateCartBadge();
      toast('سفارش با موفقیت ثبت شد! 🎉', 'success');
      btn.disabled = false;
      btn.innerHTML = 'ثبت سفارش';
      btn.style.opacity = '';
    }, 1800);
  }

  /* ══════════════════════════════════════════════════════════
     NEWSLETTER  —  فرم عضویت در خبرنامه
  ═══════════════════════════════════════════════════════════ */
  function karaHandleNewsletterSubmit(e) {
    e.preventDefault();
    var input = e.target.querySelector('input');
    var btn   = e.target.querySelector('button');
    if (!input || !input.value.trim()) { toast('لطفاً ایمیل خود را وارد کنید', 'error'); return; }
    btn.textContent = '✓ عضو شدید!';
    btn.style.background = 'var(--success)';
    btn.style.color = 'white';
    input.value = '';
    input.disabled = true;
    toast('خوش آمدید! ۱۵٪ تخفیف به ایمیل شما ارسال شد 🎁', 'success');
    setTimeout(function () {
      btn.textContent = 'عضویت رایگان';
      btn.style.background = btn.style.color = '';
      input.disabled = false;
    }, 4000);

    /* ── WP: ارسال به Mailchimp / افزونه خبرنامه ──
       fetch(Kara.ajaxUrl, { method:'POST', body: new URLSearchParams({
         action:'kara_newsletter_subscribe', email: input.value })}); */
  }

  /* ══════════════════════════════════════════════════════════
     MINI CART MODAL  (دمو)
     در وردپرس محتوای mini-cart از AJAX fragments می‌آید.
  ═══════════════════════════════════════════════════════════ */
  var CART_DEMO_ITEMS = [
    { id: 'mc1', emoji: '🎧', brand: 'Sony',  name: 'هدفون بیسیم WH-1000XM5', variant: 'رنگ: مشکی', price: '$249', qty: 1 },
    { id: 'mc2', emoji: '👟', brand: 'Nike',  name: 'نایک ایر مکس ۲۷۰',        variant: 'سایز: ۴۲',  price: '$150', qty: 1 },
    { id: 'mc3', emoji: '📱', brand: 'Apple', name: 'آیفون ۱۶ پرو ۲۵۶ گیگ',   variant: 'رنگ: تیتانیوم', price: '$899', qty: 1 },
  ];

  function karaOpenCartModal() {
    _karaRenderMiniCart();
    var panel = document.getElementById('miniCart');
    if (!panel) return;
    panel.removeAttribute('aria-hidden');
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var closeBtn = panel.querySelector('.mini-panel__close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function karaCloseCartModal() {
    var panel = document.getElementById('miniCart');
    if (!panel) return;
    if (panel.contains(document.activeElement)) document.activeElement.blur();
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function _karaRenderMiniCart() {
    var body    = document.getElementById('miniCartBody');
    var countEl = document.getElementById('miniCartCount');
    var totalEl = document.getElementById('miniCartTotal');
    if (!body) return;

    var visible = CART_DEMO_ITEMS.slice(0, Math.min(Kara.state.cartCount, CART_DEMO_ITEMS.length));

    if (!visible.length) {
      body.innerHTML =
        '<div class="mini-panel__empty">' +
          '<span class="mini-panel__empty-icon">🛒</span>' +
          '<p class="mini-panel__empty-title">سبد خرید خالی است</p>' +
          '<p class="mini-panel__empty-sub">محصول مورد نظر خود را پیدا کرده و اضافه کنید</p>' +
          '<a href="shop.html" class="btn btn--primary btn--sm" data-action="close-cart">شروع خرید</a>' +
        '</div>';
      if (countEl) countEl.textContent = '۰ محصول';
      if (totalEl) totalEl.textContent = '$0';
      return;
    }

    body.innerHTML = visible.map(function (it) {
      return '<div class="mini-item" id="mc-row-' + it.id + '">' +
        '<div class="mini-item__img">' + it.emoji + '</div>' +
        '<div class="mini-item__info">' +
          '<div class="mini-item__brand">' + it.brand + '</div>' +
          '<div class="mini-item__name">' + it.name + '</div>' +
          '<div class="mini-item__variant">' + it.variant + '</div>' +
          '<div class="mini-qty">' +
            '<button class="mini-qty__btn" data-action="mc-qty" data-id="' + it.id + '" data-delta="-1">−</button>' +
            '<span class="mini-qty__val" id="mc-qty-' + it.id + '">' + it.qty + '</span>' +
            '<button class="mini-qty__btn" data-action="mc-qty" data-id="' + it.id + '" data-delta="1">+</button>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">' +
          '<button class="mini-item__remove" data-action="mc-remove" data-id="' + it.id + '" aria-label="حذف">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
          '</button>' +
          '<span class="mini-item__price">' + it.price + '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    var total = visible.reduce(function (s, it) {
      return s + parseInt(it.price.replace(/\D/g, ''), 10);
    }, 0);
    if (countEl) countEl.textContent = visible.length + ' محصول';
    if (totalEl) totalEl.textContent = '$' + total.toLocaleString();
  }

  function karaChangeMiniCartQty(id, delta) {
    var el = document.getElementById('mc-qty-' + id);
    if (!el) return;
    el.textContent = Math.max(1, (parseInt(el.textContent, 10) || 1) + delta);
    /* ── WP: update cart item quantity via AJAX ── */
  }

  function karaRemoveMiniCartItem(id) {
    var row = document.getElementById('mc-row-' + id);
    if (!row) return;
    row.style.transition = 'all 240ms ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    setTimeout(function () {
      row.remove();
      Kara.state.cartCount = Math.max(0, Kara.state.cartCount - 1);
      localStorage.setItem('kara_cart', Kara.state.cartCount);
      karaUpdateCartBadge();
      var countEl = document.getElementById('miniCartCount');
      if (countEl) countEl.textContent = Kara.state.cartCount + ' محصول';
      if (!Kara.state.cartCount) _karaRenderMiniCart();
    }, 240);
    toast('محصول از سبد حذف شد', 'info');
  }

  /* ══════════════════════════════════════════════════════════
     MINI WISHLIST MODAL  (دمو)
  ═══════════════════════════════════════════════════════════ */
  var WISHLIST_DEMO_ITEMS = [
    { id: 'wl1', emoji: '💻', brand: 'Apple', name: 'مک‌بوک ایر ۱۵ اینچ M3', variant: 'رنگ: نقره‌ای', price: '$1,299', old: '$1,499' },
    { id: 'wl2', emoji: '⌚', brand: 'Apple', name: 'اپل واچ اولترا ۲',        variant: 'سایز: ۴۹mm',  price: '$799',   old: '' },
    { id: 'wl3', emoji: '🎮', brand: 'Sony',  name: 'پلی‌استیشن ۵',            variant: '',              price: '$499',   old: '$549' },
  ];

  function karaOpenWishlistModal() {
    _karaRenderMiniWishlist();
    var panel = document.getElementById('miniWishlist');
    if (!panel) return;
    panel.removeAttribute('aria-hidden');
    panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var closeBtn = panel.querySelector('.mini-panel__close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function karaCloseWishlistModal() {
    var panel = document.getElementById('miniWishlist');
    if (!panel) return;
    if (panel.contains(document.activeElement)) document.activeElement.blur();
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function _karaRenderMiniWishlist() {
    var body    = document.getElementById('miniWishlistBody');
    var countEl = document.getElementById('miniWishlistCount');
    if (!body) return;

    var visible = WISHLIST_DEMO_ITEMS.slice(0, Math.min(Kara.state.wishlistCount, WISHLIST_DEMO_ITEMS.length));

    if (!visible.length) {
      body.innerHTML =
        '<div class="mini-panel__empty">' +
          '<span class="mini-panel__empty-icon">🤍</span>' +
          '<p class="mini-panel__empty-title">علاقه‌مندی‌ها خالی است</p>' +
          '<p class="mini-panel__empty-sub">محصولات موردعلاقه‌تان را ذخیره کنید تا بعداً راحت پیدا کنید</p>' +
          '<a href="shop.html" class="btn btn--primary btn--sm" data-action="close-wishlist">مشاهده محصولات</a>' +
        '</div>';
      if (countEl) countEl.textContent = '۰ محصول';
      return;
    }

    body.innerHTML = visible.map(function (it) {
      return '<div class="mini-item" id="wl-row-' + it.id + '">' +
        '<div class="mini-item__img">' + it.emoji + '</div>' +
        '<div class="mini-item__info">' +
          '<div class="mini-item__brand">' + it.brand + '</div>' +
          '<div class="mini-item__name">' + it.name + '</div>' +
          (it.variant ? '<div class="mini-item__variant">' + it.variant + '</div>' : '') +
          '<div>' +
            '<span class="mini-item__price">' + it.price + '</span>' +
            (it.old ? '<span class="mini-item__original">' + it.old + '</span>' : '') +
          '</div>' +
          '<button class="mini-item__add-btn" data-action="wl-add-to-cart" data-name="' + it.name + '">' +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>' +
            'افزودن به سبد' +
          '</button>' +
        '</div>' +
        '<button class="mini-item__remove" data-action="wl-remove" data-id="' + it.id + '" aria-label="حذف">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
        '</button>' +
      '</div>';
    }).join('');

    if (countEl) countEl.textContent = visible.length + ' محصول';
  }

  function karaRemoveMiniWishlistItem(id) {
    var row = document.getElementById('wl-row-' + id);
    if (!row) return;
    row.style.transition = 'all 240ms ease';
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    setTimeout(function () {
      row.remove();
      Kara.state.wishlistCount = Math.max(0, Kara.state.wishlistCount - 1);
      localStorage.setItem('kara_wishlist', Kara.state.wishlistCount);
      karaUpdateWishlistBadge();
      var countEl = document.getElementById('miniWishlistCount');
      if (countEl) countEl.textContent = Kara.state.wishlistCount + ' محصول';
      if (!Kara.state.wishlistCount) _karaRenderMiniWishlist();
    }, 240);
    toast('از علاقه‌مندی‌ها حذف شد', 'info');
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  +  compat aliases
  ═══════════════════════════════════════════════════════════ */
  Kara.addToCart              = Kara.addToCart              || karaAddToCart;
  Kara.updateCartBadge        = Kara.updateCartBadge        || karaUpdateCartBadge;
  Kara.toggleWishlist         = Kara.toggleWishlist         || karaToggleWishlist;
  Kara.updateWishlistBadge    = Kara.updateWishlistBadge    || karaUpdateWishlistBadge;
  Kara.initProductActions     = Kara.initProductActions     || karaInitProductActions;
  Kara.changeQty              = Kara.changeQty              || karaChangeQty;
  Kara.removeCartItem         = Kara.removeCartItem         || karaRemoveCartItem;
  Kara.recalcCart             = Kara.recalcCart             || karaRecalcCart;
  Kara.applyPromo             = Kara.applyPromo             || karaApplyPromo;
  Kara.selectShipping         = Kara.selectShipping         || karaSelectShipping;
  Kara.selectPayment          = Kara.selectPayment          || karaSelectPayment;
  Kara.formatCard             = Kara.formatCard             || karaFormatCard;
  Kara.goToStep               = Kara.goToStep               || karaGoToStep;
  Kara.placeOrder             = Kara.placeOrder             || karaPlaceOrder;
  Kara.handleNewsletterSubmit = Kara.handleNewsletterSubmit || karaHandleNewsletterSubmit;
  Kara.openCartModal          = Kara.openCartModal          || karaOpenCartModal;
  Kara.closeCartModal         = Kara.closeCartModal         || karaCloseCartModal;
  Kara.changeMiniCartQty      = Kara.changeMiniCartQty      || karaChangeMiniCartQty;
  Kara.removeMiniCartItem     = Kara.removeMiniCartItem     || karaRemoveMiniCartItem;
  Kara.openWishlistModal      = Kara.openWishlistModal      || karaOpenWishlistModal;
  Kara.closeWishlistModal     = Kara.closeWishlistModal     || karaCloseWishlistModal;
  Kara.removeMiniWishlistItem = Kara.removeMiniWishlistItem || karaRemoveMiniWishlistItem;

  /* compat با کد قدیمی (global‌های نام‌دار) */
  if (!window.addToCart)              window.addToCart              = karaAddToCart;
  if (!window.updateCartBadge)        window.updateCartBadge        = karaUpdateCartBadge;
  if (!window.toggleWishlist)         window.toggleWishlist         = karaToggleWishlist;
  if (!window.updateWishlistBadge)    window.updateWishlistBadge    = karaUpdateWishlistBadge;
  if (!window.initProductActions)     window.initProductActions     = karaInitProductActions;
  if (!window.changeQty)              window.changeQty              = karaChangeQty;
  if (!window.removeCartItem)         window.removeCartItem         = karaRemoveCartItem;
  if (!window.recalcCart)             window.recalcCart             = karaRecalcCart;
  if (!window.applyPromo)             window.applyPromo             = karaApplyPromo;
  if (!window.selectShipping)         window.selectShipping         = karaSelectShipping;
  if (!window.selectPayment)          window.selectPayment          = karaSelectPayment;
  if (!window.formatCard)             window.formatCard             = karaFormatCard;
  if (!window.goToStep)               window.goToStep               = karaGoToStep;
  if (!window.placeOrder)             window.placeOrder             = karaPlaceOrder;
  if (!window.handleNewsletterSubmit) window.handleNewsletterSubmit = karaHandleNewsletterSubmit;
  if (!window.openCartModal)          window.openCartModal          = karaOpenCartModal;
  if (!window.closeCartModal)         window.closeCartModal         = karaCloseCartModal;
  if (!window.changeMiniCartQty)      window.changeMiniCartQty      = karaChangeMiniCartQty;
  if (!window.removeMiniCartItem)     window.removeMiniCartItem     = karaRemoveMiniCartItem;
  if (!window.openWishlistModal)      window.openWishlistModal      = karaOpenWishlistModal;
  if (!window.closeWishlistModal)     window.closeWishlistModal     = karaCloseWishlistModal;
  if (!window.removeMiniWishlistItem) window.removeMiniWishlistItem = karaRemoveMiniWishlistItem;

  document.addEventListener('DOMContentLoaded', function () {
    karaInitProductActions();
    karaUpdateCartBadge();
    karaUpdateWishlistBadge();

    /* ثبت فرم خبرنامه (اگر در صفحه وجود داشت) */
    document.querySelectorAll('[data-form="newsletter"]').forEach(function (form) {
      form.addEventListener('submit', karaHandleNewsletterSubmit);
    });
  });
})();
