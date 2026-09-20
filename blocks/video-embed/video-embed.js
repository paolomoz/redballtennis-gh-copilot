/**
 * video-embed — full-width consent-gated YouTube embed band (replica of
 * redballtennis.com/en/home/play section.pembed; schema:
 * stardust/eds-schema/en-home-play-html-proposed.json — 0 text items,
 * iframe-only).
 *
 * Authoring: one row with the YouTube embed URL as a plain link
 * (text == href; decorateButtons leaves it alone).
 *
 * decorate() builds the iframe with the exact attrs/classes the live page
 * carried as captured: same src AND data-src, class optanon-category-C0004
 * (OneTrust consent category), width 1500 / height 900, frameborder 0 —
 * replica policy: mirrored as-captured, no consent re-wiring.
 *
 * @ew-exempt p/a YouTube embed URL (row 1) — metadata: video source link,
 *   consumed to build the iframe; never displayed
 */

export default async function decorate(block) {
  const a = block.querySelector('a[href]');
  const src = a ? a.getAttribute('href') : block.textContent.trim();
  if (!src) return;

  const align = document.createElement('div');
  align.className = 'pembed__align';
  const wrap = document.createElement('div');
  wrap.className = 'pembed__wrap';

  const iframe = document.createElement('iframe');
  iframe.className = 'optanon-category-C0004';
  iframe.setAttribute('src', src);
  iframe.setAttribute('data-src', src);
  iframe.setAttribute('width', '1500');
  iframe.setAttribute('height', '900');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  wrap.append(iframe);

  const spacer = document.createElement('div');
  spacer.className = 'pembed__spacer';
  spacer.setAttribute('aria-hidden', 'true');

  align.append(wrap, spacer);
  block.replaceChildren(align);
}
