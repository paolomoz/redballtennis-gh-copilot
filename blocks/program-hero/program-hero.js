/**
 * program-hero — program-page hero, play + host skins (replica of
 * redballtennis.com/en/home/play + /host hero bands).
 * Round-trip schema: stardust/eds-schema/en-home-play-html-proposed.json
 * (section.phero); host sibling: stardust/prototypes/en-home-host-html-proposed.html
 * (section.hhero) — same block, variant class `host` on the block.
 *
 * Authoring (node-slotted; DA may deliver one cell or one row per element —
 * this block classifies by content, never by row index):
 *   h1                  hero title — mark the red word with <em>
 *                       (play: "Tennis <em>Red</em>esigned For You")
 *   p > strong > em     play-only tagline ("YOU DRAW THE LINE") — hidden on
 *                       live at every width; mirrored as captured
 *   p …                 body paragraph(s) (play: 1, host: 2)
 *   p > img (host only) mobile hero photo (rbt-host-v1.jpeg); the desktop
 *                       photo column is a decorative CSS background in both
 *                       variants (aria-hidden in the prototypes)
 */

// Wrap an AUTHORED element in a generated wrapper that carries the layout
// class; the element moves (keeps tag, attrs, editor indices) — never copy.
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

const el = (className, ariaHidden = false) => {
  const d = document.createElement('div');
  d.className = className;
  if (ariaHidden) d.setAttribute('aria-hidden', 'true');
  return d;
};

export default async function decorate(block) {
  const host = block.classList.contains('host');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;
  const ps = [...block.querySelectorAll('p')];
  // the HTML pipeline unwraps picture-only paragraphs — the authored
  // <p><img> arrives as a BARE <picture> cell child (no <p>)
  let mediaP = ps.find((p) => p.querySelector('picture, img'));
  if (!mediaP) {
    const bare = block.querySelector('picture, img');
    if (bare) mediaP = bare.closest('p') || bare;
  }
  const isTagline = (p) => !p.querySelector('a, picture, img')
    && p.querySelector('strong, b') && p.querySelector('em, i');
  const tagline = host ? null : ps.find(isTagline);
  const bodies = ps.filter((p) => p !== tagline && p !== mediaP && !p.querySelector('a'));

  const row = el(host ? 'hhero__row' : 'phero__row');
  const left = el(host ? 'hhero__left' : 'phero__left');
  const leftinner = el(host ? 'hhero__leftinner' : 'phero__leftinner');

  leftinner.append(wrapNode(heading, host ? 'hhero__titlebox' : 'phero__titlebox'));

  if (host) {
    // mobile-only photo between title and separator (live image-31c6e70bd1)
    if (mediaP) leftinner.append(wrapNode(mediaP, 'hhero__imgbox'));
    // transparent separator (live separator-ba902731dd)
    const rule = el('hhero__rule');
    rule.append(document.createElement('hr'));
    leftinner.append(rule);
  } else {
    // hidden on live at both gate widths — mirrored DOM, never displayed
    if (tagline) leftinner.append(wrapNode(tagline, 'phero__taglinebox'));
    // mobile-only photo band (live container-11527fe110)
    leftinner.append(el('phero__band', true));
  }

  const bodybox = el(host ? 'hhero__bodybox' : 'phero__bodybox');
  bodies.forEach((p) => bodybox.append(p));
  if (host) {
    leftinner.append(bodybox);
    left.append(leftinner);
  } else {
    // play: bodybox is a sibling of leftinner, both children of phero__left
    left.append(leftinner, bodybox);
  }

  // desktop right photo column — decorative CSS background (aria-hidden on
  // live); an authored image (play variant) replaces it as a cover layer
  const media = el(host ? 'hhero__media' : 'phero__media', true);
  if (!host && mediaP) {
    media.removeAttribute('aria-hidden');
    media.append(mediaP);
  }
  if (host) media.append(el('hhero__mediaspacer'));
  row.append(left, media);
  block.replaceChildren(row);
}
