import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function parseFields(block) {
  const fields = {};
  const rows = [...block.children];
  const modelOrder = ['image', 'imageAlt', 'headingText', 'description'];

  rows.forEach((row, index) => {
    const attributedCell = row.matches('[data-aue-prop], [data-richtext-prop]')
      ? row
      : row.querySelector('[data-aue-prop], [data-richtext-prop]');
    if (attributedCell) {
      const prop = attributedCell.getAttribute('data-aue-prop')
        || attributedCell.getAttribute('data-richtext-prop');
      if (prop) fields[prop] = attributedCell;
      return;
    }

    const [keyCell, valueCell] = [...row.children];
    const key = keyCell?.textContent?.trim();
    if (key && valueCell && modelOrder.includes(key)) {
      fields[key] = valueCell;
      return;
    }

    const fallbackProp = modelOrder[index];
    const fallbackCell = row.firstElementChild || row;
    if (fallbackProp && fallbackCell && !fields[fallbackProp]) {
      fields[fallbackProp] = fallbackCell;
    }
  });

  return fields;
}

function buildHeroBackground(fields) {
  const background = document.createElement('div');
  background.className = 'hero-background';

  if (!fields.image) {
    return background;
  }

  const picture = fields.image.matches('picture')
    ? fields.image
    : fields.image.querySelector('picture');
  const existingImg = fields.image.matches('img')
    ? fields.image
    : fields.image.querySelector('img');
  const imageLink = fields.image.matches('a')
    ? fields.image
    : fields.image.querySelector('a');
  const linkedImageUrl = imageLink?.href
    || fields.image.textContent.trim();
  const altText = fields.imageAlt?.textContent?.trim()
    || existingImg?.alt
    || fields.headingText?.textContent?.trim()
    || '';

  if (picture) {
    const img = picture.querySelector('img');
    if (img) img.alt = altText;
    moveInstrumentation(fields.image, picture);
    background.append(picture);
    return background;
  }

  if (existingImg) {
    const optimized = createOptimizedPicture(
      existingImg.src,
      altText,
      false,
      [{ width: '2000' }],
    );
    moveInstrumentation(fields.image, optimized);
    background.append(optimized);
    return background;
  }

  if (linkedImageUrl) {
    const optimized = createOptimizedPicture(
      linkedImageUrl,
      altText,
      false,
      [{ width: '2000' }],
    );
    moveInstrumentation(fields.image, optimized);
    background.append(optimized);
  }

  return background;
}

export default function decorate(block) {
  const fields = parseFields(block);
  const headingText = fields.headingText?.textContent?.trim() || 'Explore the World';
  const descriptionHtml = fields.description?.innerHTML?.trim();

  block.innerHTML = `
    <section class="ram-hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <div class="hero-text">
          <p class="eyebrow">Royal Air Maroc</p>

          <h1></h1>

          <div class="hero-description"></div>

          <div class="hero-actions">
            <button class="primary-btn">Book Now</button>
            <button class="secondary-btn">Discover Offers</button>
          </div>
        </div>

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

  const section = block.querySelector('.ram-hero');
  section.prepend(buildHeroBackground(fields));

  const heading = block.querySelector('.hero-text h1');
  heading.textContent = headingText;
  if (fields.headingText) {
    moveInstrumentation(fields.headingText, heading);
  }

  const description = block.querySelector('.hero-description');
  if (descriptionHtml) {
    description.innerHTML = descriptionHtml;
    moveInstrumentation(fields.description, description);
  } else {
    description.textContent = 'Discover exclusive fares and premium travel experiences across Europe, Africa, and North America.';
  }

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
