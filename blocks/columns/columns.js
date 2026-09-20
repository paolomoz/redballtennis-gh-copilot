/**
 * columns — EDS block collection columns, plus the redballtennis replica
 * variant `howto` ("HOW TO PLAY" / "HOW TO SCORE" band on blue ball-texture).
 * Round-trip schema: stardust/eds-schema/en-home-play-html-proposed.json
 * (section.howto — 2 uniform repeat units DIV.howto__col: 1 heading, 1 img,
 * 5 text runs each).
 *
 * howto authoring (container: 2 columns; one row with 2 cells, or 2 rows with
 * 1 cell — classified by content, never by row index). Each column cell:
 *   p > img           column icon (white-stroke svg)
 *   h2                column heading ("HOW TO PLAY" / "HOW TO SCORE")
 *   p > strong …      list items (bold centered lines; the prototype's &nbsp;
 *                     spacer paragraphs are modeled as CSS margins — authored
 *                     whitespace never survives the pipeline)
 *
 * The stock collection decorate() is preserved for all other variants.
 */

// Wrap an AUTHORED element in a generated wrapper that carries the layout
// class; the element moves (keeps tag, attrs, editor indices) — never copy.
function wrapNode(node, className) {
  const w = document.createElement('div');
  w.className = className;
  w.append(node);
  return w;
}

function decorateHowto(block) {
  // column contents: one row with N cells, or N rows with one cell each
  const rows = [...block.children];
  const cells = rows.length === 1 ? [...rows[0].children] : rows.map((r) => r.firstElementChild);
  const cols = cells.map((cell) => (cell ? [...cell.children] : [])).filter((kids) => kids.length);
  if (!cols.length) return;

  const bg = document.createElement('div');
  bg.className = 'howto__bg';
  const row = document.createElement('div');
  row.className = 'howto__row';

  cols.forEach((kids) => {
    const col = document.createElement('div');
    col.className = 'howto__col';
    const iconP = kids.find((k) => k.matches('picture, img') || k.querySelector('picture, img'));
    const heading = kids.find((k) => /^H[1-6]$/.test(k.tagName));
    const items = kids.filter((k) => k !== iconP && k !== heading
      && (k.matches('p, ul, ol') || k.querySelector('p, ul, ol')));
    if (iconP) col.append(wrapNode(iconP, 'howto__iconbox'));
    const text = document.createElement('div');
    text.className = 'howto__text';
    if (heading) text.append(heading);
    items.forEach((p) => text.append(p));
    col.append(text);
    row.append(col);
  });

  bg.append(row);
  block.replaceChildren(bg);
}

export default function decorate(block) {
  if (block.classList.contains('howto')) {
    decorateHowto(block);
    return;
  }

  // stock EDS columns behavior
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
