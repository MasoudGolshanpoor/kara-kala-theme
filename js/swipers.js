/* ============================================================
   VELA — Product & Flash Sale Swipers
   Extracted from inline script for WordPress compatibility.
   ============================================================ */
(function () {
  function equalizeSlideHeights(sw) {
    sw.slides.forEach(s => (s.style.height = 'auto'));
    let maxH = 0;
    sw.slides.forEach(s => { maxH = Math.max(maxH, s.offsetHeight); });
    sw.slides.forEach(s => (s.style.height = maxH + 'px'));
  }

  new Swiper('.product-swiper', {
    slidesPerView: 1.5,
    spaceBetween: 12,
    dir: 'rtl',
    navigation: {
      nextEl: '.swiper-btn-next',
      prevEl: '.swiper-btn-prev',
    },
    breakpoints: {
      768:  { slidesPerView: 3, spaceBetween: 16 },
      1024: { slidesPerView: 5, spaceBetween: 16 }
    },
    on: { afterInit: equalizeSlideHeights, resize: equalizeSlideHeights }
  });

  new Swiper('.testi-swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    dir: 'rtl',
    autoplay: { delay: 7000, disableOnInteraction: false },
    pagination: { el: '.testi-pagination', clickable: true },
    navigation: { nextEl: '.testi-btn-next', prevEl: '.testi-btn-prev' },
    breakpoints: { 768: { slidesPerView: 2, spaceBetween: 24 } },
    on: { afterInit: equalizeSlideHeights, resize: equalizeSlideHeights },
  });

  new Swiper('.post-swiper', {
    slidesPerView: 1.2,
    spaceBetween: 16,
    dir: 'rtl',
    navigation: { nextEl: '.post-nav-next', prevEl: '.post-nav-prev' },
    breakpoints: {
      640:  { slidesPerView: 2,   spaceBetween: 16 },
      1024: { slidesPerView: 3,   spaceBetween: 20 },
      1280: { slidesPerView: 4,   spaceBetween: 20 },
    },
  });

  new Swiper('.brand-swiper', {
    slidesPerView: 'auto',
    spaceBetween: 32,
    loop: true,
    speed: 3000,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    allowTouchMove: false,
    grabCursor: false,
  });

  new Swiper('.amazing-swiper', {
    slidesPerView: 1.5,
    spaceBetween: 12,
    dir: 'rtl',
    navigation: {
      nextEl: '.amazing-btn-next',
      prevEl: '.amazing-btn-prev',
    },
    breakpoints: {
      480:  { slidesPerView: 2.5, spaceBetween: 12 },
      768:  { slidesPerView: 3,   spaceBetween: 14 },
      1024: { slidesPerView: 5,   spaceBetween: 16 }
    },
    on: { afterInit: equalizeSlideHeights, resize: equalizeSlideHeights }
  });
})();
