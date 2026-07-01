/* ============================================================
   VELA — Product & Content Swipers  (vela-swipers.js)
   مستقل · بدون coordinator
   شامل: Product swiper · Testimonials · Posts · Brand marquee
          · Amazing offers swiper
   ============================================================
   وابستگی‌ها:
     - کتابخانه‌ی Swiper باید قبل از این فایل لود شود.
     - هیچ وابستگی به ماژول Vela ندارد.
   ────────────────────────────────────────────────────────────
   ⚠️  نکته‌ی WordPress:
     - هر بلوک (محصولات پرفروش، نظرات، پست‌ها، برندها) از یک
       WP_Query جداگانه در PHP رندر می‌شود. این فایل فقط Swiper را
       روی کلاس‌های موجود راه‌اندازی می‌کند و اگر کلاسی در صفحه نبود،
       Swiper آن ساخته نمی‌شود (خطا نمی‌دهد).
   ============================================================ */
(function () {
  'use strict';

  var Vela = (window.Vela = window.Vela || {});

  /* یکسان‌سازی ارتفاع اسلایدها برای جلوگیری از پرش ارتفاع */
  function velaEqualizeSlideHeights(sw) {
    sw.slides.forEach(function (s) { s.style.height = 'auto'; });
    var maxH = 0;
    sw.slides.forEach(function (s) { maxH = Math.max(maxH, s.offsetHeight); });
    sw.slides.forEach(function (s) { s.style.height = maxH + 'px'; });
  }

  function velaInitSwipers() {
    if (typeof Swiper === 'undefined') return;

    /* ── Product swiper (محصولات پرفروش) ── */
    if (document.querySelector('.product-swiper')) {
      new Swiper('.product-swiper', {
        slidesPerView: 1.5,
        spaceBetween: 12,
        dir: 'rtl',
        navigation: { nextEl: '.swiper-btn-next', prevEl: '.swiper-btn-prev' },
        breakpoints: {
          768:  { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 16 },
        },
        on: { afterInit: velaEqualizeSlideHeights, resize: velaEqualizeSlideHeights },
      });
    }

    /* ── Testimonials swiper ── */
    if (document.querySelector('.testi-swiper')) {
      new Swiper('.testi-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        dir: 'rtl',
        autoplay: { delay: 7000, disableOnInteraction: false },
        pagination: { el: '.testi-pagination', clickable: true },
        navigation: { nextEl: '.testi-btn-next', prevEl: '.testi-btn-prev' },
        breakpoints: { 768: { slidesPerView: 2, spaceBetween: 24 } },
        on: { afterInit: velaEqualizeSlideHeights, resize: velaEqualizeSlideHeights },
      });
    }

    /* ── Posts swiper (آخرین مقالات) ── */
    if (document.querySelector('.post-swiper')) {
      new Swiper('.post-swiper', {
        slidesPerView: 1.2,
        spaceBetween: 16,
        dir: 'rtl',
        navigation: { nextEl: '.post-nav-next', prevEl: '.post-nav-prev' },
        breakpoints: {
          640:  { slidesPerView: 2, spaceBetween: 16 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
          1280: { slidesPerView: 4, spaceBetween: 20 },
        },
      });
    }

    /* ── Brand marquee (اسکرول بی‌پایان برندها) ── */
    if (document.querySelector('.brand-swiper')) {
      new Swiper('.brand-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 32,
        loop: true,
        speed: 3000,
        autoplay: { delay: 0, disableOnInteraction: false },
        allowTouchMove: false,
        grabCursor: false,
      });
    }

    /* ── Amazing offers swiper (پیشنهادهای شگفت‌انگیز) ── */
    if (document.querySelector('.amazing-swiper')) {
      new Swiper('.amazing-swiper', {
        slidesPerView: 1.5,
        spaceBetween: 12,
        dir: 'rtl',
        navigation: { nextEl: '.amazing-btn-next', prevEl: '.amazing-btn-prev' },
        breakpoints: {
          480:  { slidesPerView: 2.5, spaceBetween: 12 },
          768:  { slidesPerView: 3,   spaceBetween: 14 },
          1024: { slidesPerView: 5,   spaceBetween: 16 },
        },
        on: { afterInit: velaEqualizeSlideHeights, resize: velaEqualizeSlideHeights },
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE
  ═══════════════════════════════════════════════════════════ */
  Vela.initSwipers = Vela.initSwipers || velaInitSwipers;

  document.addEventListener('DOMContentLoaded', velaInitSwipers);
})();
