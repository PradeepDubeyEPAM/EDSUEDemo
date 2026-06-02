export default function decorate(block) {
  const rows = [...block.children];

  const heading = rows.shift()?.textContent.trim() || '';

  const fleetContainer = document.createElement('div');
  fleetContainer.className = 'fleet-container';

  rows.forEach((row) => {
    const cols = [...row.children];

    if (cols.length < 6) {
      return;
    }

    const image = cols[0].querySelector('picture');
    const aircraftName = cols[1].textContent.trim();
    const seatCapacity = cols[2].textContent.trim();
    const cruisingSpeed = cols[3].textContent.trim();
    const cruisingAltitude = cols[4].textContent.trim();
    const description = cols[5].innerHTML;

    const card = document.createElement('div');
    card.className = 'fleet-card';

    card.innerHTML = `
      <div class="fleet-image">
        ${image ? image.outerHTML : ''}
      </div>

      <div class="fleet-content">
        <h3>${aircraftName}</h3>

        <div class="fleet-meta">
          <div>
            <span class="label">Seats</span>
            <span>${seatCapacity}</span>
          </div>

          <div>
            <span class="label">Speed</span>
            <span>${cruisingSpeed}</span>
          </div>

          <div>
            <span class="label">Altitude</span>
            <span>${cruisingAltitude}</span>
          </div>
        </div>

        <div class="fleet-description">
          ${description}
        </div>
      </div>
    `;
    fleetContainer.append(card);
  });

  block.innerHTML = '';

  if (heading) {
    const title = document.createElement('h2');
    title.className = 'fleet-heading';
    title.textContent = heading;
    block.append(title);
  }

  block.append(fleetContainer);
}