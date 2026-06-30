/* ============================================================
   VELA — Auth Modal Module
   Login + Register tabs, form validation
   ============================================================ */
'use strict';

function openAuthModal(tab) {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.removeAttribute('aria-hidden');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (tab) _switchAuthTab(tab);
  setTimeout(() => {
    const firstInput = modal.querySelector('.auth-panel.is-active input');
    firstInput?.focus();
  }, 60);
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  if (modal.contains(document.activeElement)) document.activeElement.blur();
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function _switchAuthTab(name) {
  document.querySelectorAll('.auth-tab').forEach(t => {
    t.classList.toggle('is-active', t.dataset.tab === name);
    t.setAttribute('aria-selected', String(t.dataset.tab === name));
  });
  document.querySelectorAll('.auth-panel').forEach(p => {
    p.classList.toggle('is-active', p.id === 'auth-panel-' + name);
  });
}

function switchAuthTab(btn) {
  _switchAuthTab(btn.dataset.tab);
  const firstInput = document.querySelector('#auth-panel-' + btn.dataset.tab + ' input');
  firstInput?.focus();
}

function handleLogin(e) {
  e.preventDefault();
  const btn  = e.target.querySelector('.auth-submit');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 600ms linear infinite">⟳</span> در حال ورود…';
  setTimeout(() => {
    closeAuthModal();
    showToast('خوش آمدید! ورود موفق ✓', 'success');
    btn.disabled = false;
    btn.innerHTML = orig;
  }, 1200);
}

function handleRegister(e) {
  e.preventDefault();
  const pass  = document.getElementById('regPass')?.value  || '';
  const pass2 = document.getElementById('regPass2')?.value || '';
  if (pass !== pass2) { showToast('رمز عبور و تکرار آن یکسان نیستند', 'error'); return; }
  if (pass.length < 6) { showToast('رمز عبور باید حداقل ۶ کاراکتر باشد', 'error'); return; }
  const btn  = e.target.querySelector('.auth-submit');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 600ms linear infinite">⟳</span> در حال ثبت‌نام…';
  setTimeout(() => {
    closeAuthModal();
    showToast('حساب کاربری با موفقیت ایجاد شد 🎉', 'success');
    btn.disabled = false;
    btn.innerHTML = orig;
  }, 1400);
}

function toggleAuthPass(btn) {
  const input = btn.closest('.auth-field__pass-wrap')?.querySelector('input');
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  const eyeEl    = btn.querySelector('.icon-eye');
  const eyeOffEl = btn.querySelector('.icon-eye-off');
  if (eyeEl)    eyeEl.style.display    = isPass ? 'none' : '';
  if (eyeOffEl) eyeOffEl.style.display = isPass ? '' : 'none';
}

function initAuthActions() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    switch (el.dataset.action) {
      case 'close-auth-modal':
        closeAuthModal();
        break;
      case 'switch-auth-tab':
        switchAuthTab(el);
        break;
      case 'toggle-auth-pass':
        toggleAuthPass(el);
        break;
      case 'social-login':
        showToast('در حال پیاده‌سازی…', 'info');
        break;
    }
  });

  document.addEventListener('submit', e => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    if (form.dataset.form === 'login')    handleLogin(e);
    if (form.dataset.form === 'register') handleRegister(e);
  });
}
