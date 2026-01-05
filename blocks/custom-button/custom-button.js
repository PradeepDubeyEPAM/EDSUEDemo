export default function decorate(block) {
  const button = document.querySelector('.custom-button .button.secondary');
  window.adobeDataLayer = window.adobeDataLayer || [];

  const pageLoadData = {
    event: 'page-load',
    page: {
      pageInfo: {
        url: window.location.href,
        pageName: document.title,
        region: 'us',
      },
    },
  };
  window.adobeDataLayer.push(pageLoadData);
  /* global _satellite:readonly */
  _satellite.track(pageLoadData.event, window.adobeDataLayer);
  if (button) {
    const LINK_CLICK_EVENT_NAME = 'custom_button_click';

    button.addEventListener('click', () => {
    // datalayer push event
      const dataLayerObject = {
        event: LINK_CLICK_EVENT_NAME,
        eventInfo: {
          block_type: 'custom-button',
          url: button.href,
          cta_text: button.textContent,
        },
      };

      if (window.adobeDataLayer && typeof window.adobeDataLayer.push === 'function') {
        window.adobeDataLayer.push(dataLayerObject);
      }
      _satellite.track(dataLayerObject.event, window.adobeDataLayer);
    });
  }

  block.append(button);
}
