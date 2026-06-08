function pushToDataLayer(eventName, eventData) {
  window.adobeDataLayer = window.adobeDataLayer || [];
  const dataLayerObject = {
    event: eventName,
    eventInfo: eventData,
  };
  window.adobeDataLayer.push(dataLayerObject);

  if (window._satellite && typeof window._satellite.track === 'function') {
    window._satellite.track(eventName, window.adobeDataLayer);
  }
}

export function initializeEventTracking(block, componentName) {
  if (!block) {
    console.warn('Event tracking requires block element');
    return;
  }

   // Track button clicks (
   block.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (button) {
        const eventData = {
          component: componentName,
          element_id: button.id || 'unknown',
          element_text: button.textContent?.trim().substring(0, 100),
          element_class: button.className,
        };

        // Add location data if it's a location-option button (destination/origin)
        if (button.classList.contains('location-option')) {
          eventData.location_code = button.getAttribute('data-code');
          eventData.location_value = button.getAttribute('data-value');
        }

         // Add passenger count if it's a counter button (adult, child, infant)
         const counterRow = button.closest('.counter-row');
         if (counterRow) {
           eventData.button_type = button.classList.contains('js-plus') ? 'increment' : 'decrement';
           setTimeout(() => {
             const passengerType = counterRow.getAttribute('data-type');
             const counterValue = counterRow.querySelector('.counter-value')?.textContent?.trim() || '0';
             eventData.passenger_type = passengerType;
             eventData.counter_value = counterValue;
             pushToDataLayer(`${componentName}_button_click`, eventData);
           }, 100);
         } else {
           pushToDataLayer(`${componentName}_button_click`, eventData);
         }
      }

      // Track dropdown arrow click (div with data-field attribute)
      // including the dropdown direction
      const dropdownDiv = e.target.closest('[data-field]');
      if (dropdownDiv && dropdownDiv.classList.contains('ram-booking-field-btn')) {
        const fieldType = dropdownDiv.getAttribute('data-field');
        const dropdownPanel = dropdownDiv.querySelector('.field-dropdown-panel');
        const isOpen = dropdownPanel && !dropdownPanel.hasAttribute('hidden');
        const arrowDirection = isOpen ? 'up' : 'down';

        const eventData = {
          component: componentName,
          field_type: fieldType,
          field_class: dropdownDiv.className,
          arrow_direction: arrowDirection,
          action: 'dropdown_arrow_click',
        };
        pushToDataLayer(`${componentName}_dropdown_arrow_click`, eventData);
      }
   }, true);

  // Track date input changes
  block.addEventListener('change', (e) => {
    if (e.target.type === 'date' || e.target.type === 'datetime-local') {
      const eventData = {
        component: componentName,
        element_id: e.target.id || 'unknown',
        element_name: e.target.name,
        date_value: e.target.value,
      };
      pushToDataLayer(`${componentName}_date_change`, eventData);
    }
  }, true);
}
