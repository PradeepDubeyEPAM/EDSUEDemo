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

  // Track button clicks
  block.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (button) {
      const eventData = {
        component: componentName,
        element_id: button.id || 'unknown',
        element_text: button.textContent?.trim().substring(0, 100),
        element_class: button.className,
      };
      pushToDataLayer(`${componentName}_button_click`, eventData);
    }
  }, true);

  // Track text and date input changes
  block.addEventListener('change', (e) => {
    if (e.target.type === 'text' || e.target.type === 'search') {
      const eventData = {
        component: componentName,
        element_id: e.target.id || 'unknown',
        element_name: e.target.name,
        value_length: e.target.value?.length || 0,
      };
      pushToDataLayer(`${componentName}_text_input_change`, eventData);
    }
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

  //console.log(`✅ Event Tracking Initialized for ${componentName}`);
}
