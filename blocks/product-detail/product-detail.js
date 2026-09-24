import { fetchAPI } from '../../scripts/api.js';
import { fetchLocalCurrency } from '../../scripts/currency-conversion.js';

// escape values before using them in innerHTML
function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

// Fallback formatter used when currency conversion fails
function formatCurrency(value, currency) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
}

function setRecentlyViewedProducts(sku) {
  const key = 'recentlyViewedProducts';
  const limit = 4;
  let arr = [];
  try {
    const stored = localStorage.getItem(key);
    arr = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Could not read recently viewed products:', e);
  }
  arr = arr.filter((item) => item !== sku);
  arr.unshift(sku);

  if (arr.length > limit) {
    arr = arr.slice(0, limit);
  }

  localStorage.setItem(key, JSON.stringify(arr));
}

export default async function decorate(block) {
  block.innerHTML = '<div class="pd-state">Loading product...</div>';

  const sku = localStorage.getItem('selectedProduct');

  if (!sku) {
    block.innerHTML = '<div class="pd-state">No product selected</div>';
    return;
  }

  if (localStorage.getItem('userSession')) {
    setRecentlyViewedProducts(sku);
  }

  const query = `
    query GetProduct($sku: String!) {
      GraphQL_products(filter: { sku: { eq: $sku } }) {
        items {
          name
          sku
          description {
            html
          }
          price_range {
            maximum_price {
              final_price {
                value
                currency
              }
            }
          }
          thumbnail {
            url
            label
          }
        }
      }
    }
  `;

  try {
    const response = await fetchAPI(query, { sku });
    const product = response?.data?.GraphQL_products?.items?.[0];

    if (!product) {
      block.innerHTML = '<div class="pd-state">Product not found</div>';
      return;
    }

    const priceObj = product.price_range?.maximum_price?.final_price;
    const image = product.thumbnail?.url;
    const imageAlt = product.thumbnail?.label || product.name;
    const descriptionHtml = product.description?.html || '';

    // Currency conversion, with a fallback so a failed conversion never blanks the page
    let price = '';
    if (priceObj?.currency && priceObj.value != null) {
      try {
        price = await fetchLocalCurrency(priceObj.currency, priceObj.value);
      } catch (e) {
        console.error('Conversion failed:', e);
      }
      if (!price) price = formatCurrency(priceObj.value, priceObj.currency);
    }

    block.innerHTML = `
      <div class="pd-wrapper">
        <button type="button" class="pd-back">← Back to products</button>
        <div class="pd-card">
          <div class="pd-media">
            ${image
    ? `<img class="pd-image" src="${esc(image)}" alt="${esc(imageAlt)}"/>`
    : '<div class="pd-noimage" aria-hidden="true">🛍️</div>'}
          </div>
          <div class="pd-info">
            <span class="pd-badge">Venia Commerce · GraphQL</span>
            <h1>${esc(product.name)}</h1>
            <span class="pd-sku">SKU: ${esc(product.sku)}</span>
            ${price ? `<p class="pd-price">${esc(price)}</p>` : ''}
            ${descriptionHtml ? `
            <div class="pd-divider"></div>
            <div class="pd-description">
              <h3 class="pd-section-title">Description</h3>
              ${descriptionHtml}
            </div>` : ''}
            <div class="pd-mesh-note">⚡ Served via API Mesh</div>
          </div>
        </div>
      </div>
    `;

    block.querySelector('.pd-back')?.addEventListener('click', () => window.history.back());
  } catch (error) {
    console.error('Product detail error:', error);
    block.innerHTML = '<div class="pd-state">Failed to load product</div>';
  }
}