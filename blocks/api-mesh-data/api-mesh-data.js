import { fetchAPI } from '../../scripts/api.js';

export default async function decorate(block) {

  // Get dropdown value from authored content
  const category = getFieldValue(block);
  const pdpUrl = getFieldValue(block);

  // Loading state
  block.innerHTML = '<div class="api-data-loading">Loading...</div>';

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
  }
  `;

  const variables = { category };

  try {
    const response = await fetchAPI(query, variables);

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

    const userCurrency = await getUserCurrency();

    const baseCurrency = products[0]?.price_range?.maximum_price?.final_price?.currency || 'USD';

    const rate = await getExchangeRate(baseCurrency, userCurrency);

    const formattedProducts = products.map(p => {
      const price = p.price_range?.maximum_price?.final_price?.value || 0;

      const convertedPrice = price * rate;

      return {
        ...p,
        displayPrice: formatCurrency(convertedPrice, userCurrency)
      };
    });

    //  Render
    block.innerHTML = `
      <div class="api-data-container">
        ${formattedProducts.map(p => `
        <a class="card-link">
          <div class="card" data-sku="${p.sku}">
            <h3>${p.name}</h3>
            <p>SKU: ${p.sku}</p>
            <p>Price: ${p.displayPrice}</p>
          </div>
        </a>
        `).join('')}
      </div>
    `;

  } catch (error) {
    console.error('API Mesh Block Error:', error);
    block.innerHTML = `<div class="api-data-error">Failed to load data</div>`;
  }

  block.querySelectorAll('.card').forEach(card => {
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

async function getUserCurrency() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return data.currency; // INR, USD, etc
  } catch {
    return 'USD';
  }
}

async function getExchangeRate(from, to) {
  if (from === to) return 1;

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();

    if (!data || !data.rates || !data.rates[to]) {
      console.error('Invalid exchange API response:', data);
      return 1;
    }

    return data.rates[to];

  } catch (error) {
    console.error('Exchange rate fetch failed:', error);
    return 1;
  }
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency
  }).format(amount);
}