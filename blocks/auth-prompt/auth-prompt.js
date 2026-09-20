/**
 * auth-prompt — STATIC replica of the USTA Auth0 Universal Login "Sign In" surface
 * (prototype section.prompt-box of en-home-confirmation-html-proposed.html, plus the
 * Sign In/Sign Up tabs, the fixed UsableNet a11y toggle and the right-side photo
 * column). Schema: stardust/eds-schema/en-home-confirmation-html-proposed.json
 * (section "prompt-box", 25 items / 2 input-wrappers / 3 social forms).
 *
 * Disposition (stardust/dynamic-features.md): auth is decided-out — this is a STATIC
 * replica. Every form is action="#" and decorate() prevents submission; no real
 * authentication happens. External hrefs (account.usta.com / www.usta.com) stay
 * ABSOLUTE, as captured. The page's logo-only chrome (no nav/footer) is owned at the
 * page/content level (metadata nav/footer override), not by this block.
 *
 * Authoring rows (positional, one cell per row — content/en/home/confirmation.html):
 *   1. page heading <h1> ("Sign In")
 *   2. account-info line 1 — <p><strong>One USTA Account…</strong></p>
 *   3. account-info line 2 — <p><strong>Your USTA account works…</strong></p>
 *   4. parent copy paragraph (hidden header copy on the live widget)
 *   5. "Not sure if you already have a USTA account? Find it here." link paragraph
 *   6. username label ("Phone number or Email address *" — trailing * is wrapped
 *      in a presentational span.required, an EW2-allowed inner refinement)
 *   7. username error 1 (hidden, as captured)
 *   8. username error 2 (hidden, as captured)
 *   9. password label ("Password *")
 *  10. show-password tooltip (visually hidden, inside the eye-toggle button)
 *  11. password error 1 (hidden, as captured)
 *  12. password error 2 (hidden, as captured)
 *  13. "Forgot password?" link paragraph
 *  14. submit label ("SIGN IN" — fills the visible submit button; the prototype's
 *      second, visually-hidden submit receives a stripped presentational clone, EW4)
 *  15. "Don't have an account? <a>Sign up</a>" paragraph
 *  16. "Or" divider text
 *  17. social label — Google
 *  18. social label — Apple
 *  19. social label — Facebook
 *  20. side photo — <p><img></p> (decorative, alt=""), moved into the photo column
 *
 * Every authored element is NODE-SLOTTED (moved, never rebuilt). Labels, button
 * labels and the tooltip live inside <label>/<button> containers of the replicated
 * Auth0 widget — their indices survive so the texts remain editable-instrumented,
 * but per EW7 a <button> swallows canvas clicks; the controls stay operable in the
 * workspace (buttons work there; link navigation does not). The tab labels
 * ("Sign In"/"Sign Up") and the a11y-toggle label ("Enable accessibility") are fixed
 * chrome of the captured Auth0/UsableNet widgets and are NOT authored — they are
 * template strings, as captured.
 *
 * The hidden header copy repeats the account-info lines (live Auth0 DOM keeps a
 * hidden duplicate in .header-copy): it is filled with instrumentation-stripped
 * presentational clones (EW4) so the decorated DOM matches the captured surface.
 */

/* Auth0 state token, captured verbatim from the live ULP page (replica policy:
   external/auth surface stays as-captured; the forms never submit). */
const STATE = 'hKFo2SBvUmpwUlFvT1dLTGNPVXBoeHdwemlac09BaV90M2ZLTaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIFpuc3Z4dXF2aFRrVUNDYnRuODdTQ0VwNkVNdWN5SnJao2NpZNkgSE45UlJmRDFtNVJQa0FnVDR4WXkwbjF6TXJQeDlXUVc';

function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v);
  });
  kids.forEach((k) => { if (k) n.append(k); });
  return n;
}

// Presentational clones (the hidden header-copy duplicates, the second submit
// label) must not keep the editor's indices — one element per index (EW4).
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  el.removeAttribute('data-image-index');
  return el;
}

