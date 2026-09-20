import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — redballtennis.com replica chrome.
 *
 * Renders the gated prototype footer (stardust/prototypes/index-proposed.html,
 * styles lifted from canon.css) from the authored /footer document
 * (eds/content/footer.html):
 *   section 1: logo link (a > img), link list (ul), hash text (p containing '#')
 */

/**
 * loads and decorates the footer from the authored /footer fragment
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment (stock mechanics kept; path overridable via footer metadata)
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  block.textContent = '';
  const section = fragment.querySelector(':scope > .section');

  const logoLink = section && section.querySelector('a[href]');
  const list = section && section.querySelector('ul');
  const hash = section
    && [...section.querySelectorAll('p')].find((p) => p.textContent.includes('#'));

  const root = document.createElement('div');
  root.className = 'site-footer';
  const inner = document.createElement('div');
  inner.className = 'site-footer__inner';

  const rule = (mod) => {
    const hr = document.createElement('hr');
    hr.className = `site-footer__rule site-footer__rule--${mod}`;
    return hr;
  };

  inner.append(rule('lead'));

  const col1 = document.createElement('div');
  col1.className = 'site-footer__col';
  if (logoLink) {
    const img = logoLink.querySelector('img');
    if (img) img.classList.add('site-footer__logo');
    col1.append(logoLink);
  }
  const navWrap = document.createElement('div');
  navWrap.className = 'site-footer__nav';
  const sitesNav = document.createElement('nav');
  sitesNav.setAttribute('aria-label', 'RedBallTennis footer links');
  if (list) {
    list.classList.add('site-footer__sites');
    list.querySelectorAll('a').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
    sitesNav.append(list);
  }
  const socialNav = document.createElement('nav');
  socialNav.setAttribute('aria-label', 'Social media links');
  const social = document.createElement('ul');
  social.className = 'site-footer__social';
  socialNav.append(social);
  navWrap.append(sitesNav, socialNav);
  col1.append(navWrap);
  inner.append(col1);

  inner.append(rule('mid'));

  const col2 = document.createElement('div');
  col2.className = 'site-footer__col';
  if (hash) {
    hash.classList.add('site-footer__hash');
    col2.append(hash);
  }
  inner.append(col2);

  inner.append(rule('end'));

  root.append(inner);
  block.append(root);
}
