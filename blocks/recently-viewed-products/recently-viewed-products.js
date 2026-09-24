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

function renderEmpty(block, title) {
  block.innerHTML = `
    <h2 class="title">${esc(title)}</h2>
    <div class="rvp-empty">
      <span class="rvp-empty-icon" aria-hidden="true">🕘</span>
      <h4>There are no recently viewed products...</h4>
    </div>
  `;
}

export default async function decorate(block) {
  const isLoggedIn = localStorage.getItem('userSession');
  const pdpUrl = getPDPFieldValue(block);
  const title = getTitleFieldValue(block);

  // Read the stored SKUs safely
  let arr = [];
  try {
    const stored = localStorage.getItem('recentlyViewedProducts');
    arr = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Could not read recently viewed products:', e);
  }

  if (!isLoggedIn || !Array.isArray(arr) || arr.length === 0) {
    renderEmpty(block, title);
    return;
  }

  // Loading state
  block.innerHTML = `
    <h2 class="title">${esc(title)}</h2>
    <div class="rvp-loading">Loading...</div>
  `;

  const query = `
  query GetProductsBySkus($arr: [String!]) {
    GraphQL_products(filter: { sku: { in: $arr } }) {
      items {
        name
        sku
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
    const response = await fetchAPI(query, { arr });

    if (!response || !response.data) {
      throw new Error('Invalid API response');
    }

    const products = response.data.GraphQL_products?.items || [];

    if (products.length === 0) {
      block.innerHTML = '<div class="api-data-error">No products found</div>';
      return;
    }

    const baseCurrency = products[0]?.price_range?.maximum_price?.final_price?.currency || 'USD';
    const formattedProducts = await Promise.all(
      products.map(async (p) => {
        const price = p.price_range?.maximum_price?.final_price?.value || 0;
        let convertedPrice;

        try {
          convertedPrice = await fetchLocalCurrency(baseCurrency, price);
        } catch (e) {
          console.error('Conversion failed:', e);
          convertedPrice = formatCurrency(price, baseCurrency); // fallback
        }

        return { ...p, displayPrice: convertedPrice };
      }),
    );

    // keep the same order as the stored SKU list
    const sortedProducts = arr
      .map((sku) => formattedProducts.find((p) => p.sku === sku))
      .filter(Boolean);

    // Render
    block.innerHTML = `
      <h2 class="title">${esc(title)}</h2>
      <div class="rvp-header">
        <span class="rvp-badge">Venia Commerce · GraphQL</span>
        <span class="rvp-count">🕘 ${sortedProducts.length} recently viewed</span>
      </div>
      <ul class="rvp-list">
        ${sortedProducts.map((p) => `
        <li class="rvp-card" data-sku="${esc(p.sku)}" tabindex="0">
          <a class="rvp-link">
            ${p.thumbnail?.url ? `
            <div class="rvp-thumb">
              <img loading="lazy" class="rvp-thumbnail" src="${esc(p.thumbnail.url)}"
                   alt="${esc(p.thumbnail.label || p.name)}"/>
            </div>` : ''}
            <div class="rvp-details">
              <h3 title="${esc(p.name)}">${esc(p.name)}</h3>
              <p class="rvp-sku">SKU: ${esc(p.sku)}</p>
              <p class="rvp-price">${esc(p.displayPrice)}</p>
            </div>
          </a>
        </li>
        `).join('')}
      </ul>
    `;

    block.querySelectorAll('.rvp-card').forEach((card) => {
      const go = () => {
        localStorage.setItem('selectedProduct', card.dataset.sku);
        window.location.href = pdpUrl;
      };
      card.addEventListener('click', go);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') go();
      });
    });
  } catch (error) {
    console.error('API Mesh Block Error:', error);
    block.innerHTML = '<div class="api-data-error">Failed to load data</div>';
  }
}

function getTitleFieldValue(block) {
  const firstP = block.querySelector('p');
  return firstP ? firstP.textContent.trim() : 'Recently Viewed Products';
}

function getPDPFieldValue(block) {
  const p = block.querySelector('a');
  return p ? p.textContent.trim() : '/product-detail';
}