/* ============================================================
   VELA — Search Modal Module
   ============================================================ */
'use strict';

/* ══════════════════════════════════════════════════════════
   SEARCH MODAL
══════════════════════════════════════════════════════════ */
function initSearchModal() {
  const input     = document.getElementById('searchModalInput');
  const clearBtn  = document.getElementById('searchModalClear');
  const cancelBtn = document.getElementById('searchModalCancel');
  const backdrop  = document.getElementById('searchModalBackdrop');

  if (!input) return;

  renderSearchDefault();

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn?.classList.toggle('visible', q.length > 0);
    q.length >= 1 ? renderSearchResults(q) : renderSearchDefault();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearchModal();
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('visible');
    renderSearchDefault();
    input.focus();
  });

  cancelBtn?.addEventListener('click', closeSearchModal);
  backdrop?.addEventListener('click', closeSearchModal);
}

function openSearchModal() {
  openPanel('search');
  document.getElementById('searchModal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('searchModalInput')?.focus(), 300);
}

function closeSearchModal() {
  closePanel('search');
  document.getElementById('searchModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderSearchDefault() {
  const body = document.getElementById('searchModalBody');
  if (!body) return;
  body.innerHTML = `
    <p class="search-section-title">جستجوهای اخیر</p>
    <div class="search-chips">
      ${RECENT_SEARCHES.map(s => `
        <button class="search-chip" onclick="fillSearch('${s}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          ${s}
        </button>`).join('')}
    </div>
    <p class="search-section-title">پرجستجوها</p>
    <div class="search-trending">
      ${TRENDING.map((t, i) => `
        <div class="search-trending__item" onclick="fillSearch('${t.text}')">
          <span class="search-trending__rank${t.hot ? ' search-trending__rank--hot' : ''}">${i + 1}</span>
          <span class="search-trending__text">${t.text}</span>
          ${t.hot ? '<span>🔥</span>' : ''}
        </div>`).join('')}
    </div>`;
}

function renderSearchResults(query) {
  const body = document.getElementById('searchModalBody');
  if (!body) return;
  const q = query.toLowerCase();
  const matches = SEARCH_DATA.filter(p =>
    p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q)
  ).slice(0, 8);

  if (!matches.length) {
    body.innerHTML = `<div class="search-no-results">
      <div style="font-size:2.5rem;margin-bottom:var(--s-3)">🔍</div>
      <p>نتیجه‌ای برای <strong>"${query}"</strong> یافت نشد</p>
    </div>`;
    return;
  }

  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hi  = t => t.replace(new RegExp(esc(query), 'gi'), m => `<mark>${m}</mark>`);

  body.innerHTML = `
    <p class="search-section-title">${matches.length} نتیجه</p>
    <div class="search-results">
      ${matches.map(p => `
        <a href="product.html" class="search-result-item">
          <div class="search-result-item__thumb">${p.emoji}</div>
          <div class="search-result-item__info">
            <div class="search-result-item__name">${hi(p.name)}</div>
            <div class="search-result-item__cat">${p.cat}</div>
          </div>
          <div class="search-result-item__price">${p.price}</div>
        </a>`).join('')}
    </div>
    <button class="search-all-btn" onclick="showToast('در حال جستجو…','info')">
      مشاهده همه نتایج «${query}»
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>`;
}

function fillSearch(text) {
  const input    = document.getElementById('searchModalInput');
  const clearBtn = document.getElementById('searchModalClear');
  if (!input) return;
  input.value = text;
  clearBtn?.classList.add('visible');
  renderSearchResults(text);
  input.focus();
}
