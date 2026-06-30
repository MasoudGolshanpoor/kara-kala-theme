/* ─── Hero Slider + Category Swiper ─── */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ── Hero banner slider ── */
    var heroEl = document.querySelector('.hero-swiper');
    if (heroEl) {
      new Swiper('.hero-swiper', {
        rewind: true,   /* loop without clones — avoids RTL positioning bug with loop:true */
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

    /* ── Category swiper — single row, always on, centered when few items ── */
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
  });
})();
