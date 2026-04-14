export default async function decorate(block) {
  try {
    block.innerHTML = `<p>Loading products...</p>`;

    //Fetch product list
    const response = await fetch(
      'https://sandbox.mockerito.com/ecommerce/api/products'
    );

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

    //Add click event for navigation
    block.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const productId = card.getAttribute('data-id');

        //Redirect to PDP page
        window.location.href = `/product?productId=${productId}`;
      });
    });

  } catch (error) {
    console.error(error);
    block.innerHTML = `<p>Failed to load products</p>`;
  }
}