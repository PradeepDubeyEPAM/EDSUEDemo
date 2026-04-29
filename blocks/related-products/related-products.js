import { fetchAPI } from '../../scripts/api.js';
import { fetchLocalCurrency } from '../../scripts/currency-conversion.js';

export default async function decorate(block) {

  const category = localStorage.getItem('selectedCategory');
  const pdpUrl = window.location.href;
  const title = getTitleFieldValue(block);

  // Loading state
  block.innerHTML = '<div class="related-products-loading">Loading...</div>';

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

         return {
           ...p,
           displayPrice: convertedPrice,
         };
       })
     );

    //  Render
    block.innerHTML = `
      <h2>${title}</h2>
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

function getTitleFieldValue(block) {
  const allP = block.querySelectorAll('p');
  const lastP = allP[allP.length - 1];
  return lastP ? lastP.textContent.trim() : 'Related Products';
}
