# VELA — JavaScript مستقل برای وردپرس (پوشه‌ی `js/`)

این پوشه شامل نسخه‌ی **ریفکتور شده و مستقل** از اسکریپت‌های قالب است که برای
استفاده در **قالب وردپرس** آماده شده است. فایل‌های اصلی داخل `js/` دست‌نخورده باقی
مانده‌اند و اینجا نسخه‌های جدید با نام `kara-*.js` ساخته شده‌اند.

---

## اصول طراحی (همه‌ی فایل‌ها یکسان رعایت شده)

| اصل | توضیح |
| --- | --- |
| **مستقل** | هر فایل داخل یک IIFE است و DOMContentLoaded اختصاصی خود را دارد. هیچ coordinator مرکزی (مثل `app.js`) وجود ندارد. |
| **بدون وابستگی سخت** | همه‌ی ارتباط‌ها از طریق `window.Kara` (namespace) با fallback است. اگر فایلی لود نشد، بقیه خطا نمی‌دهند — فقط feature مربوطه غیرفعال می‌ماند. |
| **پیشوند `kara_`** | توابع اصلی با پیشوند `kara` نام‌گذاری شده‌اند (مثل `karaInitHeader`, `karaAddToCart`). |
| **compat alias** | برای سازگاری با HTML فعلی، نام‌های قدیمی هم روی `window` ست شده‌اند (مثل `addToCart`, `openSearchModal`). |
| **کامنت‌های WP/AJAX** | بخش‌هایی که بعداً باید به AJAX یا WooCommerce وصل شوند (add to cart, live search, login, …) با `⚠️` مشخص شده‌اند. |
| **حفظ functionality** | تمام رفتارهای اصلی قالب HTML حفظ شده‌اند. |

---

## فایل‌ها

| فایل | جایگزین | مسئولیت |
| --- | --- | --- |
| `kara-ui.js` | `app.js` + `ui.js` | State مشترک · Panel manager · Toast · Countdown · Page transitions · Scroll-top · Global animations |
| `kara-header.js` | `header.js` | Sticky offset · Scroll behavior · Nav underline · Auto-hide · Header actions |
| `kara-mega-menu.js` | `mega-menu.js` | باز/بسته کردن مگامنو · تب‌ها · backdrop |
| `kara-mobile-nav.js` | `mobile-nav.js` | Drawer موبایل · Bottom nav · FAB · Support sheet |
| `kara-search.js` | `search.js` | مودال جستجو · نتایج زنده · جستجوهای اخیر/پرجستجو |
| `kara-shop.js` | `shop.js` | فیلتر موبایل · مرتب‌سازی · chips · درخت دسته‌بندی · محدوده قیمت |
| `kara-product.js` | `product.js` | گالری · quantity · variants · تب‌ها · sticky CTA |
| `kara-cart.js` | `cart.js` | سبد · علاقه‌مندی · mini-modals · checkout · خبرنامه |
| `kara-auth.js` | `auth.js` | مودال ورود/ثبت‌نام · تب‌ها · اعتبارسنجی |
| `kara-hero-slider.js` | `hero-slider.js` | اسلایدر هیرو + swiper دسته‌بندی |
| `kara-swipers.js` | `swipers.js` | swiper محصول/نظرات/پست/برند/شگفت‌انگیز |

---

## ترتیب لود پیشنهادی در `functions.php`

> **مهم:** `swiper-bundle.min.js` حتماً **قبل از** فایل‌های swiper لود شود.

