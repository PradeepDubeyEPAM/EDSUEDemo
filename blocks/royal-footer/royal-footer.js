export default async function decorate(block) {
  try {
    const xfPath = '/content/experience-fragments/aem-cloud-poc/us/en/site/footer-xf/master';

    const resp = await fetch(`${xfPath}.plain.html`);

    if (!resp.ok) {
      throw new Error(`Failed to fetch XF: ${resp.status}`);
    }

    const html = await resp.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    console.log('tempDiv:', tempDiv);
    const spaRoot = tempDiv.querySelector('#spa-root');
    console.log('spaRoot:', spaRoot);

    if (spaRoot) {
      console.log('Successfully appending spa-root to block');
      block.appendChild(spaRoot.cloneNode(true));
    } else {
      block.innerHTML = '<p>Footer content not available</p>';
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading royal footer:', error);
    block.innerHTML = '<p>Error loading footer content</p>';
  }
}
