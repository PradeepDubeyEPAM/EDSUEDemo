export default function decorate(block) {
  const rows = [...block.children];

  const fleetContainer = document.createElement('div');
  fleetContainer.className = 'fleet-container';

  let heading = '';

  rows.forEach((row) => {
    const cols = [...row.children];

    if (cols.length < 2) {
      return;
    }

    const key = cols[0].textContent.trim();
    const value = cols[1];

    if (key === 'heading') {
      heading = value.textContent.trim();
      return;
    }

    if (key !== 'fleetItems') {
      return;
    }

    const image = value.querySelector('picture');
    const aircraftName = value.dataset.aircraftName || '';
    const seatCapacity = value.dataset.seatCapacity || '';
    const cruisingSpeed = value.dataset.cruisingSpeed || '';
    const cruisingAltitude = value.dataset.cruisingAltitude || '';
    const description = value.dataset.description || '';

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