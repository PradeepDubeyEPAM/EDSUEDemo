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
         

          <h1></h1>

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
                    <span class="field-value js-origin-value">Casablanca, Morocco</span>
                    <input class="field-inline-search js-origin-search" type="text" placeholder="" hidden />
                    <span class="field-code js-origin-code">CMN</span>

                    <div class="field-dropdown-panel location-panel origin-panel" hidden>
                      <button type="button" class="location-option active" data-value="Casablanca, Morocco" data-code="CMN">
                        <span class="loc-main">Casablanca <span>Morocco</span></span>
                        <span class="loc-sub">Mohammed V Intl</span>
                        <span class="loc-code">CMN</span>
                      </button>
                      <button type="button" class="location-option" data-value="Santiago de Compostela, Spain" data-code="SCQ">
                        <span class="loc-main">Santiago de Compostela <span>Spain</span></span>
                        <span class="loc-sub">Santiago de Compostela</span>
                        <span class="loc-code">SCQ</span>
                      </button>
                      <button type="button" class="location-option" data-value="Ottawa, Canada" data-code="YOW">
                        <span class="loc-main">Ottawa <span>Canada</span></span>
                        <span class="loc-sub">Ottawa Macdonald-Cartier Intl</span>
                        <span class="loc-code">YOW</span>
                      </button>
                      <button type="button" class="location-option" data-value="Jacksonville, United States" data-code="JAX">
                        <span class="loc-main">Jacksonville <span>United States</span></span>
                        <span class="loc-sub">Jacksonville Intl</span>
                        <span class="loc-code">JAX</span>
                      </button>
                      <button type="button" class="location-option" data-value="Zagreb, Croatia" data-code="ZAG">
                        <span class="loc-main">Zagreb <span>Croatia</span></span>
                        <span class="loc-sub">Franjo Tudman</span>
                        <span class="loc-code">ZAG</span>
                      </button>
                      <button type="button" class="location-option" data-value="Pamplona, Spain" data-code="PNA">
                        <span class="loc-main">Pamplona <span>Spain</span></span>
                        <span class="loc-sub">Pamplona</span>
                        <span class="loc-code">PNA</span>
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
                      <button type="button" class="location-option" data-value="Abidjan, Ivory Coast" data-code="ABJ">
                        <span class="loc-main">Abidjan <span>Ivory Coast</span></span>
                        <span class="loc-sub">Felix Houphouet-Boigny</span>
                        <span class="loc-code">ABJ</span>
                      </button>
                      <button type="button" class="location-option" data-value="Abu Dhabi, United Arab Emirates" data-code="AUH">
                        <span class="loc-main">Abu Dhabi <span>United Arab Emirates</span></span>
                        <span class="loc-sub">Abu Dhabi Intl</span>
                        <span class="loc-code">AUH</span>
                      </button>
                      <button type="button" class="location-option" data-value="Accra, Ghana" data-code="ACC">
                        <span class="loc-main">Accra <span>Ghana</span></span>
                        <span class="loc-sub">Kotoka Intl</span>
                        <span class="loc-code">ACC</span>
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
    description.textContent = 'Discover exclusive fares and premium travel experiences across Europe, Africa, and North America.';
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
    if (departure && returns) {
      dateSummary.textContent = `${departure} - ${returns}`;
    }
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

  updateDateSummary();
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
}
