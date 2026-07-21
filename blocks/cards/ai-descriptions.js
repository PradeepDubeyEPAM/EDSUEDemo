

export async function fetchCFFromPublish(productId) {
const isAuthor = window.location.hostname.includes('author-');

const url = isAuthor
  ? `https://${window.location.hostname}/adobe/sites/cf/fragments?path=/content/dam/edsuedemo/descriptions/${productId}`
  : `https://publish-p24103-e71623.adobeaemcloud.com/api/assets/edsuedemo/descriptions/${productId}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();

   if (isAuthor) {
      const fields = {};
      data.items?.[0]?.fields?.forEach(f => { fields[f.name] = f.values?.[0]; });
      return {
        aiDescription:      fields.aiDescription?.trim() || '',
        verified:           fields.verified === true,
        productId:          fields.productId?.trim() || '',
        defaultDescription: fields.defaultDescription?.trim() || '',
        image: fields.image?.trim() || ''
      };
    }

    const elements = data?.properties?.elements;
    if (!elements) return null;
    return {
      aiDescription:      elements.aiDescription?.value?.trim() || '',
      verified:           elements.verified?.value === true,
      productId:          elements.productId?.value?.trim() || '',
      defaultDescription: elements.defaultDescription?.value?.trim() || '',
      pdpDescription: elements.pdpDescription?.value?.trim() || '', 
      image: elements.image?.value?.trim() || ''
    }

  } catch (err) {
    console.error('[AI] Fetch failed:', err);
    return null;
  }
}
async function getAIDescription(productId) {
  const cacheKey = `card-desc-${productId}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const { text, timestamp } = JSON.parse(cached);
    const twelveHours = 12 * 60 * 60 * 1000;
    if (Date.now() - timestamp < twelveHours) return text;
    sessionStorage.removeItem(cacheKey);
  }

  const cf = await fetchCFFromPublish(productId);
  if (!cf) return '';

  // Only surface aiDescription if verified by author
  const text = cf.verified && cf.aiDescription 
    ? cf.aiDescription 
    : cf.defaultDescription || '';

  // Only cache verified AI descriptions (12hr TTL)
  // Unverified: never cache so author approvals reflect immediately
  if (cf.verified && cf.aiDescription) {
    sessionStorage.setItem(cacheKey, JSON.stringify({ 
      text, 
      timestamp: Date.now() 
    }));
  }

  return text;
}

export async function addAIDescriptions(container) {
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

  const cards = container.querySelectorAll('.cards-card-body');
  if (!cards.length) {
    console.warn('[AI] No cards found in container');
    return;
  }

  await Promise.all(
    [...cards].map(async (body) => {
      const title = body.textContent?.trim();
      if (!title) return;

      const li = body.closest('li');
      const productId = li?.dataset?.productId?.trim();

      if (!productId) {
        console.warn('[AI] Missing productId for card:', title);
        return;
      }

      const p = document.createElement('p');
      p.className = 'cards-card-description loading';
      p.textContent = 'Loading description…';
      body.appendChild(p);

      const text = await getAIDescription(productId);
      if (text) {
        p.innerHTML = text;
        p.classList.remove('loading');
      } else {
        p.remove();
      }
    }),
  );
}