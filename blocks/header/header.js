import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — redballtennis.com replica chrome.
 *
 * Renders the gated prototype chrome (stardust/prototypes/index-proposed.html,
 * styles lifted from canon.css) from the authored /nav document
 * (eds/content/nav.html):
 *   section 1: brand — logo link (desktop img) + mobile logo img
 *   section 2: main nav — ul of links; an li without a link is the
 *              mobile-only "VISIT OUR OTHER SITES" dropdown trigger
 *   section 3: USTA SITES — pill label p, panel icon img, panel heading p,
 *              ul of external site links
 *   section 4: breadcrumb map — ul of a[href] -> crumb label, first entry = home
 *
 * Behaviors ported behavior-identically from stardust/prototypes/assets/chrome.js
 * (gated against live): USTA SITES flyout (Escape/click-outside close,
 * aria-expanded), hamburger overlay menu (body.menu-open), mobile submenu toggle.
 */

function normalizePath(p) {
  let out = p.replace(/\.html$/, '').replace(/\/+$/, '');
  if (out === '' || out === '/index' || out === '/en/home') out = '/';
  return out;
}

function currentPath() {
  return normalizePath(window.location.pathname);
}

function makeExternal(a) {
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener');
}

function buildTopbar(sitesSection) {
  const ps = [...sitesSection.querySelectorAll('p')];
  const labelP = ps.find((p) => !p.querySelector('img') && /usta sites/i.test(p.textContent));
  const iconP = ps.find((p) => p.querySelector('img'));
  const headingP = ps.find((p) => p !== labelP && p !== iconP);
  const sitesUl = sitesSection.querySelector('ul');

  const pill = document.createElement('button');
  pill.className = 'sites__pill';
  pill.type = 'button';
  pill.setAttribute('aria-expanded', 'false');
  pill.setAttribute('aria-controls', 'sites-panel');
  const icon = document.createElement('span');
  icon.className = 'sites__icon';
  icon.setAttribute('aria-hidden', 'true');
  pill.append(icon);
  if (labelP) {
    labelP.classList.add('sites__label');
    pill.append(labelP);
  }

  const panel = document.createElement('div');
  panel.className = 'sites__panel';
  panel.id = 'sites-panel';
  const panelImage = document.createElement('div');
  panelImage.className = 'sites__panel-image';
  if (iconP) panelImage.append(iconP);
  if (headingP) panelImage.append(headingP);
  panel.append(panelImage);
  if (sitesUl) {
    sitesUl.classList.add('sites__list');
    sitesUl.querySelectorAll('a').forEach(makeExternal);
    panel.append(sitesUl);
  }
  const close = document.createElement('button');
  close.className = 'sites__close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');
  panel.append(close);

  const sites = document.createElement('div');
  sites.className = 'sites';
  sites.append(pill, panel);

  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.append(sites);
  return topbar;
}

