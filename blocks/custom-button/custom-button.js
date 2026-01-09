/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
export default function decorate(block) {
  if (!block.classList.contains('custom-button')) return;

  const buttons = block.querySelectorAll('.button.secondary');

  window.adobeDataLayer = window.adobeDataLayer || [];
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const dataLayerObject = {
        event: 'custom_button_click',
        eventInfo: {
          block_type: 'custom-button',
          url: button.href,
          cta_text: button.textContent.trim(),
          position: index + 1,
        },
      };
      window.adobeDataLayer.push(dataLayerObject);
      if (window._satellite && typeof window._satellite.track === 'function') {
        _satellite.track(dataLayerObject.event, window.adobeDataLayer);
      }
    });
  });
}
