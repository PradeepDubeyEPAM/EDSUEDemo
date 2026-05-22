export default function decorate(block) {
  const rows = [...block.children];

  // First row: optional section heading
  let headingText = 'What Makes Flying With Us Great?';
  let featureRows = rows;

  if (rows.length && rows[0].children.length === 1) {
    const candidate = rows[0].firstElementChild?.textContent?.trim();
    if (candidate) {
      headingText = candidate;
      featureRows = rows.slice(1);
    }
  }

  block.innerHTML = '';

  const inner = document.createElement('div');
  inner.className = 'why-fly-inner';

  const heading = document.createElement('h2');
  heading.className = 'why-fly-heading';
  heading.textContent = headingText;
  inner.append(heading);

  const grid = document.createElement('div');
  grid.className = 'why-fly-grid';

  featureRows.forEach((row) => {
    const cells = [...row.children];
    // Columns: icon (emoji/text) | title | description | link href | link label
    const icon = cells[0]?.textContent?.trim() || '';
    const title = cells[1]?.textContent?.trim() || '';
    const desc = cells[2]?.textContent?.trim() || '';
    const linkHref = cells[3]?.textContent?.trim() || '#';
    const linkLabel = cells[4]?.textContent?.trim() || 'Learn more';

    const card = document.createElement('div');
    card.className = 'why-fly-card';

    const iconEl = document.createElement('div');
    iconEl.className = 'why-fly-icon';
    iconEl.textContent = icon;

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;

    const descEl = document.createElement('p');
    descEl.textContent = desc;

    const link = document.createElement('a');
    link.href = linkHref;
    link.textContent = linkLabel;

    card.append(iconEl, titleEl, descEl, link);
    grid.append(card);
  });

  inner.append(grid);
  block.append(inner);
}
