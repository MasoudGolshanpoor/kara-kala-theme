/* ============================================================
   KARA STYLE - CART & CHECKOUT JS (یکپارچه و بهینه برای وردپرس)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  // ── بخش مشترک: ابزارها و متغیرهای سراسری ──
  const fmt = (n) => Number(n).toLocaleString('fa-IR');
  const TAX_RATE = 0.09;

  /* ==========================================
     ۱. بخش سبد خرید (Cart Page)
     ========================================== */
  const cartForm = document.querySelector('.woocommerce-cart-form');
  
  if (cartForm) {
    // دیتای پیش‌فرض دمو (در وردپرس این مقادیر داینامیک هندل می‌شوند)
    const UNIT_PRICES = {
      '1': 121999000,
      '2': 3420000,
      '3': 14900000
    };
    const FREE_SHIP_THRESHOLD = 5000000;
    const SHIPPING_BASE = 389000;

    // انتخاب‌گرهای تعداد (Quantity Selectors)
    document.querySelectorAll('[data-qty]').forEach(qs => {
      const input = qs.querySelector('.qty-input');
      const minus = qs.querySelector('.qty-minus');
      const plus  = qs.querySelector('.qty-plus');
      
      if (input && minus && plus) {
        minus.addEventListener('click', () => {
          let v = parseInt(input.value) || 1;
          if (v > parseInt(input.min)) input.value = v - 1;
          recalcCart();
        });
        plus.addEventListener('click', () => {
          let v = parseInt(input.value) || 1;
          if (v < parseInt(input.max)) input.value = v + 1;
          recalcCart();
        });
        input.addEventListener('input', () => {
          let v = parseInt(input.value);
          const min = parseInt(input.min), max = parseInt(input.max);
          if (isNaN(v) || v < min) v = min;
          if (v > max) v = max;
          input.value = v;
          recalcCart();
        });
      }
    });

    // حذف آیتم از سبد خرید
    document.querySelectorAll('.ci-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.cart_item');
        if (row) {
          row.style.transition = 'opacity .25s, transform .25s';
          row.style.opacity = '0';
          row.style.transform = 'translateX(-20px)';
          setTimeout(() => { 
            row.remove(); 
            recalcCart(); 
          }, 250);
        }
      });
    });

    // اعمال کد تخفیف دمو
    const couponBtn = document.getElementById('applyCoupon');
    const couponInput = document.getElementById('coupon_code');
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', () => {
        if (couponInput.value.trim()) {
          const orig = couponBtn.innerHTML;
          couponBtn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> اعمال شد';
          couponBtn.style.color = 'var(--success)';
          setTimeout(() => { 
            couponBtn.innerHTML = orig; 
            couponBtn.style.color = ''; 
          }, 1800);
        }
      });
    }

    // محاسبه مجدد مجموع سبد خرید
    function recalcCart() {
      let subtotal = 0, count = 0;
      document.querySelectorAll('.cart_item').forEach(row => {
        const key = row.dataset.key;
        const qty = parseInt(row.querySelector('.qty-input').value) || 1;
        const unit = UNIT_PRICES[key] || 0;
        subtotal += unit * qty;
        count += qty;
      });

      const shipping = (subtotal >= FREE_SHIP_THRESHOLD || subtotal === 0) ? 0 : SHIPPING_BASE;
      const tax = Math.round(subtotal * TAX_RATE);
      const total = subtotal + shipping + tax;

      // آپدیت دام با بررسی وجود المنت‌ها جهت جلوگیری از خطای JS
      const subtotalEl = document.getElementById('subtotalVal');
      const shippingEl = document.getElementById('shippingVal');
      const taxEl = document.getElementById('taxVal');
      const totalEl = document.getElementById('totalVal');
      const itemsCountEl = document.getElementById('itemsCount');

      if (subtotalEl) subtotalEl.textContent = fmt(subtotal) + ' تومان';
      if (shippingEl) shippingEl.textContent = shipping === 0 ? 'رایگان' : fmt(shipping) + ' تومان';
      if (taxEl) taxEl.textContent = fmt(tax) + ' تومان';
      if (totalEl) totalEl.textContent = fmt(total) + ' تومان';
      if (itemsCountEl) itemsCountEl.textContent = count.toLocaleString('fa-IR') + ' کالا';

      // پراگرس‌بار ارسال رایگان
      const fill = document.getElementById('freeShipFill');
      const remainText = document.getElementById('remainText');
      if (fill && remainText) {
        const remain = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
        const pct = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);
        fill.style.width = pct + '%';
        remainText.textContent = remain > 0 ? fmt(remain) + ' تومان' : '🎉 ارسال شما رایگان شد!';
      }

      // وضعیت سبد خرید خالی
      const emptyState = document.getElementById('emptyState');
      const cartLayout = document.querySelector('.cart-layout');
      const freeShippingSection = document.getElementById('freeShipping');
      if (count === 0 && emptyState) {
        emptyState.classList.add('is-empty');
        if (cartLayout) cartLayout.style.display = 'none';
        if (freeShippingSection) freeShippingSection.style.display = 'none';
      }
    }

    // اولین اجرا برای استارت مقادیر
    recalcCart();
  }

  /* ==========================================
     ۲. بخش تسویه حساب (Checkout Page)
     ========================================== */
  const checkoutForm = document.querySelector('.woocommerce-checkout');

  if (checkoutForm) {
    // دیتای پیش‌فرض دمو
    const SUBTOTAL_CHECKOUT = 143739000;

    // انتخاب روش ارسال
    const shipCards = document.querySelectorAll('.ship-card');
    shipCards.forEach(card => {
      card.addEventListener('click', () => {
        shipCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        recalcCheckout();
      });
    });

    // انتخاب روش پرداخت
    const payCards = document.querySelectorAll('.pay-card');
    payCards.forEach(card => {
      card.addEventListener('click', () => {
        payCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    // فعال/غیرفعال‌سازی دکمه ثبت سفارش بر اساس پذیرش قوانین
    const acceptTerms = document.getElementById('acceptTerms');
    const placeBtn = document.getElementById('placeOrderBtn');
    if (acceptTerms && placeBtn) {
      acceptTerms.addEventListener('change', () => {
        placeBtn.disabled = !acceptTerms.checked;
      });
    }

    // شبیه‌ساز ثبت سفارش (ثبت نهایی دمو)
    if (placeBtn) {
      placeBtn.addEventListener('click', () => {
        const checkoutLayout = document.getElementById('checkoutLayout');
        const orderSuccess = document.getElementById('orderSuccess');
        
        placeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> در حال پردازش...';
        placeBtn.disabled = true;

        setTimeout(() => {
          if (checkoutLayout) checkoutLayout.style.display = 'none';
          
          const steps = document.querySelectorAll('.step');
          if (steps.length >= 3) {
            steps[1].classList.remove('active');
            steps[1].classList.add('done');
            steps[2].classList.add('active');
          }
          
          if (orderSuccess) orderSuccess.classList.add('is-placed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
      });
    }

    // محاسبه مجدد هزینه‌ها در تسویه حساب
    function recalcCheckout() {
      const selectedShip = document.querySelector('.ship-card.selected');
      const shipCost = parseInt(selectedShip?.dataset.shipCost || 0);
      const tax = Math.round(SUBTOTAL_CHECKOUT * TAX_RATE);
      const total = SUBTOTAL_CHECKOUT + shipCost + tax;

      const rvShipping = document.getElementById('rv-shipping');
      const rvTax = document.getElementById('rv-tax');
      const rvTotal = document.getElementById('rv-total');

      if (rvShipping) rvShipping.textContent = shipCost === 0 ? 'رایگان' : fmt(shipCost) + ' تومان';
      if (rvTax) rvTax.textContent = fmt(tax) + ' تومان';
      if (rvTotal) rvTotal.textContent = fmt(total) + ' تومان';
    }

    // اولین اجرا برای استارت مقادیر تسویه حساب
    recalcCheckout();
  }
});
