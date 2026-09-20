/**
 * need-cards — "WHAT YOU NEED TO PLAY" + "WHERE TO PLAY" band (replica of
 * redballtennis.com/en/home/play section.need minus the lead-gen form, which
 * is the email-signup block's surface). Round-trip schema:
 * stardust/eds-schema/en-home-play-html-proposed.json (section.need items
 * 0–7; repeat unit DIV.need__item ×2: 1 heading, 1 img, 2 text runs).
 * Round-trip map: need-cards → .need__colwrap (the lead-gen form inside
 * section.need belongs to email-signup).
 *
 * Authoring (node-slotted; one cell or one row per element — classified by
 * content, never by row index):
 *   h2                    "WHAT YOU NEED TO PLAY"
 *   per item (×2):        p > img icon, h3 item title, p sub-line
 *   h2                    "WHERE TO PLAY"
 *   p                     where-to-play copy
 *   p > strong > a        FIND A COURT CTA (decorateButtons → a.button.primary)
 *
 * The prototype's &nbsp; spacer paragraphs never survive the authoring
 * pipeline — their heights are modeled as CSS margins.
 */

// Wrap an AUTHORED element in a generated wrapper that carries the layout
// class; the element moves (keeps tag, attrs, editor indices) — never copy.
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const isHeading = (n, tags) => tags.includes(n.tagName);
const hasMedia = (n) => n.matches('picture, img') || n.querySelector('picture, img');
const hasLink = (n) => !!n.querySelector('a');

export default async function decorate(block) {
  // flatten-first: collect every cell's element children in authored order
  const nodes = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    nodes.push(...cell.children);
  });
  const flat = nodes.length ? nodes : [...block.children];
  if (!flat.length) return;

  let title = null;
  let whereTitle = null;
  let whereCopy = null;
  let cta = null;
  let pendingPic = null;
  const items = [];
  let cur = null;

  flat.forEach((n) => {
    if (isHeading(n, ['H1', 'H2'])) {
      if (!title) { title = n; cur = null; } else if (!whereTitle) { whereTitle = n; cur = null; }
      return;
    }
    if (isHeading(n, ['H3', 'H4', 'H5', 'H6']) && !whereTitle) {
      cur = { heading: n, pic: pendingPic, sub: null };
      pendingPic = null;
      items.push(cur);
      return;
    }
    if (hasMedia(n)) {
      if (cur && !cur.pic) cur.pic = n;
      else pendingPic = n;
      return;
    }
    if (n.tagName === 'P' && hasLink(n)) { cta = n; return; }
    if (n.tagName === 'P') {
      if (cur && !cur.sub) { cur.sub = n; return; }
      if (whereTitle && !whereCopy) { whereCopy = n; return; }
    }
  });

  const pad = document.createElement('div');
  pad.className = 'need__pad';
  const inner = document.createElement('div');
  inner.className = 'need__inner';
  const colwrap = document.createElement('div');
  colwrap.className = 'need__colwrap';
  const col = document.createElement('div');
  col.className = 'need__col';

  if (title) col.append(wrapNode(title, 'need__titlebox'));

  if (items.length) {
    const grid = document.createElement('div');
    grid.className = 'need__items';
    items.forEach((it) => {
      const item = document.createElement('div');
      item.className = 'need__item';
      if (it.pic) item.append(wrapNode(it.pic, 'need__imgwrap'));
      const text = document.createElement('div');
      text.className = 'need__text';
      text.append(it.heading);
      if (it.sub) text.append(it.sub);
      item.append(text);
      grid.append(item);
    });
    col.append(grid);
  }

  const mkRule = () => {
    const rule = document.createElement('div');
    rule.className = 'need__rule';
    rule.append(document.createElement('hr'));
    return rule;
  };

  col.append(mkRule());
  if (whereTitle || whereCopy) {
    const wtext = document.createElement('div');
    wtext.className = 'where__text';
    if (whereTitle) wtext.append(whereTitle);
    if (whereCopy) wtext.append(whereCopy);
    col.append(wtext);
  }
  col.append(mkRule());
  if (cta) col.append(wrapNode(cta, 'where__cta'));

  colwrap.append(col);
  inner.append(colwrap);
  pad.append(inner);
  block.replaceChildren(pad);
}
