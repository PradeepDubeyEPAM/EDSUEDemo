export default function decorate(block) {
  block.setAttribute('id', 'brand-concierge-mount');

  if (!window.adobe || !window.adobe.concierge) {
    // eslint-disable-next-line no-console
    console.warn('Brand Concierge SDK (window.adobe.concierge) not available yet');
    return;
  }

  window.adobe.concierge.bootstrap({
    instanceName: 'alloy',
    stylingConfigurations: window.styleConfiguration,
    selector: '#brand-concierge-mount',
    stickySession: false,
  });
}