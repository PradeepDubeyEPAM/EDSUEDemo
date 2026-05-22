export default function decorate(block) {
  const rows = [...block.children];

  // First row may be a section heading
  let headingText = 'Featured Destinations';
  let dealRows = rows;

  if (rows.length && rows[0].children.length === 1) {
    const candidate = rows[0].firstElementChild?.textContent?.trim();
    if (candidate && !candidate.includes('|')) {
      headingText = candidate;
      dealRows = rows.slice(1);
    }
  }

  block.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'destination-deals-inner';

  const heading = document.createElement('h2');
  heading.className = 'destination-deals-heading';
  heading.textContent = headingText;
  section.append(heading);

  const grid = document.createElement('ul');
  grid.className = 'destination-deals-grid';

  dealRows.forEach((row) => {
    const cells = [...row.children];
    // Expected columns: city | price | image URL | link href
    const city = cells[0]?.textContent?.trim() || '';
    const price = cells[1]?.textContent?.trim() || '';
    const imgSrc = cells[2]?.textContent?.trim() || '';
    const linkHref = cells[3]?.textContent?.trim() || '#';

    const li = document.createElement('li');
    li.className = 'destination-deals-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'destination-deals-img';
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = city;
      img.loading = 'lazy';
      imgWrap.append(img);
    }

    const body = document.createElement('div');
    body.className = 'destination-deals-body';

    const cityEl = document.createElement('h3');
    cityEl.textContent = city;

    const priceEl = document.createElement('p');
    priceEl.className = 'destination-deals-price';
    priceEl.textContent = price;

    const cta = document.createElement('a');
    cta.className = 'destination-deals-cta';
    cta.href = linkHref;
    cta.textContent = 'Book Now';

    body.append(cityEl, priceEl, cta);
    li.append(imgWrap, body);
    grid.append(li);
  });

  section.append(grid);
  block.append(section);
}
