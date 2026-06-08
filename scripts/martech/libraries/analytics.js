/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
export default function firePageLoadEvent() {
  console.log('firePageLoadEvent() triggered - analytics.js');
  window.adobeDataLayer = window.adobeDataLayer || [];
  const dataLayerObject = {
    event: 'page-load',
    page: {
      pageInfo: {
        url: window.location.href,
        pageName: document.title || '',
        language: document.documentElement.lang || 'en',
      },
    },
  };
  window.adobeDataLayer.push(dataLayerObject);
  console.log('Page data pushed to adobeDataLayer:', dataLayerObject);
  if (window._satellite && typeof window._satellite.track === 'function') {
    _satellite.track(dataLayerObject.event, window.adobeDataLayer);
    console.log('_satellite.track() sent successfully');
  }
}

firePageLoadEvent();
