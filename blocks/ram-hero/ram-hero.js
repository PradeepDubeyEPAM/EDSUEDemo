import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { initializeEventTracking } from './event-tracker.js';

function parseFields(block) {
  const fields = {};
  const rows = [...block.children];
  const modelOrder = ['image', 'imageAlt', 'headingText', 'description', 'searchFlightHref'];

  rows.forEach((row) => {
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

    const fallbackCell = row.firstElementChild || row;
    if (!fallbackCell) return;

    const hasImage = !!fallbackCell.querySelector('picture, img') || fallbackCell.matches('picture, img');
    if (hasImage && !fields.image) {
      fields.image = fallbackCell;
      return;
    }

    const rawValue = getFieldValue(fallbackCell);
    if (isUrlLike(rawValue) && !fields.searchFlightHref) {
      fields.searchFlightHref = fallbackCell;
      return;
    }

    if (!fields.headingText) {
      fields.headingText = fallbackCell;
      return;
    }

    if (!fields.description) {
      fields.description = fallbackCell;
    }
  });

  return fields;
}

function getFieldValue(field) {
  if (!field) return '';
  const link = field.matches('a') ? field : field.querySelector('a');
  return link?.getAttribute('href')?.trim() || field.textContent?.trim() || '';
}

function isUrlLike(value) {
  if (!value) return false;
  const text = value.trim();
  return /^(https?:\/\/|\/)/.test(text);
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
  // console.log('Parsed fields for RAM Hero:', fields);
  const headingText = fields.headingText?.textContent?.trim() || 'Uncover the Magic of Marrakech';
  let descriptionHtml = fields.description?.innerHTML?.trim();
  const descriptionText = fields.description?.textContent?.trim() || '';
  let searchFlightHref = getFieldValue(fields.searchFlightHref);
  // console.log('Initial Search Flight Href:', searchFlightHref);

  if (!searchFlightHref && isUrlLike(descriptionText)) {
    searchFlightHref = descriptionText;
    descriptionHtml = '';
  }

  if (!searchFlightHref) {
    const fallbackUrlRow = [...block.children]
      .map((row) => getFieldValue(row))
      .find((value) => isUrlLike(value));
    searchFlightHref = fallbackUrlRow || '';
  }

  // console.log('Search Flight URL:', searchFlightHref);

  block.innerHTML = `
    <section class="ram-hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-title-row">
            <img src="/icons/ram-chevron.svg" alt="" class="hero-ram-chevron" aria-hidden="true" />
            <h1></h1>
          </div>

          <div class="hero-description"></div>

          <div class="hero-actions">
            <button class="primary-btn">
              <span>Let the Journey Begin</span>
              <svg class="primary-btn-icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                <path d="M4 2L8 6L4 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button class="secondary-btn">Discover Offers</button>
          </div>
        </div>

        <div class="booking-widget">

          <div class="booking-tabs">
            <button class="tab active" data-tab="flight">
              Booking
            </button>

            <button class="tab" data-tab="checkin">
              Manage/Check-in
            </button>

            <button class="tab" data-tab="status">
              Flight Status
            </button>
          </div>

          <!-- Flights -->
          <div class="tab-panel active" id="flight">

            <div class="trip-type">
              <button type="button" class="trip-btn active">Round trip</button>
              <button type="button" class="trip-btn">One-way</button>
              <button type="button" class="trip-btn">Multi-city</button>
            </div>

            <div class="booking-shell">
              <div class="booking-primary-row">
                <div class="field-dropdown-wrap">
                  <div class="ram-booking-field-btn has-inline-search js-expand-trigger js-origin-toggle" role="button" tabindex="0" data-field="origin">
                    <span class="field-label">Select origin</span>
                    <span class="field-value js-origin-value">Paris Charles de Gaulle, France</span>
                    <input class="field-inline-search js-origin-search" type="text" placeholder="" hidden />
                    <span class="field-code js-origin-code">CDG</span>

                    <div class="field-dropdown-panel location-panel origin-panel" hidden>
                      <button type="button" class="location-option active" data-value="Paris Charles de Gaulle, France" data-code="CDG">
                        <span class="loc-main">Paris Charles de Gaulle <span>France</span></span>
                        <span class="loc-sub">Charles de Gaulle Airport</span>
                        <span class="loc-code">CDG</span>
                      </button>
                      <button type="button" class="location-option" data-value="Austin, United States" data-code="AUS">
                        <span class="loc-main">Austin <span>United States</span></span>
                        <span class="loc-sub">Austin-Bergstrom International Airport</span>
                        <span class="loc-code">AUS</span>
                      </button>
                      <button type="button" class="location-option" data-value="New York, United States" data-code="JFK">
                        <span class="loc-main">New York <span>United States</span></span>
                        <span class="loc-sub">John F. Kennedy International Airport</span>
                        <span class="loc-code">JFK</span>
                      </button>
                      <button type="button" class="location-option" data-value="Los Angeles, United States" data-code="LAX">
                        <span class="loc-main">Los Angeles <span>United States</span></span>
                        <span class="loc-sub">Los Angeles International Airport</span>
                        <span class="loc-code">LAX</span>
                      </button>
                      <button type="button" class="location-option" data-value="London, United Kingdom" data-code="LHR">
                        <span class="loc-main">London <span>United Kingdom</span></span>
                        <span class="loc-sub">London Heathrow Airport</span>
                        <span class="loc-code">LHR</span>
                      </button>
                      <button type="button" class="location-option" data-value="Dubai, United Arab Emirates" data-code="DXB">
                        <span class="loc-main">Dubai <span>United Arab Emirates</span></span>
                        <span class="loc-sub">Dubai International Airport</span>
                        <span class="loc-code">DXB</span>
                      </button>
                      <button type="button" class="location-option" data-value="Singapore, Singapore" data-code="SIN">
                        <span class="loc-main">Singapore <span>Singapore</span></span>
                        <span class="loc-sub">Singapore Changi Airport</span>
                        <span class="loc-code">SIN</span>
                      </button>
                      <button type="button" class="location-option" data-value="Tokyo, Japan" data-code="HND">
                        <span class="loc-main">Tokyo <span>Japan</span></span>
                        <span class="loc-sub">Tokyo Haneda Airport</span>
                        <span class="loc-code">HND</span>
                      </button>
                      <button type="button" class="location-option" data-value="Frankfurt, Germany" data-code="FRA">
                        <span class="loc-main">Frankfurt <span>Germany</span></span>
                        <span class="loc-sub">Frankfurt Airport</span>
                        <span class="loc-code">FRA</span>
                      </button>
                      <button type="button" class="location-option" data-value="Amsterdam, Netherlands" data-code="AMS">
                        <span class="loc-main">Amsterdam <span>Netherlands</span></span>
                        <span class="loc-sub">Amsterdam Schiphol Airport</span>
                        <span class="loc-code">AMS</span>
                      </button>
                    </div>
                  </div>
                </div>

                <span class="swap-indicator" aria-hidden="true">⇄</span>

                <div class="field-dropdown-wrap">
                  <div class="ram-booking-field-btn has-inline-search js-expand-trigger js-destination-toggle" role="button" tabindex="0" data-field="destination">
                    <span class="field-label">Select destination</span>
                    <span class="field-value js-destination-value"></span>
                    <input class="field-inline-search js-destination-search" type="text" placeholder="" hidden />
                    <span class="field-code js-destination-code"></span>

                    <div class="field-dropdown-panel location-panel destination-panel" hidden>
                      <button type="button" class="location-option" data-value="Austin, United States" data-code="AUS">
                        <span class="loc-main">Austin <span>United States</span></span>
                        <span class="loc-sub">Austin-Bergstrom International Airport</span>
                        <span class="loc-code">AUS</span>
                      </button>
                      <button type="button" class="location-option" data-value="Paris Charles de Gaulle, France" data-code="CDG">
                        <span class="loc-main">Paris Charles de Gaulle <span>France</span></span>
                        <span class="loc-sub">Charles de Gaulle Airport</span>
                        <span class="loc-code">CDG</span>
                      </button>
                      <button type="button" class="location-option" data-value="New York, United States" data-code="JFK">
                        <span class="loc-main">New York <span>United States</span></span>
                        <span class="loc-sub">John F. Kennedy International Airport</span>
                        <span class="loc-code">JFK</span>
                      </button>
                      <button type="button" class="location-option" data-value="Los Angeles, United States" data-code="LAX">
                        <span class="loc-main">Los Angeles <span>United States</span></span>
                        <span class="loc-sub">Los Angeles International Airport</span>
                        <span class="loc-code">LAX</span>
                      </button>
                      <button type="button" class="location-option" data-value="London, United Kingdom" data-code="LHR">
                        <span class="loc-main">London <span>United Kingdom</span></span>
                        <span class="loc-sub">London Heathrow Airport</span>
                        <span class="loc-code">LHR</span>
                      </button>
                      <button type="button" class="location-option" data-value="Dubai, United Arab Emirates" data-code="DXB">
                        <span class="loc-main">Dubai <span>United Arab Emirates</span></span>
                        <span class="loc-sub">Dubai International Airport</span>
                        <span class="loc-code">DXB</span>
                      </button>
                      <button type="button" class="location-option" data-value="Singapore, Singapore" data-code="SIN">
                        <span class="loc-main">Singapore <span>Singapore</span></span>
                        <span class="loc-sub">Singapore Changi Airport</span>
                        <span class="loc-code">SIN</span>
                      </button>
                      <button type="button" class="location-option" data-value="Tokyo, Japan" data-code="HND">
                        <span class="loc-main">Tokyo <span>Japan</span></span>
                        <span class="loc-sub">Tokyo Haneda Airport</span>
                        <span class="loc-code">HND</span>
                      </button>
                      <button type="button" class="location-option" data-value="Frankfurt, Germany" data-code="FRA">
                        <span class="loc-main">Frankfurt <span>Germany</span></span>
                        <span class="loc-sub">Frankfurt Airport</span>
                        <span class="loc-code">FRA</span>
                      </button>
                      <button type="button" class="location-option" data-value="Amsterdam, Netherlands" data-code="AMS">
                        <span class="loc-main">Amsterdam <span>Netherlands</span></span>
                        <span class="loc-sub">Amsterdam Schiphol Airport</span>
                        <span class="loc-code">AMS</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="booking-expanded">
                <div class="booking-secondary-row">
                  <div class="field-dropdown-wrap">
                    <div class="ram-booking-field-btn compact js-date-toggle" role="button" tabindex="0">
                      <span class="field-label">Dates</span>
                      <span class="field-value js-date-summary">Mon, 8 Jun - Tue, 9 Jun</span>

                      <div class="field-dropdown-panel date-panel" hidden>
                        <div class="date-panel-grid">
                          <label>
                            <span>Departure</span>
                            <input type="date" class="js-departure" value="2026-06-08" />
                          </label>
                          <label>
                            <span>Return</span>
                            <input type="date" class="js-return" value="2026-06-09" />
                          </label>
                        </div>
                        <button type="button" class="panel-confirm js-date-confirm">Confirm selection</button>
                      </div>
                    </div>
                  </div>

                  <div class="field-dropdown-wrap">
                    <div class="ram-booking-field-btn compact js-passengers-toggle" role="button" tabindex="0">
                      <span class="field-label">Passengers / Cabin</span>
                      <span class="field-value js-passengers-summary">1 Passenger / Economy</span>

                      <div class="field-dropdown-panel passengers-panel" hidden>
                      <h4>Passengers</h4>

                      <div class="counter-row" data-type="adult">
                        <div>
                          <strong>Adult</strong>
                          <span>From 12 years old</span>
                        </div>
                        <div class="counter-controls">
                          <button type="button" class="counter-btn js-minus">−</button>
                          <span class="counter-value" data-value>1</span>
                          <button type="button" class="counter-btn plus js-plus">+</button>
                        </div>
                      </div>

                      <div class="counter-row" data-type="child">
                        <div>
                          <strong>Child</strong>
                          <span>From 2 to 11 years</span>
                        </div>
                        <div class="counter-controls">
                          <button type="button" class="counter-btn js-minus">−</button>
                          <span class="counter-value" data-value>0</span>
                          <button type="button" class="counter-btn plus js-plus">+</button>
                        </div>
                      </div>

                      <div class="counter-row" data-type="infant">
                        <div>
                          <strong>Infant</strong>
                          <span>Up to 2 years</span>
                        </div>
                        <div class="counter-controls">
                          <button type="button" class="counter-btn js-minus">−</button>
                          <span class="counter-value" data-value>0</span>
                          <button type="button" class="counter-btn plus js-plus">+</button>
                        </div>
                      </div>

                      <div class="cabin-options">
                        <label><input type="radio" name="cabin" value="Business" /> Business</label>
                        <label><input type="radio" name="cabin" value="Economy" checked /> Economy</label>
                      </div>

                      <button type="button" class="panel-confirm js-passengers-confirm">Confirm</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="booking-footer-row">
                  <a href="#" class="promo-link">Add promo code</a>
                  <div class="booking-footer-actions">
                    <button class="search-flight-btn">Search Flights</button>
                  </div>
                </div>
              </div>
            </div>

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
    description.textContent = 'A city of colors, scents, and timeless charm.';
  }

  // Tabs Logic
  const tabs = block.querySelectorAll('.tab');
  const panels = block.querySelectorAll('.tab-panel');
  const bookingWidget = block.querySelector('.booking-widget');
  const bookingTabs = block.querySelector('.booking-tabs');

  const applyMobileTabLayout = () => {
    if (!bookingWidget || !bookingTabs) return;
    const isMobileView = window.matchMedia('(max-width: 992px)').matches;
    const activeTab = block.querySelector('.tab.active');
    const activePanel = activeTab
      ? block.querySelector(`#${activeTab.dataset.tab}`)
      : null;

    if (isMobileView) {
      bookingWidget.classList.add('mobile-tabs');
      tabs.forEach((tab) => {
        tab.setAttribute('aria-expanded', tab.classList.contains('active') ? 'true' : 'false');
      });
      if (activeTab && activePanel) {
        activeTab.insertAdjacentElement('afterend', activePanel);
      }
      return;
    }

    bookingWidget.classList.remove('mobile-tabs');
    tabs.forEach((tab) => tab.removeAttribute('aria-expanded'));
    panels.forEach((panel) => {
      bookingWidget.append(panel);
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      const isMobileView = window.matchMedia('(max-width: 992px)').matches;

      // On mobile: toggle — tapping the open tab closes it
      if (isMobileView && tab.classList.contains('active')) {
        tab.classList.remove('active');
        tab.setAttribute('aria-expanded', 'false');
        const openPanel = block.querySelector(`#${target}`);
        if (openPanel) openPanel.classList.remove('active');
        return;
      }

      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');

      const activePanel = block.querySelector(`#${target}`);

      if (activePanel) {
        activePanel.classList.add('active');
      }

      applyMobileTabLayout();
    });
  });

  applyMobileTabLayout();
  window.addEventListener('resize', applyMobileTabLayout);

  const flightPanel = block.querySelector('#flight');
  const expandTriggers = block.querySelectorAll('.js-expand-trigger');
  const dateToggle = block.querySelector('.js-date-toggle');
  const datePanel = block.querySelector('.date-panel');
  const departureInput = block.querySelector('.js-departure');
  const returnInput = block.querySelector('.js-return');
  const dateSummary = block.querySelector('.js-date-summary');
  const dateConfirm = block.querySelector('.js-date-confirm');

  const passengersToggle = block.querySelector('.js-passengers-toggle');
  const passengersPanel = block.querySelector('.passengers-panel');
  const passengersSummary = block.querySelector('.js-passengers-summary');
  const passengersConfirm = block.querySelector('.js-passengers-confirm');
  const originToggle = block.querySelector('.js-origin-toggle');
  const destinationToggle = block.querySelector('.js-destination-toggle');
  const originPanel = block.querySelector('.origin-panel');
  const destinationPanel = block.querySelector('.destination-panel');
  const originValue = block.querySelector('.js-origin-value');
  const originCode = block.querySelector('.js-origin-code');
  const destinationValue = block.querySelector('.js-destination-value');
  const destinationCode = block.querySelector('.js-destination-code');
  const originSearch = block.querySelector('.js-origin-search');
  const destinationSearch = block.querySelector('.js-destination-search');
  const bookingSearchButton = block.querySelector('#flight .booking-footer-actions .search-flight-btn');

  let selectedTripType = 'round-trip';

  const setInlineSearchState = (toggle, input, isActive) => {
    if (!toggle || !input) return;
    toggle.classList.toggle('is-searching', isActive);
    input.hidden = !isActive;
    if (!isActive) {
      input.value = '';
    }
  };

  const resetLocationFilter = (panel) => {
    if (!panel) return;
    panel.querySelectorAll('.location-option').forEach((option) => {
      option.hidden = false;
    });
  };

  const updatePassengersSummary = () => {
    const adult = Number(block.querySelector('.counter-row[data-type="adult"] [data-value]')?.textContent || 1);
    const child = Number(block.querySelector('.counter-row[data-type="child"] [data-value]')?.textContent || 0);
    const infant = Number(block.querySelector('.counter-row[data-type="infant"] [data-value]')?.textContent || 0);
    const selectedCabin = block.querySelector('input[name="cabin"]:checked')?.value || 'Economy';
    const total = adult + child + infant;
    passengersSummary.textContent = `${total} Passenger${total > 1 ? 's' : ''} / ${selectedCabin}`;
  };

  const formatDateText = (value) => {
    if (!value) return '';
    const dateValue = new Date(value);
    return dateValue.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const updateDateSummary = () => {
    const departure = formatDateText(departureInput?.value);
    const returns = formatDateText(returnInput?.value);
    if (selectedTripType === 'one-way' && departure) {
      dateSummary.textContent = departure;
      return;
    }
    if (departure && returns) {
      dateSummary.textContent = `${departure} - ${returns}`;
    }
  };

  const updateTripTypeDateUI = () => {
    const isOneWay = selectedTripType === 'one-way';
    const returnLabel = returnInput?.closest('label');
    const datePanelGrid = datePanel?.querySelector('.date-panel-grid');
    if (returnLabel) {
      returnLabel.hidden = isOneWay;
    }
    if (returnInput) {
      returnInput.disabled = isOneWay;
    }
    if (datePanelGrid) {
      datePanelGrid.classList.toggle('is-one-way', isOneWay);
    }
    updateDateSummary();
  };

  const formatDateForApi = (value) => {
    if (!value) return '';
    return value;
  };

  const buildFlightSearchUrl = () => {
    const basePath = searchFlightHref || '/content/edsuedemo/us/en/ram/aem/booking/flight-search';
    const params = new URLSearchParams();
    const origin = originCode?.textContent?.trim();
    const destination = destinationCode?.textContent?.trim();
    const depDate = formatDateForApi(departureInput?.value);
    const returnDate = formatDateForApi(returnInput?.value);

    // Passengers / cabin
    const adults = Number(block.querySelector('.counter-row[data-type="adult"] [data-value]')?.textContent || 1);
    const children = Number(block.querySelector('.counter-row[data-type="child"] [data-value]')?.textContent || 0);
    const infants = Number(block.querySelector('.counter-row[data-type="infant"] [data-value]')?.textContent || 0);
    const cabin = (block.querySelector('input[name="cabin"]:checked')?.value || 'Economy').toLowerCase();

    if (origin) params.set('origin', origin);
    if (destination) params.set('destination', destination);
    if (depDate) params.set('depDate', depDate);
    if (selectedTripType !== 'one-way' && returnDate) {
      params.set('returnDate', returnDate);
    }

    params.set('adults', String(Number.isFinite(adults) && adults > 0 ? adults : 1));
    params.set('children', String(Number.isFinite(children) && children >= 0 ? children : 0));
    params.set('infants', String(Number.isFinite(infants) && infants >= 0 ? infants : 0));
    params.set('cabin', cabin === 'business' ? 'business' : 'economy');

    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const closePanels = () => {
    if (datePanel) datePanel.hidden = true;
    if (passengersPanel) passengersPanel.hidden = true;
    if (originPanel) originPanel.hidden = true;
    if (destinationPanel) destinationPanel.hidden = true;
    setInlineSearchState(originToggle, originSearch, false);
    setInlineSearchState(destinationToggle, destinationSearch, false);
    resetLocationFilter(originPanel);
    resetLocationFilter(destinationPanel);
  };

  const activateFocusState = () => {
    flightPanel.classList.add('is-expanded');
    document.body.classList.add('booking-focus-active');
  };

  const clearFocusState = () => {
    document.body.classList.remove('booking-focus-active');
  };

  const setupLocationSearch = (input, panel) => {
    if (!input || !panel) return;
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('input', () => {
      const searchValue = input.value.trim().toLowerCase();
      panel.querySelectorAll('.location-option').forEach((option) => {
        const searchableText = option.textContent.toLowerCase();
        option.hidden = searchValue && !searchableText.includes(searchValue);
      });
    });
  };

  const tripButtons = block.querySelectorAll('.trip-btn');
  tripButtons.forEach((tripButton) => {
    tripButton.addEventListener('click', () => {
      tripButtons.forEach((node) => node.classList.remove('active'));
      tripButton.classList.add('active');
      const rawType = (tripButton.textContent || '').trim().toLowerCase();
      selectedTripType = rawType === 'one-way' ? 'one-way' : rawType === 'multi-city' ? 'multi-city' : 'round-trip';
      updateTripTypeDateUI();
      activateFocusState();
    });
  });

  expandTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      activateFocusState();
    });
  });

  if (originToggle && originPanel) {
    originPanel.addEventListener('click', (e) => e.stopPropagation());
    originToggle.addEventListener('click', () => {
      activateFocusState();
      const shouldShow = originPanel.hidden;
      closePanels();
      originPanel.hidden = !shouldShow;
      if (!originPanel.hidden) {
        setInlineSearchState(originToggle, originSearch, true);
        originSearch?.focus();
      }
    });
  }

  if (destinationToggle && destinationPanel) {
    destinationPanel.addEventListener('click', (e) => e.stopPropagation());
    destinationToggle.addEventListener('click', () => {
      activateFocusState();
      const shouldShow = destinationPanel.hidden;
      closePanels();
      destinationPanel.hidden = !shouldShow;
      if (!destinationPanel.hidden) {
        setInlineSearchState(destinationToggle, destinationSearch, true);
        destinationSearch?.focus();
      }
    });
  }

  originPanel?.querySelectorAll('.location-option').forEach((option) => {
    option.addEventListener('click', () => {
      originPanel.querySelectorAll('.location-option').forEach((node) => node.classList.remove('active'));
      option.classList.add('active');
      originValue.textContent = option.dataset.value || originValue.textContent;
      originCode.textContent = option.dataset.code || originCode.textContent;
      closePanels();
    });
  });

  destinationPanel?.querySelectorAll('.location-option').forEach((option) => {
    option.addEventListener('click', () => {
      destinationPanel.querySelectorAll('.location-option').forEach((node) => node.classList.remove('active'));
      option.classList.add('active');
      destinationValue.textContent = option.dataset.value || destinationValue.textContent;
      destinationCode.textContent = option.dataset.code || destinationCode.textContent;
      closePanels();
    });
  });

  setupLocationSearch(originSearch, originPanel);
  setupLocationSearch(destinationSearch, destinationPanel);

  if (bookingSearchButton) {
    bookingSearchButton.addEventListener('click', (event) => {
      event.preventDefault();
      const searchUrl = buildFlightSearchUrl();
      window.location.href = searchUrl;
    });
  }

  if (dateToggle && datePanel) {
    datePanel.addEventListener('click', (e) => e.stopPropagation());
    dateToggle.addEventListener('click', () => {
      activateFocusState();
      const shouldShow = datePanel.hidden;
      closePanels();
      datePanel.hidden = !shouldShow;
    });
  }

  if (dateConfirm) {
    dateConfirm.addEventListener('click', () => {
      updateDateSummary();
      if (datePanel) datePanel.hidden = true;
    });
  }

  if (passengersToggle && passengersPanel) {
    passengersPanel.addEventListener('click', (e) => e.stopPropagation());
    passengersToggle.addEventListener('click', () => {
      activateFocusState();
      const shouldShow = passengersPanel.hidden;
      closePanels();
      passengersPanel.hidden = !shouldShow;
    });
  }

  const counterRows = block.querySelectorAll('.counter-row');
  counterRows.forEach((row) => {
    const minus = row.querySelector('.js-minus');
    const plus = row.querySelector('.js-plus');
    const valueNode = row.querySelector('[data-value]');
    const type = row.getAttribute('data-type');

    minus?.addEventListener('click', () => {
      const current = Number(valueNode.textContent || '0');
      const nextValue = type === 'adult' ? Math.max(1, current - 1) : Math.max(0, current - 1);
      valueNode.textContent = String(nextValue);
    });

    plus?.addEventListener('click', () => {
      const current = Number(valueNode.textContent || '0');
      valueNode.textContent = String(current + 1);
    });
  });

  if (passengersConfirm) {
    passengersConfirm.addEventListener('click', () => {
      updatePassengersSummary();
      if (passengersPanel) passengersPanel.hidden = true;
    });
  }

  document.addEventListener('click', (event) => {
    if (!flightPanel.contains(event.target)) {
      closePanels();
      clearFocusState();
      flightPanel.classList.remove('is-expanded');
    } else {
      activateFocusState();
    }
  });

  block.querySelectorAll('input[name="cabin"]').forEach((radio) => {
    radio.addEventListener('change', updatePassengersSummary);
  });

  updateTripTypeDateUI();
  updatePassengersSummary();

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
  initializeEventTracking(block);
}
