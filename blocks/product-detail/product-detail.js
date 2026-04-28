import { fetchAPI } from '../../scripts/api.js';
import { fetchLocalCurrency } from '../../scripts/currency-conversion.js';

export default async function decorate(block) {

  block.innerHTML = '<div>Loading product...</div>';

  let sku = localStorage.getItem('selectedProduct');

  if (!sku) {
    block.innerHTML = '<div>No product selected</div>';
    return;
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
        }
      }
    }
  `;

  try {
    const response = await fetchAPI(query, { sku });

    const product = response?.data?.GraphQL_products?.items?.[0];

    if (!product) {
      block.innerHTML = '<div>Product not found</div>';
      return;
    }

    const priceObj = product.price_range?.maximum_price?.final_price;

    try {
      const price  = await fetchLocalCurrency(priceObj?.currency, priceObj?.value);
      //  Validate response properly
          if (!price) {
            throw new Error('Invalid API response');
          }
          block.innerHTML = `
                <div class="product-detail">
                  <h2>${product.name}</h1>
                  <p><strong>SKU:</strong> ${product.sku}</p>
                  <p><strong>Price:</strong> ${price}</p>
                  <div class="description">
                   <strong>Description:</strong> ${product.description?.html || ''}
                  </div>
                </div>
              `;
    }
    catch (error) {
        console.error('API Mesh Block Error:', error);
        block.innerHTML = `<div class="api-data-error">Failed to load data</div>`;
      }

  } catch (error) {
    console.error(error);
    block.innerHTML = '<div>Failed to load product</div>';
  }
}