// Wrap a trailing bare " *" of an authored label paragraph in a presentational
// span.required (prototype: <span class="required" aria-hidden="true">*</span>).
// Inner restructuring only — the paragraph keeps its full textContent (EW2).
function splitAsterisk(p) {
  if (!p) return;
  const t = p.lastChild;
  if (t && t.nodeType === 3 && /\s\*\s*$/.test(t.textContent)) {
    t.textContent = t.textContent.replace(/\s\*\s*$/, ' ');
    p.append(h('span', { class: 'required', 'aria-hidden': 'true', text: '*' }));
  }
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;
  // Row → its single authored element (p / h1); cells hold one element each by
  // contract (see the JSDoc row list).
  const node = (i) => {
    const row = rows[i];
    if (!row) return null;
    const cell = row.firstElementChild || row;
    return cell.firstElementChild || cell;
  };

  const [
    heading, accountInfo1, accountInfo2, parentCopy, findAccount,
    usernameLabel, usernameErr1, usernameErr2,
    passwordLabel, showTip, passwordErr1, passwordErr2,
    forgot, submitLabel, alternate, orText,
    socialGoogle, socialApple, socialFacebook, sidePhoto,
  ] = [...Array(20).keys()].map(node);

  // ── UsableNet "Enable accessibility" toggle (fixed; expansion is pure CSS :hover,
  //    ported in auth-prompt.css — behavior-identical to the live widget) ──
  const toggle = h('div', { class: 'a11y-toggle', id: 'usntA42Toggle' },
    h('button', { id: 'usntA42Link', type: 'button' },
      h('div', { id: 'usntA42Txt', text: 'Enable accessibility' }),
      h('i', { id: 'usntA42Icon' })));

  // ── auth tabs (fixed chrome of the captured Auth0 surface) ──
  const tabs = h('div', { class: 'auth-tabs' },
    h('div', { class: 'auth-tabs__item auth-tabs__item--active', text: 'Sign In' }),
    h('div', { class: 'auth-tabs__item' },
      h('a', { id: 'sign-up-link', href: `https://account.usta.com/u/signup?state=${STATE}`, text: 'Sign Up' })));

  // ── screen header: h1 + the live widget's hidden header copy (stripped
  //    presentational clones of the account-info lines + the authored parent copy) ──
  const header = h('header', { class: 'screen-header', id: 'screen-header', tabindex: '-1' },
    h('div', { class: 'custom-prompt-logo', title: 'USTA-DIGITAL-PROD', hidden: '' }),
    h('img', {
      class: 'prompt-logo', src: '/assets/confirmation-usta-header-logo.png', alt: 'USTA-DIGITAL-PROD', hidden: '',
    }),
    heading ? h('div', { class: 'headline' }, heading) : null,
    h('div', { class: 'header-copy', hidden: '' },
      h('div', { class: 'usta-account-info' },
        accountInfo1 ? stripInstrumentation(accountInfo1.cloneNode(true)) : null,
        accountInfo2 ? stripInstrumentation(accountInfo2.cloneNode(true)) : null),
      parentCopy));

  // ── fields (labels are generated <label> wrappers; the authored label paragraph
  //    moves INSIDE so label[for] keeps the floated-label binding) ──
  splitAsterisk(usernameLabel);
  splitAsterisk(passwordLabel);

  const usernameField = h('div', { class: 'input-wrapper' },
    h('div', { class: 'field field--text' },
      h('label', { id: 'username-label', for: 'username' }, usernameLabel),
      h('input', {
        class: 'input', id: 'username', type: 'text', name: 'username', autocomplete: 'off', value: '',
      }),
      h('div', { id: 'username-error', class: 'error-message' })),
    h('div', { class: 'ulp-error-info', hidden: '' }, usernameErr1),
    h('div', { class: 'ulp-error-info', hidden: '' }, usernameErr2));

  const passwordField = h('div', { class: 'input-wrapper input-wrapper--password' },
    h('div', { class: 'field field--password' },
      h('label', { id: 'password-label', for: 'password' }, passwordLabel),
      h('input', {
        class: 'input', id: 'password', type: 'password', name: 'password', autocomplete: 'off', value: '',
      }),
      h('button', { type: 'button', class: 'button-icon' }, showTip, h('span', { class: 'password-icon' }))),
    h('div', { class: 'ulp-error-info', hidden: '' }, passwordErr1),
    h('div', { class: 'ulp-error-info', hidden: '' }, passwordErr2));

  // ── login form (STATIC replica: action="#", submission prevented below) ──
  const form = h('form', { class: 'login-form', action: '#', novalidate: '' },
    h('div', { class: 'sr-only', 'aria-live': 'assertive', 'aria-atomic': 'true' }),
    h('button', {
      type: 'submit', class: 'visually-hidden-submit', value: 'default', 'aria-hidden': 'true', tabindex: '-1', name: 'action',
    }, submitLabel ? stripInstrumentation(submitLabel.cloneNode(true)) : null),
    h('input', { type: 'hidden', name: 'state', value: STATE }),
    h('div', { class: 'form-content-start' },
      h('div', { class: 'usta-account-info' }, accountInfo1, accountInfo2),
      h('div', { class: 'center-container' }, findAccount),
      h('input', { type: 'hidden', name: 'ulp-login', id: 'login-type', value: 'email' })),
    h('div', { class: 'fields' },
      h('div', { class: 'fields__inner' }, usernameField, passwordField)),
    h('div', { class: 'forgot' }, forgot),
    h('div', { class: 'submit-wrap' },
      h('button', {
        class: 'submit-btn', type: 'submit', name: 'action', value: 'default', disabled: '',
      }, submitLabel)));

  // ── alternate action + OR divider + social forms ──
  const socialForm = (connection, provider, labelNode) => h('form', { class: 'social-form', action: '#', novalidate: '' },
    h('input', { type: 'hidden', name: 'state', value: STATE }),
    h('input', { type: 'hidden', name: 'connection', value: connection }),
    h('button', { class: 'social-btn', type: 'submit', 'data-provider': provider },
      h('span', { class: `social-icon social-icon--${provider}` }), labelNode));

  const formArea = h('div', { class: 'form-area' },
    form,
    h('div', { class: 'form-footer-start', hidden: '' }),
    h('div', { class: 'alternate-action' }, alternate),
    h('div', { class: 'form-footer-end' }),
    h('div', { class: 'or-divider' }, orText),
    h('div', { class: 'social-group' },
      h('div', { class: 'social-start', hidden: '' }),
      socialForm('google-oauth2', 'google', socialGoogle),
      socialForm('apple', 'apple', socialApple),
      socialForm('facebook', 'facebook', socialFacebook),
      h('div', { class: 'social-end', hidden: '' })));

  // <section>, never <main> — the page already has one (anti-pattern 17).
  const widget = h('section', { class: 'widget login', id: 'mainContent' },
    h('section', { class: 'prompt-box' },
      h('div', { class: 'prompt-card' }, header, formArea)));

  const sideImage = h('div', { class: 'side-image-wrapper' },
    h('p', { class: 'white-horizontal-line' }),
    sidePhoto ? h('div', { class: 'side-image' }, sidePhoto) : null,
    h('p', { class: 'white-horizontal-line white-horizontal-line--bottom' }));

  const mainWrapper = h('div', { class: 'main-wrapper' },
    h('div', { class: 'widget-wrapper' }, tabs, widget),
    sideImage);

  block.replaceChildren(toggle, mainWrapper);

  // STATIC replica: no real auth (dynamics disposition "decided-out") — swallow
  // every submission; the controls remain focusable/clickable exactly as captured.
  block.querySelectorAll('form').forEach((f) => {
    f.addEventListener('submit', (e) => e.preventDefault());
  });

  // Ported from prototype assets/confirmation.js — initial focus state mirrors the
  // live ULP page: username autofocuses on ≥601px viewports only (Auth0 ULP skips
  // autofocus on small screens; threshold = the ULP stylesheet's 600px breakpoint).
  if (window.matchMedia('(min-width: 601px)').matches) {
    const el = block.querySelector('#username');
    if (el) el.focus();
  }

  // Ported from prototype assets/confirmation.js — show-password toggle: flips the
  // input type and swaps the eye/eye-off mask via the .show class (instant, no
  // animation); the tooltip paragraph follows the state.
  block.querySelectorAll('.field--password .button-icon').forEach((btn) => {
    btn.addEventListener('click', () => {
      const field = btn.closest('.field--password');
      const input = field.querySelector('input');
      const show = field.classList.toggle('show');
      input.type = show ? 'text' : 'password';
      const tip = btn.querySelector('p');
      if (tip) tip.textContent = show ? 'Hide password' : 'Show password';
    });
  });
}
