# VELA — JS Architecture

## ترتیب لود (مهم)

```
header.js         — regular script
mega-menu.js      — type="module"
mobile-nav.js     — type="module"
ui.js             — regular script
search.js         — regular script
shop.js           — regular script
product.js        — regular script
cart.js           — regular script
app.js            — regular script  ← آخرین، state را تعریف می‌کند
```

## فایل‌ها

| فایل | محتوا |
|------|-------|
| `app.js` | `state` (shared global)، داده‌های جستجو، Panel Manager، `DOMContentLoaded` init |
| `header.js` | scroll sticky، underline انیمیشن nav، trigger سرچ |
| `mega-menu.js` | open/close مگا منو، tab switching، backdrop |
| `mobile-nav.js` | drawer موبایل، bottom nav، FAB، accordion دسته‌بندی |
| `ui.js` | `showToast`، `scrollCarousel`، countdown، page transitions، keyframe animations |
| `search.js` | مودال جستجو: open/close، render نتایج، fillSearch |
| `shop.js` | filter sheet موبایل، sidebar فیلترها، sort bar، price range slider |
| `product.js` | گالری محصول، تنظیم تعداد، انتخاب رنگ/سایز، tabs، sticky CTA |
| `cart.js` | سبد خرید، wishlist، cart page، checkout steps، newsletter |

## وابستگی‌های کلیدی

- `state` در `app.js` تعریف می‌شود — همه فایل‌ها به عنوان global به آن دسترسی دارند
- `SEARCH_DATA`, `RECENT_SEARCHES`, `TRENDING` در `app.js` هستند — توسط `search.js` استفاده می‌شوند
- `showToast` در `ui.js` — از همه فایل‌های دیگر صدا زده می‌شود
- `openPanel` / `closePanel` در `app.js` — توسط `search.js` و `shop.js` استفاده می‌شوند



