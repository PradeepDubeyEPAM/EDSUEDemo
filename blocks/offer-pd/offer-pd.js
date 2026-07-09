import { fetchCFFromPublish } from '../cards/ai-descriptions.js';

const AEM_PUBLISH_ORIGIN = 'https://publish-p24103-e71623.adobeaemcloud.com';

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) { block.innerHTML = '<p>Product not found.</p>'; return; }

  const cf = await fetchCFFromPublish(productId);
  if (!cf) { block.innerHTML = '<p>Product not found.</p>'; return; }

  const description = (cf.verified && cf.aiDescription) || cf.defaultDescription || '';

  block.innerHTML = `
    <div class="product-detail-banner"></div>
    <h1 class="product-detail-title"></h1>
    <p class="product-detail-description"></p>
  `;

  const banner = block.querySelector('.product-detail-banner');
  if (cf.image) {
    const bannerImgUrl = `${AEM_PUBLISH_ORIGIN}${cf.image}/jcr:content/renditions/pdp-portrait.jpeg`;
    banner.innerHTML = `<img src="${bannerImgUrl}" alt="${cf.productId || productId}">`;
  } else {
    banner.remove();
  }

  block.querySelector('.product-detail-title').textContent = cf.productId || productId;
  block.querySelector('.product-detail-description').innerHTML = description;
}