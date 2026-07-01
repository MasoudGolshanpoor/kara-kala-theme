/* ============================================================
   VELA — Product Detail Module  (vela-product.js)
   مستقل · بدون coordinator
   شامل: Gallery switch · Quantity stepper · Color/Size variants
          · Tabs · Sticky CTA (نوار خرید چسبان پایین صفحه)
   ============================================================
   وابستگی‌ها (همه از طریق namespace با fallback):
     - Vela.state.qty  (از vela-ui.js) — در صورت نبود، مقدار محلی
   ────────────────────────────────────────────────────────────
   ⚠️  بخش‌های WordPress / WooCommerce:
     - گالری: در وردپرس تصاویر از $product->get_gallery_image_ids()
       می‌آیند؛ به جای emoji، <img> رندر کنید. منطق switch ثابت است.
     - variants (رنگ/سایز): از variation‌های محصول (WooCommerce)
       می‌آیند. هنگام انتخاب، found_variation AJAX را صدا بزنید تا
       قیمت/موجودی آپدیت شود.
     - qty: هنگام add-to-cart به‌عنوان پارامتر quantity ارسال شود.
   ============================================================ */
(function () {
  'use strict';

  var Vela = (window.Vela = window.Vela || {});

  /* ── داده‌ی دمو گالری. در وردپرس از سرور/PHP رندر شود ── */
  var galleryEmojis = ['🎧', '🎧', '🔌', '📦', '📋'];

  /* ══════════════════════════════════════════════════════════
     GALLERY  —  تعویض تصویر اصلی با thumbnail
  ═══════════════════════════════════════════════════════════ */
  function velaSwitchGallery(index) {
    document.querySelectorAll('.gallery__thumb').forEach(function (t, i) {
      t.classList.toggle('active', i === index);
    });
    var d = document.getElementById('galleryDisplay');
    if (!d) return;
    d.style.transition = 'opacity 150ms ease, transform 150ms ease';
    d.style.opacity = '0';
    d.style.transform = 'scale(0.95)';
    setTimeout(function () {
      d.textContent = galleryEmojis[index] != null ? galleryEmojis[index] : '🎧';
      d.style.opacity = '1';
      d.style.transform = 'scale(1)';
    }, 150);
  }

  /* ══════════════════════════════════════════════════════════
     QUANTITY STEPPER  —  برای صفحه‌ی محصول (۱ تا ۹۹)
  ═══════════════════════════════════════════════════════════ */
  function velaAdjustQty(delta) {
    if (Vela.state) Vela.state.qty = Vela.state.qty || 1;
    var qty = Vela.state ? Vela.state.qty : 1;
    qty = Math.max(1, Math.min(99, qty + delta));
    if (Vela.state) Vela.state.qty = qty;

    var el = document.getElementById('qtyVal');
    if (!el) return;
    el.textContent = qty;
    el.style.transition = 'transform 150ms ease';
    el.style.transform = delta > 0 ? 'translateY(-3px)' : 'translateY(3px)';
    setTimeout(function () { el.style.transform = ''; }, 150);
  }

  /* ══════════════════════════════════════════════════════════
     COLOR / SIZE VARIANTS  —  انتخاب سواچ
     در WooCommerce: پس از انتخاب، AJAX variation را بگیرید.
  ═══════════════════════════════════════════════════════════ */
  function velaSelectColor(el, name) {
    document.querySelectorAll('.color-swatch').forEach(function (s) {
      s.classList.remove('active');
    });
    el.classList.add('active');
    var group = el.closest('.variant-group');
    var label = group ? group.querySelector('.variant-group__label span') : null;
    if (label) {
      label.style.transition = 'opacity 100ms ease';
      label.style.opacity = '0';
      setTimeout(function () {
        label.textContent = name;
        label.style.opacity = '1';
      }, 100);
    }

    /* ── WP/WooCommerce: variation انتخاب‌شده را بگیر ──
       var data = { product_id: …, attribute_color: name };
       jQuery.post(woocommerce_params.ajax_url + '?action=…', data, …); */
  }

  /* ══════════════════════════════════════════════════════════
     TABS  —  تب‌های توضیحات/مشخصات/نظرات
  ═══════════════════════════════════════════════════════════ */
  function velaSwitchTab(btn, id) {
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(function (p) {
      p.classList.remove('active');
    });
    btn.classList.add('active');
    var pane = document.getElementById('tab-' + id);
    if (pane) {
      pane.classList.add('active');
      pane.style.animation = 'fadeIn 200ms ease forwards';
    }
  }

  /* ══════════════════════════════════════════════════════════
     STICKY CTA  —  نوار خرید چسبان وقتی info بالا از دید خارج شد
  ═══════════════════════════════════════════════════════════ */
  function velaInitStickyCta() {
    var cta     = document.getElementById('stickyCta');
    var trigger = document.getElementById('productInfoTop');
    if (!cta || !trigger) return;
    new IntersectionObserver(
      function (entries) {
        var e = entries[0];
        cta.classList.toggle('visible', !e.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px 0px -80px 0px' }
    ).observe(trigger);
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  +  compat aliases
  ═══════════════════════════════════════════════════════════ */
  Vela.switchGallery = Vela.switchGallery || velaSwitchGallery;
  Vela.adjustQty     = Vela.adjustQty     || velaAdjustQty;
  Vela.selectColor   = Vela.selectColor   || velaSelectColor;
  Vela.switchTab     = Vela.switchTab     || velaSwitchTab;
  Vela.initStickyCta = Vela.initStickyCta || velaInitStickyCta;

  /* compat با کد قدیمی (global‌های نام‌دار) */
  if (!window.switchGallery) window.switchGallery = velaSwitchGallery;
  if (!window.adjustQty)     window.adjustQty     = velaAdjustQty;
  if (!window.selectColor)   window.selectColor   = velaSelectColor;
  if (!window.switchTab)     window.switchTab     = velaSwitchTab;
  if (!window.initStickyCta) window.initStickyCta = velaInitStickyCta;

  document.addEventListener('DOMContentLoaded', velaInitStickyCta);
})();
