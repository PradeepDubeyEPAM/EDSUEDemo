import { fetchAPI } from '../../scripts/api.js';

export default async function decorate(block) {

  block.innerHTML = '<div>Loading product...</div>';

  let sku = localStorage.getItem('selectedProduct');

  if (!sku) {
    block.innerHTML = '<div>No product selected</div>';
    return;
  }

  const query = `
    query GetProduct($sku: String!) {
      products(filter: { sku: { eq: $sku } }) {
        items {
          name
          sku
          description {
            html
          }
          price_range {
            minimum_price {
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

    const product = response?.data?.products?.items?.[0];

    if (!product) {
      block.innerHTML = '<div>Product not found</div>';
      return;
    }

    const priceObj = product.price_range?.minimum_price?.final_price;

    block.innerHTML = `
      <div class="product-detail">
        <h1>${product.name}</h1>
        <p><strong>SKU:</strong> ${product.sku}</p>
        <p><strong>Price:</strong> ${priceObj?.value || ''} ${priceObj?.currency || ''}</p>
        <div class="description">
          ${product.description?.html || ''}
        </div>
      </div>
    `;

  } catch (error) {
    console.error(error);
    block.innerHTML = '<div>Failed to load product</div>';
  }
}