/* ============================================================
   VELA — Auth Modal Module  (vela-auth.js)
   مستقل · بدون coordinator
   شامل: Open/close modal · Login/Register tabs · Validation
          · Password show/hide · Social login placeholder
   ============================================================
   وابستگی‌ها (همه از طریق namespace با fallback):
     - Vela.showToast  (از vela-ui.js) — اختیاری، فقط پیام
   ────────────────────────────────────────────────────────────
   ⚠️  بخش‌های WordPress:
     - handleLogin / handleRegister فعلاً فقط شبیه‌سازی هستند. در
       وردپرس به یکی از این روش‌ها وصل کنید:
         · wp-login.php (POST به wp-login با log/pwd)
         · افزونه‌ی Membership / WooCommerce My Account
         · REST: /wp-json/jwt-auth/v1/token (JWT Auth plugin)
       پس از ورود موفق، nonce و cookie را ست کرده و UI را آپدیت کنید.
     - social-login: ورود با گوگل/فیسبوک نیاز به افزونه Nextend Social
       Login یا OAuth سفارشی دارد.
   ============================================================ */
(function () {
  'use strict';

  var Vela = (window.Vela = window.Vela || {});
  var toast = function (msg, type) {
    if (typeof Vela.showToast === 'function') Vela.showToast(msg, type);
  };

  /* ══════════════════════════════════════════════════════════
     MODAL OPEN / CLOSE
  ═══════════════════════════════════════════════════════════ */
  function velaOpenAuthModal(tab) {
    var modal = document.getElementById('authModal');
    if (!modal) return;
    modal.removeAttribute('aria-hidden');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (tab) _velaSwitchAuthTab(tab);
    setTimeout(function () {
      var activePanel = modal.querySelector('.auth-panel.is-active input');
      if (activePanel) activePanel.focus();
    }, 60);
  }

  function velaCloseAuthModal() {
    var modal = document.getElementById('authModal');
    if (!modal) return;
    if (modal.contains(document.activeElement)) document.activeElement.blur();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function _velaSwitchAuthTab(name) {
    document.querySelectorAll('.auth-tab').forEach(function (t) {
      var on = t.dataset.tab === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('.auth-panel').forEach(function (p) {
      p.classList.toggle('is-active', p.id === 'auth-panel-' + name);
    });
  }

  function velaSwitchAuthTab(btn) {
    _velaSwitchAuthTab(btn.dataset.tab);
    var firstInput = document.querySelector('#auth-panel-' + btn.dataset.tab + ' input');
    if (firstInput) firstInput.focus();
  }

  /* ══════════════════════════════════════════════════════════
     FORM HANDLERS  —  شبیه‌سازی. در وردپرس به auth واقعی وصل شود.
  ═══════════════════════════════════════════════════════════ */
  function velaHandleLogin(e) {
    e.preventDefault();
    var btn  = e.target.querySelector('.auth-submit');
    var orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-block;animation:spin 600ms linear infinite">⟳</span> در حال ورود…';
    setTimeout(function () {
      velaCloseAuthModal();
      toast('خوش آمدید! ورود موفق ✓', 'success');
      btn.disabled = false;
      btn.innerHTML = orig;
    }, 1200);

    /* ── WP: ورود واقعی ──
       var form = new FormData(e.target);
       fetch(Vela.ajaxUrl, { method:'POST', body: new URLSearchParams({
         action:'vela_login', log: form.get('log'), pwd: form.get('pwd'),
         nonce: Vela.loginNonce }) })
         .then(… redirect or refresh header); */
  }

  function velaHandleRegister(e) {
    e.preventDefault();
    var pass  = (document.getElementById('regPass')  || {}).value || '';
    var pass2 = (document.getElementById('regPass2') || {}).value || '';
    if (pass !== pass2) { toast('رمز عبور و تکرار آن یکسان نیستند', 'error'); return; }
    if (pass.length < 6) { toast('رمز عبور باید حداقل ۶ کاراکتر باشد', 'error'); return; }
    var btn  = e.target.querySelector('.auth-submit');
    var orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-block;animation:spin 600ms linear infinite">⟳</span> در حال ثبت‌نام…';
    setTimeout(function () {
      velaCloseAuthModal();
      toast('حساب کاربری با موفقیت ایجاد شد 🎉', 'success');
      btn.disabled = false;
      btn.innerHTML = orig;
    }, 1400);

    /* ── WP: ثبت‌نام واقعی با wp_create_user / wp_insert_user ── */
  }

  /* ══════════════════════════════════════════════════════════
     PASSWORD VISIBILITY TOGGLE
  ═══════════════════════════════════════════════════════════ */
  function velaToggleAuthPass(btn) {
    var wrap = btn.closest('.auth-field__pass-wrap');
    var input = wrap ? wrap.querySelector('input') : null;
    if (!input) return;
    var isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    var eyeEl    = btn.querySelector('.icon-eye');
    var eyeOffEl = btn.querySelector('.icon-eye-off');
    if (eyeEl)    eyeEl.style.display    = isPass ? 'none' : '';
    if (eyeOffEl) eyeOffEl.style.display = isPass ? '' : 'none';
  }

  /* ══════════════════════════════════════════════════════════
     AUTH ACTIONS  —  delegate کلیک/submit
  ═══════════════════════════════════════════════════════════ */
  function velaInitAuthActions() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action]');
      if (!el) return;
      switch (el.dataset.action) {
        case 'close-auth-modal':
          velaCloseAuthModal();
          break;
        case 'switch-auth-tab':
          velaSwitchAuthTab(el);
          break;
        case 'toggle-auth-pass':
          velaToggleAuthPass(el);
          break;
        case 'social-login':
          toast('در حال پیاده‌سازی…', 'info');
          /* ── WP: redirect به OAuth provider (Nextend Social Login) ── */
          break;
      }
    });

    document.addEventListener('submit', function (e) {
      var form = e.target.closest('[data-form]');
      if (!form) return;
      if (form.dataset.form === 'login')    velaHandleLogin(e);
      if (form.dataset.form === 'register') velaHandleRegister(e);
    });
  }

  /* ══════════════════════════════════════════════════════════
     EXPOSE  +  compat aliases
  ═══════════════════════════════════════════════════════════ */
  Vela.openAuthModal      = Vela.openAuthModal      || velaOpenAuthModal;
  Vela.closeAuthModal     = Vela.closeAuthModal     || velaCloseAuthModal;
  Vela.switchAuthTab      = Vela.switchAuthTab      || velaSwitchAuthTab;
  Vela.handleLogin        = Vela.handleLogin        || velaHandleLogin;
  Vela.handleRegister     = Vela.handleRegister     || velaHandleRegister;
  Vela.toggleAuthPass     = Vela.toggleAuthPass     || velaToggleAuthPass;
  Vela.initAuthActions    = Vela.initAuthActions    || velaInitAuthActions;

  /* compat با کد قدیمی (global‌های نام‌دار) */
  if (!window.openAuthModal)   window.openAuthModal   = velaOpenAuthModal;
  if (!window.closeAuthModal)  window.closeAuthModal  = velaCloseAuthModal;
  if (!window.switchAuthTab)   window.switchAuthTab   = velaSwitchAuthTab;
  if (!window.handleLogin)     window.handleLogin     = velaHandleLogin;
  if (!window.handleRegister)  window.handleRegister  = velaHandleRegister;
  if (!window.toggleAuthPass)  window.toggleAuthPass  = velaToggleAuthPass;
  if (!window.initAuthActions) window.initAuthActions = velaInitAuthActions;

  document.addEventListener('DOMContentLoaded', velaInitAuthActions);
})();
