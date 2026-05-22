export default function decorate(block) {
  const rows = [...block.children];
  // Row 0: heading | subheading
  // Row 1..n: bullet points (one per row)
  // Last row: CTA label | CTA href | image URL

  const cells0 = [...(rows[0]?.children || [])];
  const heading = cells0[0]?.textContent?.trim() || '';
  const subheading = cells0[1]?.textContent?.trim() || '';

  const lastRow = rows[rows.length - 1];
  const lastCells = [...(lastRow?.children || [])];
  const ctaLabel = lastCells[0]?.textContent?.trim() || 'Join Now';
  const ctaHref = lastCells[1]?.textContent?.trim() || '#';
  const imgSrc = lastCells[2]?.textContent?.trim() || '';

  const bulletRows = rows.slice(1, rows.length - 1);

  block.innerHTML = '';

  const inner = document.createElement('div');
  inner.className = 'loyalty-program-inner';

  // Text column
  const textCol = document.createElement('div');
  textCol.className = 'loyalty-program-text';

  const h2 = document.createElement('h2');
  h2.textContent = heading;

  const sub = document.createElement('p');
  sub.className = 'loyalty-program-sub';
  sub.textContent = subheading;

  const ul = document.createElement('ul');
  ul.className = 'loyalty-program-bullets';
  bulletRows.forEach((row) => {
    const li = document.createElement('li');
    li.textContent = row.firstElementChild?.textContent?.trim() || '';
    ul.append(li);
  });

  const cta = document.createElement('a');
  cta.className = 'loyalty-program-cta';
  cta.href = ctaHref;
  cta.textContent = ctaLabel;

  textCol.append(h2, sub, ul, cta);

  // Image column
  const imgCol = document.createElement('div');
  imgCol.className = 'loyalty-program-image';
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = heading;
    img.loading = 'lazy';
    imgCol.append(img);
  }

  inner.append(textCol, imgCol);
  block.append(inner);
}
