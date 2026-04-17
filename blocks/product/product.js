// Cache config globally (avoid multiple fetch calls)
let productConfigCache;

async function getProductConfig() {
  if (productConfigCache) return productConfigCache;

  try {
    const res = await fetch('/productconfig.json');

    if (!res.ok) {
      throw new Error('Failed to load product-config.json');
    }

    productConfigCache = await res.json();
    return productConfigCache;
  } catch (e) {
    console.error('Config load error:', e);
    return {};
  }
}

// Extract productId from URL (supports both patterns)
function getProductId() {
  const path = window.location.pathname;

  const productId = path.match(/product\.(\d+)/);
  return productId ? productId[1] : 1;
}

export default async function decorate(block) {
  try {
    //Get productId from URL
    const productId = getProductId();

    //Load config
    const config = await getProductConfig();
    const productApi = config.data.find(item => item["API Key"] === "appBuilderUrl")?.["API Url"];

    if (!productApi) {
      throw new Error('appbuilder api missing in productconfig.json');
    }

    //Show loading state
    block.innerHTML = `<p>Loading product...</p>`;

    //Call API
    const response = await fetch(
      `${productApi}?productId=${productId}`
    );

    if (!response.ok) {
      throw new Error(`API failed with status ${response.status}`);
    }

    const data = await response.json();

    //Render UI
    block.innerHTML = `
      <div class="product-card">
        ${data.productimg ? `<img src="${data.productimg}" alt="${data.title}" class="product-image"/>` : ''}

        <h2>${data.title}</h2>
        <p><strong>Price:</strong> ₹${data.price}</p>
        <p><strong>Stock:</strong> ${data.stock}</p>
        <p><strong>Availability:</strong> ${data.availability || 'N/A'}</p>
        <p><strong>Shipping:</strong> ${data.shipping || 'N/A'}</p>

        <div class="ai-description">
          <h3>AI Description</h3>
          <p id="ai-desc" class="typing">Generating AI description<span class="cursor">|</span></p>
        </div>
      </div>
    `;

    //Typing effect for AI description
    const fullText = data.AIdescription || 'No description available';
    const descEl = block.querySelector('#ai-desc');

    let index = 0;

    function typeEffect() {
      if (index <= fullText.length) {
        descEl.innerHTML =
          fullText.substring(0, index) +
          `<span class="cursor">|</span>`;

        index++;

        const speed = Math.random() * 30 + 20;
        setTimeout(typeEffect, speed);
      } else {
        descEl.innerHTML = fullText;
      }
    }

    setTimeout(typeEffect, 400);

  } catch (error) {
    console.error('Product block error:', error);

    block.innerHTML = `
      <div class="error">
        <p>Failed to load product data</p>
      </div>
    `;
  }
}