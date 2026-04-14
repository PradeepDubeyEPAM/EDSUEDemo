export default async function decorate(block) {
  try {
    // ✅ Step 1: Read authored values from AEM
    const productIdEl = block.querySelector('[data-aue-prop="productId"]');
    const productId = productIdEl?.textContent?.trim() || '1';

    // Image from AEM (if authored)
    const imageEl = block.querySelector('img');
    const productImage = imageEl?.src || '';

    // ✅ Step 2: Show loading state
    block.innerHTML = `<p>Loading product...</p>`;

    // ✅ Step 3: Call your App Builder API
    const response = await fetch(
      `https://26272-pricinginventory-stage.adobeio-static.net/api/v1/web/pricing-inventory-app/get-product-pricing?productId=${productId}`
    );

    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }

    const result = await response.json();
    const data = result.body || result; // depending on response structure

    // ✅ Step 4: Render UI
    block.innerHTML = `
      <div class="product-card">
        ${productImage ? `<img src="${productImage}" alt="${data.title}" class="product-image"/>` : ''}

        <h2>${data.title}</h2>
        <p><strong>Price:</strong> ₹${data.price}</p>
        <p><strong>Stock:</strong> ${data.stock}</p>
        <p><strong>Availability:</strong> ${data.availability || 'N/A'}</p>
        <p><strong>Shipping:</strong> ${data.shipping || 'N/A'}</p>

        <div class="ai-description">
          <h3>AI Description</h3>
          <p>${data.AIdescription || 'No description available'}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Product block error:', error);

    block.innerHTML = `
      <div class="error">
        <p>⚠️ Failed to load product data</p>
      </div>
    `;
  }
}