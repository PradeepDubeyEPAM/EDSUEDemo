export function getAemHost() {
  const { hostname } = window.location;

  // Preview environment → non-prod AEM
  if (hostname.endsWith('.aem.page')) {
    return 'https://publish-p24103-e71623.adobeaemcloud.com'; // stage/non-prod publish
  }

  // Live environment → prod AEM
  if (hostname.endsWith('.aem.live')) {
    return 'https://publish-p24103-e71623.adobeaemcloud.com'; // change this to prod publish later
  }

  // Local dev fallback
  return 'https://publish-p24103-e71623.adobeaemcloud.com';
}