```php
add_action( 'wp_enqueue_scripts', function () {
    $uri = get_template_directory_uri();

    // Swiper library (فقط روی صفحه‌هایی که اسلایدر دارند)
    wp_enqueue_script( 'swiper', $uri . '/js/swiper-bundle.min.js', array(), null, true );

    // هسته‌ی UI را اول لود کن (state و showToast را فراهم می‌کند)
    wp_enqueue_script( 'kara-ui',    $uri . '/wp-js/kara-ui.js',    array(), '1.0', true );
    wp_enqueue_script( 'kara-header', $uri . '/wp-js/kara-header.js',  array(), '1.0', true );
    wp_enqueue_script( 'kara-mega-menu', $uri . '/wp-js/kara-mega-menu.js', array(), '1.0', true );
    wp_enqueue_script( 'kara-mobile-nav', $uri . '/wp-js/kara-mobile-nav.js', array(), '1.0', true );
    wp_enqueue_script( 'kara-search', $uri . '/wp-js/kara-search.js', array(), '1.0', true );
    wp_enqueue_script( 'kara-shop',   $uri . '/wp-js/kara-shop.js',   array(), '1.0', true );
    wp_enqueue_script( 'kara-product',$uri . '/wp-js/kara-product.js',array(), '1.0', true );
    wp_enqueue_script( 'kara-cart',   $uri . '/wp-js/kara-cart.js',   array(), '1.0', true );
    wp_enqueue_script( 'kara-auth',   $uri . '/wp-js/kara-auth.js',   array(), '1.0', true );
    wp_enqueue_script( 'kara-hero-slider', $uri . '/wp-js/kara-hero-slider.js', array( 'swiper' ), '1.0', true );
    wp_enqueue_script( 'kara-swipers',$uri . '/wp-js/kara-swipers.js',array( 'swiper' ), '1.0', true );

    // ارسال آدرس AJAX و nonce برای استفاده در فایل‌ها
    wp_localize_script( 'kara-ui', 'KaraWP', array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'kara_nonce' ),
    ) );
} );
```

> **بهینه‌سازی:** برای بارگذاری شرطی (conditional loading)، هر فایل را فقط روی
> قالب مرتبطش enqueue کنید — مثلاً `kara-shop` فقط روی `is_shop()` و `is_product_category()`.

---

## رابط مشترک: `window.Kara`

تمام ماژول‌ها متدها و state خود را روی `window.Kara` ثبت می‌کنند:

```js
Kara.state              // { cartCount, wishlistCount, qty, activePanel }
Kara.showToast(msg, type)        // success | error | info
Kara.openPanel(name) / closePanel(name)
Kara.openSearchModal() / closeSearchModal()
Kara.openCartModal()   / closeCartModal()
Kara.openWishlistModal()/ closeWishlistModal()
Kara.openAuthModal(tab)/ closeAuthModal()
Kara.addToCart(name, price) / Kara.toggleWishlist(btn)
Kara.initHeader() / initMegaMenu() / initMobileDrawer() / ...
```

هر فایل با `Kara.xxx = Kara.xxx || fn` کار می‌کند، پس ترتیب لود اهمیت کمتری دارد —
فقط `kara-ui.js` ترجیحاً اول باشد تا `state` و `showToast` زودتر ساخته شوند.

---

## بخش‌های علامت‌گذاری‌شده برای اتصال به وردپرس / WooCommerce

در فایل‌ها با کامنت `⚠️ WP / AJAX` مشخص شده‌اند:

| قابلیت | فایل | اقدام موردنیاز در وردپرس |
| --- | --- | --- |
| Add to cart واقعی | `kara-cart.js` | `woocommerce_ajax_add_to_cart` + آپدیت mini-cart با fragments |
| Mini-cart | `kara-cart.js` | رندر از widget «Mini Cart» به‌جای `_renderMiniCart` |
| Remove / update qty | `kara-cart.js` | `woocommerce_ajax_remove_from_cart` / `update_cart` |
| Live search | `kara-search.js` | endpoint `admin-ajax.php?action=kara_live_search` |
| جستجوهای اخیر | `kara-search.js` | localStorage یا user meta |
| Login / Register | `kara-auth.js` | wp-login / JWT Auth / افزونه Membership |
| Social login | `kara-auth.js` | Nextend Social Login یا OAuth سفارشی |
| فیلترهای shop | `kara-shop.js` | `WP_Query` با `tax_query` / `meta_query` روی `_price` |
| مرتب‌سازی | `kara-shop.js` | `orderby` / `order` (price, date, popularity) |
| Promo / coupon | `kara-cart.js` | WooCommerce `apply_coupon` |
| Checkout | `kara-cart.js` | Checkout/Payment گیت‌وی واقعی (جایگزین دموی چندمرحله‌ای) |
| Newsletter | `kara-cart.js` | Mailchimp یا افزونه خبرنامه |
| Variations محصول | `kara-product.js` | WooCommerce `found_variation` AJAX |
| Slides / loop ها | `kara-*.js` swiper ها | رندر از `WP_Query` در PHP |

---
