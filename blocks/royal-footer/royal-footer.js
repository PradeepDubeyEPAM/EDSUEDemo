import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  try {
    const xfPath = '/content/experience-fragments/aem-cloud-poc/us/en/site/footer-xf/master';
    const fragment = await loadFragment(xfPath);
    console.log('Fetching XF');
    if (fragment) {
      // Move all content from the fragment to the block
      block.replaceChildren(...fragment.childNodes);
    } else {
      block.innerHTML = '<p>Footer content not available</p>';
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading royal footer:', error);
    block.innerHTML = '<p>Error loading footer content</p>';
  }
}
