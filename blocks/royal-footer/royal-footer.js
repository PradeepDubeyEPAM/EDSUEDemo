export default async function decorate(block) {
  try {
    const xfPath = '/content/experience-fragments/aem-cloud-poc/us/en/site/footer-xf/master';
    const resp = await fetch(`${xfPath}.plain.html`);
    console.log('Fetching royal footer content');
    if (resp.ok) {
      block.innerHTML = await resp.text();
    } else {
      block.innerHTML = '<p>Footer content not available</p>';
    }
  } catch (error) {
    console.error('Error loading royal footer:', error);
    block.innerHTML = '<p>Error loading footer content</p>';
  }
}