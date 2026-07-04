(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    initVariants();
    initQuantitySelectors();
    initStickyTabs();
    initStickyCta();

  });

  /* =========================================================
     VARIANTS UI ONLY
     فقط وضعیت active و label را کنترل می‌کند
     WooCommerce بعداً variation واقعی را هندل می‌کند
  ========================================================= */

  function initVariants() {

    const variantBtns = document.querySelectorAll('.variant-btn');
    const selectedValue = document.querySelector('.selected-value');

    if (!variantBtns.length) return;

    variantBtns.forEach(btn => {

      btn.addEventListener('click', () => {

        variantBtns.forEach(b => {
          b.classList.remove('active');
        });

        btn.classList.add('active');

        if (selectedValue) {
          selectedValue.textContent =
            btn.getAttribute('aria-label') || '';
        }

      });

    });

  }

  /* =========================================================
     QUANTITY UI
     فقط input را کنترل می‌کند
     state داخلی ندارد
     WooCommerce quantity field بعداً استفاده می‌شود
  ========================================================= */

  function initQuantitySelectors() {

    initQuantitySelector(
      document.querySelector('.buy-box-actions')
    );

    initQuantitySelector(
      document.querySelector('.sticky-mobile-bar')
    );

  }

  function initQuantitySelector(container) {

    if (!container) return;

    const qtyInput =
      container.querySelector('.qty-input, .qty-input-mobile');

    const qtyMinus =
      container.querySelector('.qty-minus, .qty-minus-mobile');

    const qtyPlus =
      container.querySelector('.qty-plus, .qty-plus-mobile');

    if (!qtyInput || !qtyMinus || !qtyPlus) return;

    qtyMinus.addEventListener('click', () => {

      let value = parseInt(qtyInput.value) || 1;
      let min = parseInt(qtyInput.min) || 1;

      if (value > min) {
        qtyInput.value = value - 1;
        syncQuantity(qtyInput.value);
      }

    });

    qtyPlus.addEventListener('click', () => {

      let value = parseInt(qtyInput.value) || 1;
      let max = parseInt(qtyInput.max) || 99;

      if (value < max) {
        qtyInput.value = value + 1;
        syncQuantity(qtyInput.value);
      }

    });

    qtyInput.addEventListener('input', () => {

      let value = parseInt(qtyInput.value);
      let min = parseInt(qtyInput.min) || 1;
      let max = parseInt(qtyInput.max) || 99;

      if (isNaN(value) || value < min) {
        qtyInput.value = min;
      }

      if (value > max) {
        qtyInput.value = max;
      }

      syncQuantity(qtyInput.value);

    });

  }

  /* =========================================================
     SYNC DESKTOP & MOBILE QTY
     فقط UI sync
  ========================================================= */

  function syncQuantity(value) {

    const desktopInput =
      document.querySelector('.buy-box-actions .qty-input');

    const mobileInput =
      document.querySelector('.sticky-mobile-bar .qty-input-mobile');

    if (desktopInput) {
      desktopInput.value = value;
    }

    if (mobileInput) {
      mobileInput.value = value;
    }

  }

  /* =========================================================
     STICKY PRODUCT TABS
  ========================================================= */

  function initStickyTabs() {

    const sections = document.querySelectorAll('.pdp-block');
    const tabLinks = document.querySelectorAll('.pdp-tabs a');

    if (!sections.length || !tabLinks.length) return;

    const observer = new IntersectionObserver(

      (entries) => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          const id = entry.target.getAttribute('id');

          tabLinks.forEach(link => {

            link.classList.remove('active');

            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }

          });

        });

      },

      {
        root: null,
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0
      }

    );

    sections.forEach(section => {
      observer.observe(section);
    });

    tabLinks.forEach(link => {

      link.addEventListener('click', (e) => {

        e.preventDefault();

        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (!targetSection) return;

        const headerOffset = 120;

        const offsetPosition =
          targetSection.getBoundingClientRect().top +
          window.pageYOffset -
          headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

      });

    });

  }

  /* =========================================================
     STICKY MOBILE CTA
  ========================================================= */

  function initStickyCta() {

    const cta = document.getElementById('stickyCta');
    const trigger = document.getElementById('productInfoTop');

    if (!cta || !trigger) return;

    new IntersectionObserver(

      (entries) => {

        cta.classList.toggle(
          'visible',
          !entries[0].isIntersecting
        );

      },

      {
        threshold: 0,
        rootMargin: '0px 0px -80px 0px'
      }

    ).observe(trigger);

  }

})();
