import { loadFragment } from '../fragment/fragment.js';

const HEADER_FRAGMENT_PATH = '/content/experience-fragments/aem-cloud-poc/us/en/site/global/header/master';

function renderFragment(block, fragment) {
  const fragmentSection = fragment.querySelector(':scope > .section');
  if (fragmentSection) {
    block.classList.add(...fragmentSection.classList);
    block.classList.remove('section');
    block.replaceChildren(...fragmentSection.childNodes);
    return;
  }

  block.replaceChildren(...fragment.childNodes);
}

export default async function decorate(block) {
  const fragment = await loadFragment(HEADER_FRAGMENT_PATH);

  if (!fragment) {
    // eslint-disable-next-line no-console
    console.error('Royal header fragment could not be loaded.', HEADER_FRAGMENT_PATH);
    return;
  }

  block.textContent = '';
  renderFragment(block, fragment);
}
