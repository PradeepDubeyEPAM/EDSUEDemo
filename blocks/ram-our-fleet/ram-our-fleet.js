export default function decorate(block) {
  const rows = [...block.children];

  const heading = rows[0]?.textContent.trim() || '';

  const fleetContainer = document.createElement('div');
  fleetContainer.className = 'fleet-container';

  // Skip heading row
  const itemRows = rows.slice(1);

  itemRows.forEach((row) => {
    const cols = [...row.children];

    const image = cols[0].querySelector('picture');

    const imageAlt = cols[1]?.textContent.trim() || '';
    const aircraftName = cols[2]?.textContent.trim() || '';
    const numberOfAircrafts = cols[3]?.textContent.trim() || '';
    const seatCapacity = cols[4]?.textContent.trim() || '';
    const length = cols[5]?.textContent.trim() || '';
    const cruisingAltitude = cols[6]?.textContent.trim() || '';
    const cruisingSpeed = cols[7]?.textContent.trim() || '';
    const fuelCapacity = cols[8]?.textContent.trim() || '';

    if (image) {
      const img = image.querySelector('img');
      if (img) {
        img.alt = imageAlt;
      }
    }

    const card = document.createElement('div');
    card.className = 'fleet-card';

    card.innerHTML = `
      <div class="fleet-image">
        ${image ? image.outerHTML : ''}
      </div>

      <div class="fleet-content">
        <h3>${aircraftName}</h3>

        <div class="fleet-specs">
          <div class="fleet-spec">
            <span class="label">Number of aircrafts:</span>
            <span>${numberOfAircrafts}</span>
          </div>

          <div class="fleet-spec">
            <span class="label">Seats:</span>
            <span>${seatCapacity}</span>
          </div>

          <div class="fleet-spec">
            <span class="label">Length (m):</span>
            <span>${length} m</span>
          </div>

          <div class="fleet-spec">
            <span class="label">Cruising altitude (m):</span>
            <span>${cruisingAltitude} m</span>
          </div>

          <div class="fleet-spec">
            <span class="label">Cruising speed (km/h):</span>
            <span>${cruisingSpeed} km/h</span>
          </div>

          <div class="fleet-spec">
            <span class="label">Fuel capacity (l):</span>
            <span>${fuelCapacity}</span>
          </div>
        </div>
      </div>
    `;

    fleetContainer.append(card);
  });

  block.innerHTML = '';

  if (heading) {
    const headingElement = document.createElement('h2');
    headingElement.className = 'fleet-heading';
    headingElement.textContent = heading;
    block.append(headingElement);
  }

  block.append(fleetContainer);
}