/**
 * cards — photo-card band on the blue ball-texture background
 * (replica of redballtennis.com section.cards / section.hostfeat).
 *
 * Decode tier: reconstructive (2 units, uniform per variant).
 * JS does generic cell classification per schema; the CSS carries the skin.
 *
 * Schema: stardust/eds-schema/index-proposed.json, section "cards"
 * (8 items: 2 hidden mirror cards [heading + CTA] + 2 photo cards
 * [image + copy + CTA]). Host variant adds a band note + band CTA
 * (stardust/prototypes/en-home-host-html-proposed.html section.hostfeat).
 *
 * Variants (block classes): `photo` (index skin), `photo host` (host skin —
 * fluid band, no per-card CTA, band note + 280px band CTA).
 *
 * Authoring rows — ONE ROW PER UNIT (#63):
 *   hidden mirror card : <h5> text cell + <p><strong><a> CTA cell
 *                        (replica: mirrors the live hidden DOM, never displayed)
 *   photo card         : image cell + copy cell + CTA cell (<p><strong><a>)
 *   host band note     : single text cell (after the photo cards)
 *   host band CTA      : single CTA cell (<p><strong><a>, after the photo cards)
 *
 * A link-only row BEFORE the first photo card classifies as a hidden extra
 * (live host: the hidden GET EQUIPPED button); a link-only row AFTER the photo
 * cards is the visible band CTA. Hidden units bucket into the leading hidden
 * row (live scatters them around the band; display:none everywhere, so the
 * bucket order is pixel-neutral — recorded deviation).
 *
 * Flattened fallback (#52): a single row holding all units as flat siblings is
 * segmented — a heading or a picture/img opens a new group.
 */

// Wrap an AUTHORED element in a generated wrapper that carries the layout class.
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

// Expand one authored cell's content (#104: the runtime's wrapTextNodes folds a
// media-led / unlisted-first-child cell's whole content into ONE <p> — expand it
// back). Returns EXISTING authored elements (MOVED into the layout, never rebuilt).
function expandCell(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].children.length
      && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      // HARNESS-ONLY fallback (EW5): bare text node inside the wrapper <p>;
      // move the node into a fresh <p>, never copy its text.
      if (n.textContent.trim()) { const p = document.createElement('p'); p.append(n); return p; }
      return null;
    }).filter(Boolean);
  }
  if (kids.length) return kids;
  // HARNESS-ONLY fallback (EW5): bare-text cell (off-pipeline content only).
  if (cell.textContent.trim()) {
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  }
  return [];
}

// Cell-level cascade collector (#62/#68/#71): a row's cells are its child divs.
function collectNodes(row) {
  return [...row.children].filter((c) => c.tagName === 'DIV').flatMap(expandCell);
}

const hasMedia = (nodes) => nodes.some((n) => n.matches('picture, img') || n.querySelector('picture, img'));
const hasHeading = (nodes) => nodes.some((n) => n.matches('h1, h2, h3, h4, h5, h6') || n.querySelector('h1, h2, h3, h4, h5, h6'));
const linkOf = (nodes) => {
  const n = nodes.find((el) => el.matches('a[href]') || el.querySelector('a[href]'));
  return n ? (n.matches('a[href]') ? n : n.querySelector('a[href]')) : null;
};

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // ── group authored nodes into units (one row per unit; flattened fallback) ──
  let groups = rows.map((row) => collectNodes(row)).filter((g) => g.length);
  if (groups.length === 1 && groups[0].filter((n) => n.matches('h1, h2, h3, h4, h5, h6, picture, img') || n.querySelector('picture, img')).length > 1) {
    const flat = groups[0];
    groups = [];
    let cur = [];
    flat.forEach((n) => {
      const opens = n.matches('h1, h2, h3, h4, h5, h6')
        || ((n.matches('picture, img') || n.querySelector('picture, img')) && cur.some((m) => m.matches('picture, img') || m.querySelector('picture, img') || m.textContent.trim()));
      if (opens && cur.length) { groups.push(cur); cur = []; }
      cur.push(n);
    });
    if (cur.length) groups.push(cur);
  }

  // ── classify units ──
  const hidden = [];
  const photos = [];
  let note = null;
  let bandCta = null;
  let seenPhoto = false;
  groups.forEach((nodes) => {
    if (hasMedia(nodes)) { photos.push(nodes); seenPhoto = true; return; }
    if (hasHeading(nodes)) { hidden.push(nodes); return; }
    const link = linkOf(nodes);
    if (link) {
      if (seenPhoto) bandCta = nodes;
      else hidden.push(nodes); // hidden lone CTA (live host: GET EQUIPPED)
      return;
    }
    if (nodes.some((n) => n.textContent.trim())) note = nodes; // band note
  });

  // ── build ──
  const bg = document.createElement('div');
  bg.className = 'cards-bg';

  if (hidden.length) {
    const hiddenRow = document.createElement('div');
    hiddenRow.className = 'cards-row cards-row-hidden';
    hiddenRow.setAttribute('aria-hidden', 'true');
    hidden.forEach((nodes) => {
      const heading = nodes.find((n) => n.matches('h1, h2, h3, h4, h5, h6') || n.querySelector('h1, h2, h3, h4, h5, h6'));
      if (heading) {
        const card = document.createElement('div');
        card.className = 'card';
        card.append(heading);
        const a = linkOf(nodes);
        if (a) card.append(a.closest('p') || a); // EW3: CTAs move as their paragraph
        hiddenRow.append(card);
      } else {
        const a = linkOf(nodes);
        if (a) hiddenRow.append(a.closest('p') || a);
      }
    });
    bg.append(hiddenRow);
  }

  if (photos.length) {
    const row = document.createElement('div');
    row.className = 'cards-row';
    photos.forEach((nodes) => {
      const card = document.createElement('div');
      card.className = 'card';
      const mediaNode = nodes.find((n) => n.matches('picture, img') || n.querySelector('picture, img'));
      const mediaEl = mediaNode.matches('picture, img') ? mediaNode : mediaNode.querySelector('picture, img');
      card.append(wrapNode(mediaEl, 'card-media'));
      const a = linkOf(nodes);
      nodes.forEach((n) => {
        if (n === mediaNode || n.contains(mediaEl)) return;
        if (a && (n === a || n.contains(a))) return;
        if (n.matches('p') && n.textContent.trim()) card.append(wrapNode(n, 'card-copy'));
      });
      if (a) card.append(wrapNode(a.closest('p') || a, 'card-cta'));
      row.append(card);
    });
    bg.append(row);
  }

  if (block.classList.contains('host') && (note || bandCta)) {
    const rule = document.createElement('div');
    rule.className = 'cards-rule';
    rule.append(document.createElement('hr'));
    bg.append(rule);
  }
  if (note) {
    const notebox = document.createElement('div');
    notebox.className = 'cards-note';
    note.forEach((n) => notebox.append(n));
    bg.append(notebox);
  }
  if (bandCta) {
    const cta = document.createElement('div');
    cta.className = 'cards-band-cta';
    bandCta.forEach((n) => cta.append(n));
    bg.append(cta);
  }

  block.replaceChildren(bg);
}
