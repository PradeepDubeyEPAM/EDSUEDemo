export default function firePageLoadEvent() {
  window.adobeDataLayer = window.adobeDataLayer || [];

  window.adobeDataLayer.push({
    event: 'page-load',
    page: {
      pageInfo: {
        url: window.location.href,
        pageName: document.title || '',
        language: document.documentElement.lang || 'en',
      },
    },
  });
  console.log('from page load.js');
}

firePageLoadEvent();
