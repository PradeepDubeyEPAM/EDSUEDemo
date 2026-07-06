import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchCFFromPublish } from '../ai-descriptions/ai-descriptions.js';

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    block.innerHTML = '<p>Product not found.</p>';
    return;
  }

  const cf = await fetchCFFromPublish(productId);
  if (!cf) {
    block.innerHTML = '<p>Product not found.</p>';
    return;
  }

  const description = (cf.verified && cf.aiDescription) || cf.defaultDescription || '';

  block.innerHTML = `
    <div class="product-detail-banner"></div>
    <h1 class="product-detail-title"></h1>
    <p class="product-detail-description"></p>
  `;

  block.querySelector('.product-detail-title').textContent = cf.productId || productId;
  block.querySelector('.product-detail-description').innerHTML = description;
}