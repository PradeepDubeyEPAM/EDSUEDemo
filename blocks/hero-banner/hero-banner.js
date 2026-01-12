import { fetchPlaceholders } from '../../scripts/placeholders.js';

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  console.log("This is placeholder value",placeholders.herobannertitle, placeholders.herobannerdescription);
  // Clear whatever UE generated
  block.innerHTML = '';

  // Root wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-banner__wrapper';

  // Background image
  const bg = document.createElement('div');
  bg.className = 'hero-banner__bg';
  bg.style.backgroundImage = `url(${placeholders.herobannerimage})`;

  // Content overlay
  const content = document.createElement('div');
  content.className = 'hero-banner__content';

  const title = document.createElement('h1');
  title.textContent = placeholders.herobannertitle || '';

  const description = document.createElement('p');
  description.textContent = placeholders.herobannerdescription || '';

  content.append(title, description);
  wrapper.append(bg, content);
  block.append(wrapper);
}
