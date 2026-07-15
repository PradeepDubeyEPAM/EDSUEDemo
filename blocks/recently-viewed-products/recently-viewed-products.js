import { fetchAPI } from '../../scripts/api.js';
import { fetchLocalCurrency } from '../../scripts/currency-conversion.js';

export default async function decorate(block) {

  let isLoggedIn = localStorage.getItem('userSession');
  const pdpUrl = getPDPFieldValue(block);
  const title = getTitleFieldValue(block);

  // Loading state
  block.innerHTML = '<h4 class="recently-viewed-products-loading">There are no recently viewed products...</h4>';

  if (isLoggedIn) {
      const stored = localStorage.getItem("recentlyViewedProducts");
      let arr = stored ? JSON.parse(stored) : [];
          if (arr && arr.length !== 0) {
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
          const variables = { arr };

          try {
            const response = await fetchAPI(query, variables);

            //  Validate response properly
            if (!response || !response.data) {
              throw new Error('Invalid API response');
            }

            const data = response.data;

            if (!data || data.length === 0) {
              block.innerHTML = `<div class="api-data-error">No data found</div>`;
              return;
            }

            const products = data.GraphQL_products?.items || [];

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

             const sortedProducts = arr
               .map(sku => formattedProducts.find(p => p.sku === sku))
               .filter(Boolean);

            //  Render
            block.innerHTML = `
              <h2 class="title">${title}</h2>
              <ul class="cards-list">
                ${sortedProducts.map(p => `
                <li class="card" data-sku="${p.sku}">
                <a class="card-link">
                <img loading="lazy" class="card-thumbnail" src="${p.thumbnail?.url}"
                      alt="${p.thumbnail?.label}"/>
                  <div class="card-details">
                    <h3>${p.name}</h3>
                    <p>SKU: ${p.sku}</p>
                    <p>Price: ${p.displayPrice}</p>
                  </div>
                </a>
                </li>
                `).join('')}
              </ul>
              </div>
            `;

          } catch (error) {
            console.error('API Mesh Block Error:', error);
            block.innerHTML = `<div class="api-data-error">Failed to load data</div>`;
          }
      }
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
  const firstP = block.querySelector('p');
  return firstP ? firstP.textContent.trim() : 'Recently Viewed Products';
}

function getPDPFieldValue(block) {
  const p = block.querySelector('a');
    return p ? p.textContent.trim() : '/product-detail';
}
