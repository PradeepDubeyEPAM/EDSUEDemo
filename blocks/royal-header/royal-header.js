import { loadFragment } from '../fragment/fragment.js';

const HEADER_FRAGMENT_PATH = '/content/experience-fragments/aem-cloud-poc/us/en/site/global/header/master';

function renderFragment(block, fragment) {
  const fragmentSection = fragment.querySelector(':scope .section');
  if (fragmentSection && fragment.children.length === 1) {
    block.classList.add(...fragmentSection.classList);
    block.classList.remove('section');
    block.replaceChildren(...fragmentSection.childNodes);
    return;
  }

  const content = document.createElement('div');
  content.className = 'royal-header-content';
  while (fragment.firstElementChild) {
    content.append(fragment.firstElementChild);
  }

  block.append(content);
}

export default async function decorate(block) {
  const fragment = await loadFragment(HEADER_FRAGMENT_PATH);
  block.textContent = '';

  if (!fragment) {
    return;
  }

  renderFragment(block, fragment);
}