function buildMainbar(brandSection, navSection, sitesSection) {
  /* brand: authored logo link + desktop/mobile logo imgs */
  const brandLink = brandSection.querySelector('a[href]');
  const brandImgs = [...brandSection.querySelectorAll('img')];
  const logo = document.createElement('div');
  logo.className = 'mainbar__logo';

  const hamburger = document.createElement('button');
  hamburger.className = 'mainbar__hamburger';
  hamburger.type = 'button';
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'main-nav');
  hamburger.setAttribute('aria-label', 'Menu');
  const iconMenu = document.createElement('img');
  iconMenu.className = 'icon-menu';
  iconMenu.src = '/assets/hamburger.svg';
  iconMenu.alt = '';
  iconMenu.setAttribute('aria-hidden', 'true');
  const iconCancel = document.createElement('img');
  iconCancel.className = 'icon-cancel';
  iconCancel.src = '/assets/cancel.svg';
  iconCancel.alt = '';
  iconCancel.setAttribute('aria-hidden', 'true');
  hamburger.append(iconMenu, iconCancel);
  logo.append(hamburger);

  if (brandLink) {
    brandLink.classList.add('mainbar__logo-link');
    if (brandImgs[0]) {
      brandImgs[0].classList.add('mainbar__logo-img');
      if (brandImgs[0].closest('a') !== brandLink) brandLink.append(brandImgs[0]);
    }
    if (brandImgs[1]) {
      brandImgs[1].classList.add('mainbar__logo-img', 'mainbar__logo-img--mobile');
      brandLink.append(brandImgs[1]);
    }
    logo.append(brandLink);
  }

  /* main nav: authored ul; an li without a link is the sites dropdown trigger */
  const nav = document.createElement('nav');
  nav.className = 'mainnav';
  nav.id = 'main-nav';
  nav.setAttribute('aria-label', 'Main menu');

  const list = navSection.querySelector('ul');
  if (list) {
    list.classList.add('mainnav__list');
    const path = currentPath();
    [...list.children].forEach((li) => {
      li.classList.add('mainnav__item');
      const a = li.querySelector(':scope > a') || li.querySelector(':scope > p > a');
      if (a) {
        if (a.closest('p') && a.closest('p').parentElement === li) {
          li.append(a); // normalize pipeline-wrapped trigger links (#98)
          const p = li.querySelector(':scope > p');
          if (p && !p.textContent.trim()) p.remove();
        }
        a.classList.add('mainnav__link');
        const href = normalizePath(new URL(a.href, window.location).pathname);
        if (href !== '/' && href === path) {
          a.classList.add('mainnav__link--active');
          a.setAttribute('aria-current', 'page');
        }
      } else {
        /* mobile-only VISIT OUR OTHER SITES dropdown */
        li.classList.add('mainnav__item--dropdown');
        const text = li.textContent.trim();
        li.textContent = '';
        const dropLink = document.createElement('a');
        dropLink.className = 'mainnav__link';
        dropLink.href = '';
        dropLink.textContent = text;
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'mainnav__toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'sites-sub');
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = text;
        toggle.append(sr);
        li.append(dropLink, toggle);
        const sitesUl = sitesSection && sitesSection.querySelector('ul');
        if (sitesUl) {
          const sub = sitesUl.cloneNode(true);
          sub.classList.remove('sites__list');
          sub.classList.add('mainnav__sub');
          sub.id = 'sites-sub';
          sub.querySelectorAll('a').forEach(makeExternal);
          li.append(sub);
        }
      }
    });
    nav.append(list);
  }

  const inner = document.createElement('div');
  inner.className = 'mainbar__inner';
  inner.append(logo, nav);

  const mainbar = document.createElement('div');
  mainbar.className = 'mainbar';
  mainbar.append(inner);
  return mainbar;
}

