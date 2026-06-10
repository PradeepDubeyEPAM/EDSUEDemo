function pushToDataLayer(eventName, eventData) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  const dataLayerObject = {
    event: eventName,
    data: eventData,
  };
  window.adobeDataLayer.push(dataLayerObject);

  if (window._satellite && typeof window._satellite.track === 'function') {
    window._satellite.track(eventName, window.adobeDataLayer);
  }
}

export function capturePageLoadDefaults(block) {
  const defaultData = {
    trip_type: block.querySelector('.trip-btn.active')?.textContent?.trim().toLowerCase() || 'round-trip',
    origin_value: block.querySelector('.js-origin-value')?.textContent?.trim() || '',
    origin_code: block.querySelector('.js-origin-code')?.textContent?.trim() || '',
    destination_value: block.querySelector('.js-destination-value')?.textContent?.trim() || '',
    destination_code: block.querySelector('.js-destination-code')?.textContent?.trim() || '',
    departure_date: block.querySelector('.js-departure')?.value || '',
    return_date: block.querySelector('.js-return')?.value || '',
    adults: block.querySelector('.counter-row[data-type="adult"] .counter-value')?.textContent?.trim() || '1',
    children: block.querySelector('.counter-row[data-type="child"] .counter-value')?.textContent?.trim() || '0',
    infants: block.querySelector('.counter-row[data-type="infant"] .counter-value')?.textContent?.trim() || '0'
  };

  pushToDataLayer('page_load_defaults', defaultData);
}

export function initializeEventTracking(block) {
  if (!block) {
    console.warn('Event tracking requires block element');
    return;
  }

  capturePageLoadDefaults(block);

  // Track tab changes (action_type: booking, checkin, flight_status)
  const bookingTabs = block.querySelectorAll('.tab');
  bookingTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabType = tab.getAttribute('data-tab');
      const eventData = {
        action_type: tabType === 'flight' ? 'booking' : tabType,
      };
      pushToDataLayer('action_type', eventData);
    });
  });

   // Track trip type changes (round-trip, one-way, multi-city)
   const tripButtons = block.querySelectorAll('.trip-btn');
   tripButtons.forEach((btn) => {
     btn.addEventListener('click', () => {
       const eventData = {
         action_type: 'booking',
         trip_type: btn.textContent?.trim().toLowerCase(),
       };
       pushToDataLayer('trip_type', eventData);
     });
   });

    // Track location selection (origin/destination) -
    const locationPanels = {
      origin: block.querySelector('.origin-panel'),
      destination: block.querySelector('.destination-panel'),
    };

    Object.entries(locationPanels).forEach(([fieldType, panel]) => {
      if (panel) {
        const locationButtons = panel.querySelectorAll('.location-option');
        locationButtons.forEach((btn) => {
          btn.addEventListener('click', () => {
            const eventData = {
              [fieldType]: btn.getAttribute('data-value'),
              [`${fieldType}_code`]: btn.getAttribute('data-code'),
            };
            pushToDataLayer(`${fieldType}_select`, eventData);
          });
        });
      }
    });

    // Track dropdown arrow clicks (origin/destination)
    const locationDropdowns = block.querySelectorAll('[data-field]');
    locationDropdowns.forEach((dropdown) => {
      dropdown.addEventListener('click', (e) => {
        if (!e.target.classList.contains('location-option')) {
          const fieldType = dropdown.getAttribute('data-field');
          const dropdownPanel = dropdown.querySelector('.field-dropdown-panel');
          const isOpen = dropdownPanel && !dropdownPanel.hasAttribute('hidden');
          const dropdownDirection = isOpen ? 'up' : 'down';

          const eventData = {
            dropdown_direction: dropdownDirection,
          };
          pushToDataLayer(`${fieldType}_dropdown`, eventData);
        }
      });
    });

   // Track date changes (departure_date, return_date)
  const dateInputs = block.querySelectorAll('.js-departure, .js-return');
  dateInputs.forEach((input) => {
    input.addEventListener('change', () => {
      const dateType = input.classList.contains('js-departure') ? 'departure_date' : 'return_date';
      const eventData = {
        [dateType]: input.value,
      };
      pushToDataLayer(`${dateType}_select`, eventData);
    });
  });

  // Track passenger count changes (adult, child, infant)
  const counterButtons = block.querySelectorAll('.counter-btn');
  counterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {

      setTimeout(() => {
        const adultCount = block.querySelector('.counter-row[data-type="adult"] .counter-value')?.textContent?.trim() || '1';
        const childCount = block.querySelector('.counter-row[data-type="child"] .counter-value')?.textContent?.trim() || '0';
        const infantCount = block.querySelector('.counter-row[data-type="infant"] .counter-value')?.textContent?.trim() || '0';

         const eventData = {
           passenger_count: {
             adult_count: adultCount,
             child_count: childCount,
             infant_count: infantCount,
           },
         };
        pushToDataLayer('passenger_count_change', eventData);
       }, 100);
     });
   });

    // Track cabin class selection (Business/Economy radio buttons)
    const cabinRadios = block.querySelectorAll('.cabin-options input[type="radio"]');
    cabinRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const eventData = {
            class: radio.value,
          };
          pushToDataLayer('cabin_select', eventData);
        }
      });
    });

   // Track search button click
  const searchBtn = block.querySelector('.search-flight-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const eventData = {
          submitted : true
      };
      pushToDataLayer('search_flight', eventData);
    });
  }
}
