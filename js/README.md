# VELA — JavaScript مستقل برای وردپرس (پوشه‌ی `js/`)

این پوشه شامل نسخه‌ی **ریفکتور شده و مستقل** از اسکریپت‌های قالب است که برای
استفاده در **قالب وردپرس** آماده شده است. فایل‌های اصلی داخل `js/` دست‌نخورده باقی
مانده‌اند و اینجا نسخه‌های جدید با نام `vela-*.js` ساخته شده‌اند.

---

## اصول طراحی (همه‌ی فایل‌ها یکسان رعایت شده)

| اصل | توضیح |
| --- | --- |
| **مستقل** | هر فایل داخل یک IIFE است و DOMContentLoaded اختصاصی خود را دارد. هیچ coordinator مرکزی (مثل `app.js`) وجود ندارد. |
| **بدون وابستگی سخت** | همه‌ی ارتباط‌ها از طریق `window.Vela` (namespace) با fallback است. اگر فایلی لود نشد، بقیه خطا نمی‌دهند — فقط feature مربوطه غیرفعال می‌ماند. |
| **پیشوند `vela_`** | توابع اصلی با پیشوند `vela` نام‌گذاری شده‌اند (مثل `velaInitHeader`, `velaAddToCart`). |
| **compat alias** | برای سازگاری با HTML فعلی، نام‌های قدیمی هم روی `window` ست شده‌اند (مثل `addToCart`, `openSearchModal`). |
| **کامنت‌های WP/AJAX** | بخش‌هایی که بعداً باید به AJAX یا WooCommerce وصل شوند (add to cart, live search, login, …) با `⚠️` مشخص شده‌اند. |
| **حفظ functionality** | تمام رفتارهای اصلی قالب HTML حفظ شده‌اند. |

---

## فایل‌ها

| فایل | جایگزین | مسئولیت |
| --- | --- | --- |
| `vela-ui.js` | `app.js` + `ui.js` | State مشترک · Panel manager · Toast · Countdown · Page transitions · Scroll-top · Global animations |
| `vela-header.js` | `header.js` | Sticky offset · Scroll behavior · Nav underline · Auto-hide · Header actions |
| `vela-mega-menu.js` | `mega-menu.js` | باز/بسته کردن مگامنو · تب‌ها · backdrop |
| `vela-mobile-nav.js` | `mobile-nav.js` | Drawer موبایل · Bottom nav · FAB · Support sheet |
| `vela-search.js` | `search.js` | مودال جستجو · نتایج زنده · جستجوهای اخیر/پرجستجو |
| `vela-shop.js` | `shop.js` | فیلتر موبایل · مرتب‌سازی · chips · درخت دسته‌بندی · محدوده قیمت |
| `vela-product.js` | `product.js` | گالری · quantity · variants · تب‌ها · sticky CTA |
| `vela-cart.js` | `cart.js` | سبد · علاقه‌مندی · mini-modals · checkout · خبرنامه |
| `vela-auth.js` | `auth.js` | مودال ورود/ثبت‌نام · تب‌ها · اعتبارسنجی |
| `vela-hero-slider.js` | `hero-slider.js` | اسلایدر هیرو + swiper دسته‌بندی |
| `vela-swipers.js` | `swipers.js` | swiper محصول/نظرات/پست/برند/شگفت‌انگیز |

---

## ترتیب لود پیشنهادی در `functions.php`

> **مهم:** `swiper-bundle.min.js` حتماً **قبل از** فایل‌های swiper لود شود.

