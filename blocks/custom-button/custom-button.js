export default function decorate(block) {
  const button = document.querySelector('.custom-button .button.secondary');
  window.adobeDataLayer = window.adobeDataLayer || [];
  if (button) {
    const LINK_CLICK_EVENT_NAME = 'custom_button_click';
    const internalCampaignId = '';
    button.addEventListener('click', () => {
    // datalayer push event
      const dataLayerObject = {
        event: LINK_CLICK_EVENT_NAME,
        eventInfo: {
          block_type: 'custom-button',
          url: button.href,
          cta_text: button.textContent,
          internal_campaign_id: internalCampaignId,
        },
      };

      if (window.adobeDataLayer && typeof window.adobeDataLayer.push === 'function') {
        window.adobeDataLayer.push(dataLayerObject);
      }
      /* global _satellite:readonly */
      _satellite.track(dataLayerObject.event, window.adobeDataLayer);
    });
  }

  block.append(button);
}
