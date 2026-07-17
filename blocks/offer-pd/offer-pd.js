import { fetchCFFromPublish } from '../cards/ai-descriptions.js';

const AEM_PUBLISH_ORIGIN = 'https://publish-p24103-e71623.adobeaemcloud.com';

export default async function decorate(block) {
  // Rewrite serves base page but URL keeps product ID in path
  const pathParts = window.location.pathname.split('/');
  const lastSegment = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
  const productId = (lastSegment && lastSegment !== 'product-detail') ? decodeURIComponent(lastSegment) : null;

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