```php
add_action( 'wp_enqueue_scripts', function () {
    $uri = get_template_directory_uri();

    // Swiper library (فقط روی صفحه‌هایی که اسلایدر دارند)
    wp_enqueue_script( 'swiper', $uri . '/js/swiper-bundle.min.js', array(), null, true );

    // هسته‌ی UI را اول لود کن (state و showToast را فراهم می‌کند)
    wp_enqueue_script( 'vela-ui',    $uri . '/wp-js/vela-ui.js',    array(), '1.0', true );
    wp_enqueue_script( 'vela-header', $uri . '/wp-js/vela-header.js',  array(), '1.0', true );
    wp_enqueue_script( 'vela-mega-menu', $uri . '/wp-js/vela-mega-menu.js', array(), '1.0', true );
    wp_enqueue_script( 'vela-mobile-nav', $uri . '/wp-js/vela-mobile-nav.js', array(), '1.0', true );
    wp_enqueue_script( 'vela-search', $uri . '/wp-js/vela-search.js', array(), '1.0', true );
    wp_enqueue_script( 'vela-shop',   $uri . '/wp-js/vela-shop.js',   array(), '1.0', true );
    wp_enqueue_script( 'vela-product',$uri . '/wp-js/vela-product.js',array(), '1.0', true );
    wp_enqueue_script( 'vela-cart',   $uri . '/wp-js/vela-cart.js',   array(), '1.0', true );
    wp_enqueue_script( 'vela-auth',   $uri . '/wp-js/vela-auth.js',   array(), '1.0', true );
    wp_enqueue_script( 'vela-hero-slider', $uri . '/wp-js/vela-hero-slider.js', array( 'swiper' ), '1.0', true );
    wp_enqueue_script( 'vela-swipers',$uri . '/wp-js/vela-swipers.js',array( 'swiper' ), '1.0', true );

    // ارسال آدرس AJAX و nonce برای استفاده در فایل‌ها
    wp_localize_script( 'vela-ui', 'VelaWP', array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'vela_nonce' ),
    ) );
} );
```

> **بهینه‌سازی:** برای بارگذاری شرطی (conditional loading)، هر فایل را فقط روی
> قالب مرتبطش enqueue کنید — مثلاً `vela-shop` فقط روی `is_shop()` و `is_product_category()`.

---

## رابط مشترک: `window.Vela`

تمام ماژول‌ها متدها و state خود را روی `window.Vela` ثبت می‌کنند:

```js
Vela.state              // { cartCount, wishlistCount, qty, activePanel }
Vela.showToast(msg, type)        // success | error | info
Vela.openPanel(name) / closePanel(name)
Vela.openSearchModal() / closeSearchModal()
Vela.openCartModal()   / closeCartModal()
Vela.openWishlistModal()/ closeWishlistModal()
Vela.openAuthModal(tab)/ closeAuthModal()
Vela.addToCart(name, price) / Vela.toggleWishlist(btn)
Vela.initHeader() / initMegaMenu() / initMobileDrawer() / ...
```

هر فایل با `Vela.xxx = Vela.xxx || fn` کار می‌کند، پس ترتیب لود اهمیت کمتری دارد —
فقط `vela-ui.js` ترجیحاً اول باشد تا `state` و `showToast` زودتر ساخته شوند.

---

## بخش‌های علامت‌گذاری‌شده برای اتصال به وردپرس / WooCommerce

در فایل‌ها با کامنت `⚠️ WP / AJAX` مشخص شده‌اند:

| قابلیت | فایل | اقدام موردنیاز در وردپرس |
| --- | --- | --- |
| Add to cart واقعی | `vela-cart.js` | `woocommerce_ajax_add_to_cart` + آپدیت mini-cart با fragments |
| Mini-cart | `vela-cart.js` | رندر از widget «Mini Cart» به‌جای `_renderMiniCart` |
| Remove / update qty | `vela-cart.js` | `woocommerce_ajax_remove_from_cart` / `update_cart` |
| Live search | `vela-search.js` | endpoint `admin-ajax.php?action=vela_live_search` |
| جستجوهای اخیر | `vela-search.js` | localStorage یا user meta |
| Login / Register | `vela-auth.js` | wp-login / JWT Auth / افزونه Membership |
| Social login | `vela-auth.js` | Nextend Social Login یا OAuth سفارشی |
| فیلترهای shop | `vela-shop.js` | `WP_Query` با `tax_query` / `meta_query` روی `_price` |
| مرتب‌سازی | `vela-shop.js` | `orderby` / `order` (price, date, popularity) |
| Promo / coupon | `vela-cart.js` | WooCommerce `apply_coupon` |
| Checkout | `vela-cart.js` | Checkout/Payment گیت‌وی واقعی (جایگزین دموی چندمرحله‌ای) |
| Newsletter | `vela-cart.js` | Mailchimp یا افزونه خبرنامه |
| Variations محصول | `vela-product.js` | WooCommerce `found_variation` AJAX |
| Slides / loop ها | `vela-*.js` swiper ها | رندر از `WP_Query` در PHP |

---
