import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { addAIDescriptions } from './ai-descriptions.js';  

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);

    while (row.firstElementChild) li.append(row.firstElementChild);

    const children = [...li.children];

    children.forEach((div) => {
      if (div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
        const rawTitle = div.textContent.trim();
        if (rawTitle) {
          div.innerHTML = `<p class="cards-card-title">${rawTitle}</p>`;
        }
      }
    });

    // product id
    const last = children[children.length - 1];
    if (last && !last.querySelector('picture')) {
      const productId = last.textContent.trim();
      if (productId) {
        li.dataset.productId = productId;
        last.remove(); // hide from UI
      }
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  ul.querySelectorAll('li').forEach((li) => {
    const productId = li.dataset.productId;
    if (!productId) return;

    const link = document.createElement('a');
    // Path-based routing: one page handles all product IDs dynamically
    link.href = `/us/en/offer-products/product-detail/${encodeURIComponent(productId)}`;
    link.className = 'cards-card-link';
    while (li.firstChild) link.append(li.firstChild);
    li.append(link);
  });

  block.replaceChildren(ul);
  addAIDescriptions(block);
}