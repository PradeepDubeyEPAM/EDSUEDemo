import { fetchAPI } from '../../scripts/api.js';

export default async function decorate(block) {

  // Loading state
  block.innerHTML = '<div class="api-data-loading">Loading...</div>';

  // Get dropdown value from authored content
  const category = getFieldValue(block, 'category', 'Tops');

  const query = `
  {
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
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetchAPI(query, {});

    //  Validate response properly
    if (!response || !response.data) {
      throw new Error('Invalid API response');
    }

    const categories = response.data.GraphQL_categories?.items;

    if (!categories || categories.length === 0) {
      block.innerHTML = `<div class="api-data-error">No data found</div>`;
      return;
    }

    const products = categories[0].products?.items || [];

    if (products.length === 0) {
      block.innerHTML = `<div class="api-data-error">No products found</div>`;
      return;
    }

    //  Render
    block.innerHTML = `
      <div class="api-data-container">
        ${products.map(p => `
          <div class="card">
            <h3>${p.name}</h3>
            <p>SKU: ${p.sku}</p>
          </div>
        `).join('')}
      </div>
    `;

  } catch (error) {
    console.error('API Mesh Block Error:', error);
    block.innerHTML = `<div class="api-data-error">Failed to load data</div>`;
  }
}

// helper function
function getFieldValue(block, fieldName, defaultValue = '') {
  const rows = [...block.children];

  for (const row of rows) {
    const cols = [...row.children];
    if (cols[0]?.textContent.trim().toLowerCase() === fieldName.toLowerCase()) {
      return cols[1]?.textContent.trim();
    }
  }

  return defaultValue;
}