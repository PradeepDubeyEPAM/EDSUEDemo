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

// Extract productId from URL
function getProductId() {
  const urlParams = new URLSearchParams(window.location.search);
  const queryId = urlParams.get('productId');

  if (queryId && !isNaN(queryId)) {
    return queryId;
  }

  return '1'; // fallback
}

function getStarRating(rating) {
  const fullStar = "★";
  const emptyStar = "☆";

  const rounded = Math.round(rating);

  return fullStar.repeat(rounded) + emptyStar.repeat(5 - rounded);
}

function renderReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return `<p>No reviews available</p>`;
  }

  return reviews.map((review) => `
    <div class="review-card">
      <p class="review-header">
        <strong>${review.reviewerName}</strong>
        <span class="stars">
          ${getStarRating(review.rating)} (${review.rating}/5)
        </span>
      </p>
      <p class="review-comment">"${review.comment}"</p>
      <small>${new Date(review.date).toLocaleDateString()}</small>
    </div>
  `).join('');
}

export default async function decorate(block) {
  try {
    //Get productId from URL
    const productId = getProductId();

    //Load config
    const config = await getProductConfig();
    const productApi = config.data.find(
      item => item["API Key"] === "appBuilderUrl"
    )?.["API Url"];

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
          <h3>Product Description</h3>
          <p id="ai-desc" class="typing">data.description</p>
        </div>

        <div class="reviews">
          <h3>Customer Reviews</h3>
          ${renderReviews(data.reviews)}
        </div>
      </div>
    `;
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