function buildBreadcrumb(crumbSection) {
  const entries = crumbSection
    ? [...crumbSection.querySelectorAll('a')].map((a) => ({
      href: normalizePath(new URL(a.href, window.location).pathname),
      label: a.textContent.trim(),
    }))
    : [];
  const home = entries[0] || { href: '/', label: 'Home' };
  const homeHref = home.href;

  const path = currentPath();
  const is404 = /page not found|^404$/i.test(document.title.trim())
    || path === '/en/home/404' || path.endsWith('/404');
  const current = entries.find((e) => e.href === path && e.href !== '/');

  const ol = document.createElement('ol');
  if (is404 || current) {
    const label = is404 ? (entries.find((e) => e.label === '404') || { label: '404' }).label
      : current.label;
    const liHome = document.createElement('li');
    liHome.className = 'breadcrumb__item';
    const homeA = document.createElement('a');
    homeA.className = 'breadcrumb__link';
    homeA.href = homeHref || '/';
    homeA.textContent = home.label;
    const divider = document.createElement('span');
    divider.className = 'breadcrumb__divider';
    divider.textContent = '>';
    liHome.append(homeA, divider);
    const liCurrent = document.createElement('li');
    liCurrent.className = 'breadcrumb__item';
    liCurrent.setAttribute('aria-current', 'page');
    liCurrent.textContent = label;
    ol.append(liHome, liCurrent);
  } else {
    const li = document.createElement('li');
    li.className = 'breadcrumb__item';
    li.setAttribute('aria-current', 'page');
    li.textContent = home.label;
    ol.append(li);
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(ol);
  const wrap = document.createElement('div');
  wrap.className = 'breadcrumb__wrap';
  wrap.append(nav);
  const breadcrumb = document.createElement('div');
  breadcrumb.className = 'breadcrumb';
  breadcrumb.append(wrap);
  return breadcrumb;
}

/* behaviors ported verbatim from stardust/prototypes/assets/chrome.js */
function wireInteractions(root) {
  /* USTA SITES dropdown */
  const sites = root.querySelector('.sites');
  const pill = root.querySelector('.sites__pill');
  const closeBtn = root.querySelector('.sites__close');
  if (sites && pill) {
    const setSites = (open) => {
      if (open) sites.setAttribute('data-open', ''); else sites.removeAttribute('data-open');
      pill.setAttribute('aria-expanded', String(open));
    };
    pill.addEventListener('click', () => {
      setSites(!sites.hasAttribute('data-open'));
    });
    if (closeBtn) closeBtn.addEventListener('click', () => { setSites(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setSites(false);
    });
    document.addEventListener('click', (e) => {
      if (sites.hasAttribute('data-open') && !sites.contains(e.target)) setSites(false);
    });
  }

  /* hamburger / mobile menu */
  const ham = root.querySelector('.mainbar__hamburger');
  const nav = root.querySelector('.mainnav');
  if (ham && nav) {
    ham.addEventListener('click', () => {
      const open = !nav.hasAttribute('data-open');
      if (open) nav.setAttribute('data-open', ''); else nav.removeAttribute('data-open');
      ham.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
  }

  /* VISIT OUR OTHER SITES submenu (mobile) */
  const dropItem = root.querySelector('.mainnav__item--dropdown');
  const toggle = root.querySelector('.mainnav__toggle');
  if (dropItem && toggle) {
    const setSub = (open) => {
      if (open) dropItem.setAttribute('data-open', ''); else dropItem.removeAttribute('data-open');
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => {
      setSub(!dropItem.hasAttribute('data-open'));
    });
    const link = dropItem.querySelector('.mainnav__link');
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setSub(!dropItem.hasAttribute('data-open'));
      });
    }
  }
}

/**
 * loads and decorates the header from the authored /nav fragment
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment (stock mechanics kept; path overridable via nav metadata)
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  block.textContent = '';
  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const [brandSection, navSection, sitesSection, crumbSection] = sections;

  /* confirmation template: live page is the Auth0 sign-in surface with a bare
     logo-only blue bar (88px / 66px ≤980px) — no topbar, nav, or breadcrumb */
  if (document.body.classList.contains('confirmation')) {
    const bar = document.createElement('div');
    bar.className = 'site-header site-header--auth';
    if (brandSection) {
      const logo = brandSection.querySelector('a[href], img');
      if (logo) bar.append(logo.closest('a') || logo);
    }
    block.append(bar);
    return;
  }

  const root = document.createElement('div');
  root.className = 'site-header';
  /* build mainbar first: it clones the sites list for the mobile submenu before
     buildTopbar moves the authored ul into the flyout panel */
  const mainbar = brandSection && navSection
    ? buildMainbar(brandSection, navSection, sitesSection)
    : null;
  if (sitesSection) root.append(buildTopbar(sitesSection));
  if (mainbar) root.append(mainbar);
  root.append(buildBreadcrumb(crumbSection));

  block.append(root);
  wireInteractions(root);
}
