import { fetchCFFromPublish } from '../cards/ai-descriptions.js';


const AEM_PUBLISH_ORIGIN = 'https://publish-p24103-e71623.adobeaemcloud.com';

function getProductIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  return id ? decodeURIComponent(id) : null;
}

export default async function decorate(block) {
  const productId = getProductIdFromQuery();

  if (!productId) { block.innerHTML = '<p>Product not found.</p>'; return; }

  const cf = await fetchCFFromPublish(productId);
  if (!cf) { block.innerHTML = '<p>Product not found.</p>'; return; }

  // PDP uses the longer pdpDescription, falling back to aiDescription, then default
  const description = (cf.verified && cf.pdpDescription)
    || (cf.verified && cf.aiDescription)
    || cf.defaultDescription
    || '';

  block.innerHTML = `
    <div class="product-detail-banner"></div>
    <h1 class="product-detail-title"></h1>
    <p class="product-detail-description"></p>
  `;

  const banner = block.querySelector('.product-detail-banner');

  if (cf.image) {
    const bannerImgUrl = `${AEM_PUBLISH_ORIGIN}${cf.image}/jcr:content/renditions/pdp-portrait.jpeg`;
    const img = document.createElement('img');
    img.src = bannerImgUrl;
    img.alt = cf.productId || productId;
    banner.appendChild(img);
  } else {
    banner.remove();
  }

  block.querySelector('.product-detail-title').textContent = cf.productId || productId;
  block.querySelector('.product-detail-description').innerHTML = description;
}