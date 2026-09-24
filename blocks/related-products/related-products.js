import { fetchAPI } from '../../scripts/api.js';
import { fetchLocalCurrency } from '../../scripts/currency-conversion.js';

const MAX_RELATED = 4;

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

function renderMessage(block, title, message, icon = '🔍') {
  block.innerHTML = `
    <h2 class="title">${esc(title)}</h2>
    <div class="rp-empty">
      <span class="rp-empty-icon" aria-hidden="true">${icon}</span>
      <h4>${esc(message)}</h4>
    </div>
  `;
}

export default async function decorate(block) {
  const category = localStorage.getItem('selectedCategory');
  const pdpUrl = window.location.href;
  const title = getTitleFieldValue(block);
  const excludeSku = localStorage.getItem('selectedProduct');

  // No category stored (e.g. page opened directly) -> the query needs a category
  if (!category) {
    renderMessage(block, title, 'No related products to show');
    return;
  }

  // Loading state
  block.innerHTML = `
    <h2 class="title">${esc(title)}</h2>
    <div class="rp-loading">Loading...</div>
  `;

  const query = `
  query GetProducts($category: String!) {
    GraphQL_categories(
      filters: {
        name: { match: $category }
      }
    ) {
      items {
        name
        products(
          pageSize: 5,
          currentPage: 1
        ) {
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
    }
  }
  `;

  try {
    const response = await fetchAPI(query, { category });

    if (!response || !response.data) {
      throw new Error('Invalid API response');
    }

    const products = response.data.GraphQL_categories?.items?.[0]?.products?.items || [];

    if (products.length === 0) {
      renderMessage(block, title, 'No related products found');
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

    const related = formattedProducts
      .filter((p) => p.sku !== excludeSku)
      .slice(0, MAX_RELATED);

    if (related.length === 0) {
      renderMessage(block, title, 'No related products found');
      return;
    }

    // Render
    block.innerHTML = `
      <h2 class="title">${esc(title)}</h2>
      <div class="rp-header">
        <span class="rp-badge">Venia Commerce · GraphQL</span>
        <span class="rp-count">🏷️ More from ${esc(category)}</span>
      </div>
      <ul class="rp-list">
        ${related.map((p) => `
        <li class="rp-card" data-sku="${esc(p.sku)}" tabindex="0">
          <a class="rp-link">
            ${p.thumbnail?.url ? `
            <div class="rp-thumb">
              <img loading="lazy" class="rp-thumbnail" src="${esc(p.thumbnail.url)}"
                   alt="${esc(p.thumbnail.label || p.name)}"/>
            </div>` : ''}
            <div class="rp-details">
              <h3 title="${esc(p.name)}">${esc(p.name)}</h3>
              <p class="rp-sku">SKU: ${esc(p.sku)}</p>
              <p class="rp-price">${esc(p.displayPrice)}</p>
            </div>
          </a>
        </li>
        `).join('')}
      </ul>
    `;

    block.querySelectorAll('.rp-card').forEach((card) => {
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
  const allP = block.querySelectorAll('p');
  const lastP = allP[allP.length - 1];
  return lastP ? lastP.textContent.trim() : 'Related Products';
}