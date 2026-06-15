// import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Loads and decorates the royal footer from AEM Experience Fragment
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  try {
    // Get AEM XF path from metadata or use default
    const xfPath = ' /content/experience-fragments/aem-cloud-poc/us/en/site/footer-xf/master';
    // Load the Experience Fragment
    const fragment = await loadFragment(xfPath);

    if (fragment) {
      // Clear existing content
      block.textContent = '';

      // Create container for the footer content
      const footerContainer = document.createElement('div');
      footerContainer.classList.add('royal-footer-container');

      // Append all content from the fragment
      while (fragment.firstElementChild) {
        footerContainer.append(fragment.firstElementChild);
      }

      block.append(footerContainer);
    } else {
      // eslint-disable-next-line no-console
      console.error('Failed to load Experience Fragment');
      block.innerHTML = '<p>Footer content not available</p>';
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading royal footer:', error);
    block.innerHTML = '<p>Error loading footer content</p>';
  }
}
