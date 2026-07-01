/* ============================================================
   VELA — Hero Slider Module  (vela-hero-slider.js)
   مستقل · بدون coordinator
   شامل: Hero banner slider · Category swiper
   ============================================================
   وابستگی‌ها:
     - کتابخانه‌ی Swiper باید قبل از این فایل لود شود (swiper-bundle).
     - هیچ وابستگی به ماژول Vela ندارد.
   ────────────────────────────────────────────────────────────
   ⚠️  نکته‌ی WordPress:
     - slides ها در وردپرس از یک WP_Query (مثلاً اسلایدر اصلی یا
       دسته‌بندی‌های برجسته) در PHP رندر می‌شوند. این فایل فقط
       Swiper را روی ساختار DOM موجود راه‌اندازی می‌کند.
     - اگر Swiper در صفحه‌ی جاری موجود نبود، هیچ خطایی نمی‌دهد.
   ============================================================ */
(function () {
  'use strict';

  var Vela = (window.Vela = window.Vela || {});

  function velaInitHeroSlider() {
    if (typeof Swiper === 'undefined') return;

    /* ── Hero banner slider ──
       rewind به جای loop: از کلون جلوگیری می‌کند و باگ موقعیت
       RTL هنگام loop:true را برطرف می‌کند. */
    var heroEl = document.querySelector('.hero-swiper');
    if (heroEl) {
      /* جلوگیری از init دوباره اگر قبلاً ساخته شده */
      if (!heroEl.querySelector('.swiper-initialized')) {
        new Swiper('.hero-swiper', {
          rewind: true,
          speed: 750,
          autoplay: {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
          pagination: {
            el: '.hero-slider-pagination',
            clickable: true,
            type: 'bullets',
          },
          navigation: {
            nextEl: '.hero-slider-next',
            prevEl: '.hero-slider-prev',
          },
        });
      }
    }

    /* ── Category swiper — یک ردیف، همیشه روشن، center هنگام کم ── */
    var catEl = document.querySelector('.cat-swiper');
    if (!catEl) return;
    new Swiper('.cat-swiper', {
      slidesPerView: 'auto',
      spaceBetween: 14,
      centerInsufficientSlides: true,
      navigation: {
        nextEl: '.cat-nav-next',
        prevEl: '.cat-nav-prev',
      },
    });
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE
  ═══════════════════════════════════════════════════════════ */
  Vela.initHeroSlider = Vela.initHeroSlider || velaInitHeroSlider;

  document.addEventListener('DOMContentLoaded', velaInitHeroSlider);
})();
