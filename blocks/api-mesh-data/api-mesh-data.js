import { fetchAPI } from '../../scripts/api.js';

export default async function decorate(block) {

  const endpoint = block.dataset.endpoint;
  block.innerHTML = '<div class="api-data-loading">Loading...</div>';

  const query = '
                 {
                   GraphQL_categories(
                     filters: {
                       name: { match: "Tops" }
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
                 ';

  const data = await fetchAPI(query, endpoint);

  if (!query) {
      block.innerHTML = `<div class="api-data-error">Invalid configuration</div>`;
      return;
  }

  const products = data.GraphQL_categories.items || [];

  block.innerHTML = `
    <div class="api-data-container">
      ${products.map(p => `
        <div class="card">
          <h3>${p.name}</h3>
          <p>₹${p.sku}</p>
        </div>
      `).join('')}
    </div>
  `;
}