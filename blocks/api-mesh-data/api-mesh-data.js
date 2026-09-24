import { fetchAPI } from '../../scripts/api.js';
import { fetchLocalCurrency } from '../../scripts/currency-conversion.js';

const MAX_PETS = 5; // single row, no wrapping
const PETS_HEADING = 'Do you love pets?';

// Petstore data is public/user-editable, so escape before using in innerHTML
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

function petIcon(categoryName = '') {
  const c = categoryName.toLowerCase();
  if (c.includes('dog')) return '🐶';
  if (c.includes('cat')) return '🐱';
  if (c.includes('bird')) return '🐦';
  if (c.includes('fish')) return '🐟';
  return '🐾';
}

export default async function decorate(block) {
  // Get values from authored content
  const category = getFieldValue(block);
  const pdpUrl = getPDPFieldValue(block);
  const title = getTitleFieldValue(block);

  // Loading state
  block.innerHTML = '<div class="api-data-loading">Loading...</div>';

  // ONE query -> Venia Commerce (GraphQL_) + Petstore (REST_)
  const query = `
  query GetProducts($category: String!) {
    GraphQL_categories(
      filters: {
        name: { match: $category }
      }
    ) {
      items {
        name
        products(pageSize: 10, currentPage: 1) {
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
          }
        }
      }
    }
    REST_findPetsByStatus(status: available) {
      id
      name
      status
      category {
        name
      }
    }
  }
  `;

  const variables = { category };

  try {
    const response = await fetchAPI(query, variables);

    if (!response || !response.data) {
      throw new Error('Invalid API response');
    }

    // Each source is handled independently so one failing doesn't blank the block
    const products = response.data.GraphQL_categories?.items?.[0]?.products?.items || [];

    // Petstore: drop unnamed + duplicate names (the public petstore has many "Buddy"s), max 5
    const seen = new Set();
    const pets = (response.data.REST_findPetsByStatus || [])
      .filter((p) => {
        const key = (p.name || '').trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_PETS);

    if (products.length === 0 && pets.length === 0) {
      block.innerHTML = '<div class="api-data-error">No data found</div>';
      return;
    }

    // ---- Commerce prices ----
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

    const hasBoth = formattedProducts.length > 0 && pets.length > 0;

    // Banner that ties both sources to the single mesh call
    const bannerHTML = hasBoth
      ? `
      <div class="mesh-banner">
        <span class="mesh-chip mesh-chip-commerce">Venia Commerce <small>GraphQL</small></span>
        <span class="mesh-op">+</span>
        <span class="mesh-chip mesh-chip-petstore">Petstore <small>REST</small></span>
        <span class="mesh-op">→</span>
        <span class="mesh-chip mesh-chip-mesh">⚡ 1 API Mesh call</span>
      </div>`
      : '';

    const productsHTML = formattedProducts.length
      ? `
      <section class="mesh-section mesh-section-commerce">
        <div class="mesh-section-header">
          <span class="mesh-badge mesh-badge-commerce">Venia Commerce · GraphQL</span>
        </div>
        <div class="api-data-container">
          ${formattedProducts.map((p) => `
          <a class="card-link">
            <div class="card" data-sku="${esc(p.sku)}">
              <h3>${esc(p.name)}</h3>
              <p class="card-sku">SKU: ${esc(p.sku)}</p>
              <p class="card-price">${esc(p.displayPrice)}</p>
            </div>
          </a>
          `).join('')}
        </div>
      </section>`
      : '';

    const dividerHTML = hasBoth
      ? '<div class="mesh-divider"><span>Same request · different API</span></div>'
      : '';

    const petsHTML = pets.length
      ? `
      <section class="mesh-section mesh-section-petstore">
        <div class="mesh-section-header">
          <span class="mesh-badge mesh-badge-petstore">Petstore · REST</span>
          <h3 class="mesh-section-title">${esc(PETS_HEADING)}</h3>
        </div>
        <div class="api-data-container api-data-pets">
          ${pets.map((p) => `
          <div class="pet-card">
            <div class="pet-icon" aria-hidden="true">${petIcon(p.category?.name)}</div>
            <h3 title="${esc(p.name)}">${esc(p.name)}</h3>
            <p class="pet-category">${esc(p.category?.name || 'Uncategorised')}</p>
            <span class="pet-status pet-status-${esc((p.status || '').toLowerCase())}">${esc(p.status)}</span>
          </div>
          `).join('')}
        </div>
      </section>`
      : '';

    // Render
    block.innerHTML = `
      <h2>${esc(title)}</h2>
      ${bannerHTML}
      ${productsHTML}
      ${dividerHTML}
      ${petsHTML}
    `;

    localStorage.setItem('selectedCategory', category);
  } catch (error) {
    console.error('API Mesh Block Error:', error);
    block.innerHTML = '<div class="api-data-error">Failed to load data</div>';
  }

  // Only Commerce cards navigate to PDP (pet cards use .pet-card, not .card)
  block.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      const sku = card.dataset.sku;
      localStorage.setItem('selectedProduct', sku);
      window.location.href = pdpUrl;
    });
  });
}

// helper function
function getFieldValue(block) {
  const p = block.querySelector('p');
  return p ? p.textContent.trim() : 'Tops';
}

// helper function
function getPDPFieldValue(block) {
  const p = block.querySelector('a');
  return p ? p.textContent.trim() : '/product-detail';
}

// helper function
function getTitleFieldValue(block) {
  const allP = block.querySelectorAll('p');
  const lastP = allP[allP.length - 1];
  return lastP ? lastP.textContent.trim() : 'Top Products';
}