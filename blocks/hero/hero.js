/**
 * hero — landing-page lead section (replica of redballtennis.com section.hero).
 *
 * Decode tier: template-slotted. The block owns the prototype's two-column DOM
 * (text column + consent-gated YouTube embed column over the red vector motif)
 * and NODE-SLOTS the authored elements into it (EW1 — never value-slotting).
 *
 * Schema: stardust/eds-schema/index-proposed.json, section "hero"
 * (heading + tagline (RED / RAW THE LINES) + body copy + hand art + embed).
 *
 * Authoring rows (positional fallback; decode is query-based, #42):
 *   1. headline — author as <h1> (the page's single h1)
 *   2. tagline — <p><strong><em>RED</em>RAW THE LINES</strong></p>
 *      (the <em> marks the red "RED" prefix; DA preserves strong/em)
 *   3. body copy paragraph
 *   4. hand-with-ball art — optional <picture>/<img> (mobile-only, hidden desktop)
 *   5. embed source — a bare link to the YouTube embed URL
 *
 * @ew-exempt <a> YouTube embed URL (last row) — text-as-metadata: the link's
 *   href is read to build the consent-gated iframe (replica policy: mirrored
 *   as-captured, same-src + class optanon-category-C0004); the anchor itself
 *   is consumed, never displayed.
 *
 * The mobile tagline is a presentational italic clone of the authored tagline
 * (EW4: instrumentation stripped) — one authored text, one editable instance.
 * The mobile red separator band is generated chrome (no text).
 */

// Wrap an AUTHORED element in a generated wrapper that carries the layout class.
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// Presentational clones must not keep the editor's indices (EW4).
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  el.removeAttribute('data-prose-index');
  el.removeAttribute('data-image-index');
  return el;
}

// Cell-level cascade collector (#62/#68/#71): DA flattens most blocks to one
// row/one cell of flat siblings; recover every cell's children, expanding the
// runtime wrapTextNodes single-<p> fold (#104). Returns EXISTING authored
// elements (they are MOVED into the layout, never rebuilt).
function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    let kids = [...cell.children];
    // #104 — a media-led cell's whole content folds into ONE <p>; expand it back.
    if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
        && kids[0].querySelector('picture, img')) {
      kids = [...kids[0].childNodes].map((n) => {
        if (n.nodeType === 1) return n;
        // HARNESS-ONLY fallback (EW5): a bare text node inside the wrapper <p>
        // never occurs in DA content; move the node into a fresh <p>, never copy.
        if (n.textContent.trim()) { const p = document.createElement('p'); p.append(n); return p; }
        return null;
      }).filter(Boolean);
    }
    if (kids.length) out.push(...kids);
    // HARNESS-ONLY fallback (EW5): bare-text cell (off-pipeline content only).
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

export default async function decorate(block) {
  const nodes = collectNodes(block);

  // ── classify (query-based, order-tolerant) ──
  const heading = nodes.find((n) => n.matches('h1, h2, h3'));
  const link = nodes.find((n) => (n.matches('a') ? n : n.querySelector('a')));
  const embedAnchor = link ? (link.matches('a') ? link : link.querySelector('a')) : null;
  const media = nodes.find((n) => (n.matches('picture, img') ? n : n.querySelector('picture, img')));
  const mediaEl = media ? (media.matches('picture, img') ? media : media.querySelector('picture, img')) : null;
  const paras = nodes.filter((n) => {
    if (n === heading || n === link || (media && (n === media || n.contains(mediaEl)))) return false;
    const p = n.matches('p') ? n : null;
    return p && !p.querySelector('a') && p.textContent.trim();
  });
  // tagline = the emphasized short line; copy = the long plain paragraph.
  const tagline = paras.find((p) => p.querySelector('strong, em, b, i')) || paras[0];
  const copy = paras.find((p) => p !== tagline);

  // ── build the template DOM, node-slotting authored elements ──
  const row = document.createElement('div');
  row.className = 'hero-row';

  const left = document.createElement('div');
  left.className = 'hero-left';

  const topline = document.createElement('div');
  topline.className = 'hero-topline';
  const texts = document.createElement('div');
  texts.className = 'hero-texts';
  if (heading) texts.append(wrapNode(heading, 'hero-title'));
  if (tagline) {
    texts.append(wrapNode(tagline, 'hero-tagline hero-tagline-desktop'));
    // mobile italic variant: presentational clone, instrumentation stripped (EW4)
    const clone = stripInstrumentation(tagline.cloneNode(true));
    texts.append(wrapNode(clone, 'hero-tagline hero-tagline-mobile'));
  }
  topline.append(texts);

  if (mediaEl) {
    const hand = document.createElement('div');
    hand.className = 'hero-hand';
    hand.append(media.matches('picture, img') ? media : mediaEl.closest('p') || mediaEl);
    topline.append(hand);
  }
  left.append(topline);

  const rule = document.createElement('hr');
  rule.className = 'hero-rule';
  left.append(rule);

  if (copy) left.append(wrapNode(copy, 'hero-copy'));
  row.append(left);

  // mobile-only red separator band (mirrors the live 17px #C80F2F separator)
  const band = document.createElement('div');
  band.className = 'hero-band';
  band.setAttribute('aria-hidden', 'true');
  row.append(band);

  const mediaCol = document.createElement('div');
  mediaCol.className = 'hero-media';
  const embed = document.createElement('div');
  embed.className = 'hero-embed';
  if (embedAnchor) {
    const src = embedAnchor.href;
    const iframe = document.createElement('iframe');
    iframe.className = 'optanon-category-C0004'; // replica: mirrored as-captured
    iframe.setAttribute('src', src);
    iframe.setAttribute('data-src', src);
    iframe.setAttribute('width', '560');
    iframe.setAttribute('height', '315');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', 'YouTube video');
    embed.append(iframe);
  }
  mediaCol.append(embed);
  row.append(mediaCol);

  block.replaceChildren(row);
}
