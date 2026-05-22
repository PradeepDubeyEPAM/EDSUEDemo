export default function decorate(block) {
  block.innerHTML = '';

  const tabs = [
    { id: 'book', label: 'Book a Flight' },
    { id: 'manage', label: 'Manage / Check-in' },
    { id: 'status', label: 'Flight Status' },
  ];

  const wrapper = document.createElement('div');
  wrapper.className = 'flight-search-wrapper';

  // Tab bar
  const tabBar = document.createElement('div');
  tabBar.className = 'flight-search-tabs';
  tabs.forEach(({ id, label }, i) => {
    const btn = document.createElement('button');
    btn.className = 'flight-search-tab' + (i === 0 ? ' active' : '');
    btn.dataset.tab = id;
    btn.textContent = label;
    btn.setAttribute('type', 'button');
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.flight-search-tab').forEach((t) => t.classList.remove('active'));
      wrapper.querySelectorAll('.flight-search-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      wrapper.querySelector(`.flight-search-panel[data-panel="${id}"]`).classList.add('active');
    });
    tabBar.append(btn);
  });

  // Book panel
  const bookPanel = document.createElement('div');
  bookPanel.className = 'flight-search-panel active';
  bookPanel.dataset.panel = 'book';
  bookPanel.innerHTML = `
    <div class="flight-search-type">
      <label><input type="radio" name="trip-type" value="round-trip" checked> Round Trip</label>
      <label><input type="radio" name="trip-type" value="one-way"> One Way</label>
      <label><input type="radio" name="trip-type" value="multi-city"> Multi-City</label>
    </div>
    <div class="flight-search-row">
      <div class="flight-search-field">
        <label for="fs-origin">From</label>
        <input id="fs-origin" type="text" placeholder="City or Airport" autocomplete="off">
      </div>
      <button class="flight-search-swap" type="button" aria-label="Swap origin and destination">⇄</button>
      <div class="flight-search-field">
        <label for="fs-dest">To</label>
        <input id="fs-dest" type="text" placeholder="City or Airport" autocomplete="off">
      </div>
      <div class="flight-search-field">
        <label for="fs-depart">Departure</label>
        <input id="fs-depart" type="date">
      </div>
      <div class="flight-search-field">
        <label for="fs-return">Return</label>
        <input id="fs-return" type="date">
      </div>
      <div class="flight-search-field">
        <label for="fs-pax">Passengers</label>
        <select id="fs-pax">
          <option value="1">1 Adult</option>
          <option value="2">2 Adults</option>
          <option value="3">3 Adults</option>
          <option value="4">4 Adults</option>
        </select>
      </div>
      <button class="flight-search-btn" type="button">Search Flights</button>
    </div>
  `;

  // Manage panel
  const managePanel = document.createElement('div');
  managePanel.className = 'flight-search-panel';
  managePanel.dataset.panel = 'manage';
  managePanel.innerHTML = `
    <div class="flight-search-row">
      <div class="flight-search-field">
        <label for="fs-ref">Booking Reference</label>
        <input id="fs-ref" type="text" placeholder="e.g. ABC123" autocomplete="off">
      </div>
      <div class="flight-search-field">
        <label for="fs-last">Last Name</label>
        <input id="fs-last" type="text" placeholder="Passenger last name" autocomplete="off">
      </div>
      <button class="flight-search-btn" type="button">Retrieve Booking</button>
    </div>
  `;

  // Status panel
  const statusPanel = document.createElement('div');
  statusPanel.className = 'flight-search-panel';
  statusPanel.dataset.panel = 'status';
  statusPanel.innerHTML = `
    <div class="flight-search-row">
      <div class="flight-search-field">
        <label for="fs-flight">Flight Number</label>
        <input id="fs-flight" type="text" placeholder="e.g. AT 700" autocomplete="off">
      </div>
      <div class="flight-search-field">
        <label for="fs-date">Date</label>
        <input id="fs-date" type="date">
      </div>
      <button class="flight-search-btn" type="button">Check Status</button>
    </div>
  `;

  // Swap button logic
  bookPanel.querySelector('.flight-search-swap').addEventListener('click', () => {
    const origin = bookPanel.querySelector('#fs-origin');
    const dest = bookPanel.querySelector('#fs-dest');
    const tmp = origin.value;
    origin.value = dest.value;
    dest.value = tmp;
  });

  wrapper.append(tabBar, bookPanel, managePanel, statusPanel);
  block.append(wrapper);
}
