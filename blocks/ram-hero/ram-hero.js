export default function decorate(block) {

  block.innerHTML = `
    <section class="ram-hero">

      <!-- Background -->
      <div class="hero-background">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000"
          alt="Airplane"
        />
      </div>

      <!-- Overlay -->
      <div class="hero-overlay"></div>

      <!-- Hero Content -->
      <div class="hero-content">

        <div class="hero-text">
          <p class="eyebrow">Royal Air Maroc</p>

          <h1>
            Explore the World
            <br />
            with Comfort
          </h1>

          <p class="hero-description">
            Discover exclusive fares and premium travel experiences
            across Europe, Africa, and North America.
          </p>

          <div class="hero-actions">
            <button class="primary-btn">Book Now</button>
            <button class="secondary-btn">Discover Offers</button>
          </div>
        </div>

        <!-- Booking Widget -->
        <div class="booking-widget">

          <div class="booking-tabs">
            <button class="tab active" data-tab="flight">
              Flights
            </button>

            <button class="tab" data-tab="checkin">
              Check-in
            </button>

            <button class="tab" data-tab="status">
              Flight Status
            </button>
          </div>

          <!-- Flights -->
          <div class="tab-panel active" id="flight">

            <div class="trip-type">
              <label>
                <input type="radio" name="trip" checked />
                Round Trip
              </label>

              <label>
                <input type="radio" name="trip" />
                One Way
              </label>
            </div>

            <div class="form-grid">

              <div class="form-field">
                <label>From</label>
                <input type="text" placeholder="Casablanca" />
              </div>

              <div class="form-field">
                <label>To</label>
                <input type="text" placeholder="Paris" />
              </div>

              <div class="form-field">
                <label>Departure</label>
                <input type="date" />
              </div>

              <div class="form-field">
                <label>Return</label>
                <input type="date" />
              </div>

              <div class="form-field">
                <label>Passengers</label>
                <select>
                  <option>1 Adult</option>
                  <option>2 Adults</option>
                  <option>3 Adults</option>
                </select>
              </div>

            </div>

            <button class="search-flight-btn">
              Search Flights
            </button>

          </div>

          <!-- Checkin -->
          <div class="tab-panel" id="checkin">

            <div class="form-grid">

              <div class="form-field">
                <label>Booking Reference</label>
                <input type="text" placeholder="ABC123" />
              </div>

              <div class="form-field">
                <label>Last Name</label>
                <input type="text" placeholder="Doe" />
              </div>

            </div>

            <button class="search-flight-btn">
              Check-in
            </button>

          </div>

          <!-- Flight Status -->
          <div class="tab-panel" id="status">

            <div class="form-grid">

              <div class="form-field">
                <label>Flight Number</label>
                <input type="text" placeholder="AT203" />
              </div>

              <div class="form-field">
                <label>Date</label>
                <input type="date" />
              </div>

            </div>

            <button class="search-flight-btn">
              Track Flight
            </button>

          </div>

        </div>

      </div>

    </section>
  `;

  // Tabs Logic
  const tabs = block.querySelectorAll('.tab');
  const panels = block.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {

    tab.addEventListener('click', () => {

      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');

      const activePanel = block.querySelector(`#${target}`);

      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  // Simple CTA Events
  const searchButtons = block.querySelectorAll('.search-flight-btn');

  searchButtons.forEach((button) => {

    button.addEventListener('click', () => {

      button.classList.add('loading');

      const original = button.innerText;

      button.innerText = 'Loading...';

      setTimeout(() => {
        button.innerText = original;
        button.classList.remove('loading');
      }, 1200);
    });
  });
}