//Cache config globally
let productConfigCache;

async function getProductConfig() {
  if (productConfigCache) return productConfigCache;

  try {
    const res = await fetch('/productconfig.json');

    if (!res.ok) {
      throw new Error('Failed to load product config.json');
    }

    productConfigCache = await res.json();
    return productConfigCache;
  } catch (e) {
    console.error('Config load error:', e);
    return {};
  }
}

export default async function decorate(block) {
  try {
    block.innerHTML = `<p>Loading products...</p>`;

    //Load config
    const config = await getProductConfig();
    const productListApi = config.data.find(
  item => item["API Key"] === "productListApiUrl")?.["API Url"];
    const pdpBasePath = config.data.find(
  item => item["API Key"] === "pdpBasePath")?.["API Url"];

    if (!productListApi) {
      throw new Error('productListApiUrl missing in product-config.json');
    }

    //Fetch product list
    const response = await fetch(productListApi);

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const products = await response.json();

    //Render product grid
    block.innerHTML = `
      <div class="plp-grid">
        ${products.map(product => `
          <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" />
            <h3>${product.title}</h3>
            <p>₹${product.price}</p>
          </div>
        `).join('')}
      </div>
    `;

    //Redirect using path-based URL (BEST for EDS caching)
    block.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const productId = card.getAttribute('data-id');

        //Final URL: /pdp/123
        window.location.href = `${pdpBasePath}/${productId}`;
      });
    });

  } catch (error) {
    console.error(error);
    block.innerHTML = `<p>Failed to load products</p>`;
  }
}