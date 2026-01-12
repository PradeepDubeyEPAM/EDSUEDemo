export default function firePageLoadEvent() {
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
  if (window._satellite && typeof window._satellite.track === 'function') {
    _satellite.track(dataLayerObject.event, window.adobeDataLayer);
  }
}

firePageLoadEvent();
