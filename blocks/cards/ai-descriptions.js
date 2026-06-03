const GEMINI_PROXY_URL = 'https://gemini-proxy.jayabhishikthapuredla.workers.dev';

async function getAIDescription(title, productId, defaultDescription) {
  const cacheKey = `card-desc-${productId}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const { text, timestamp } = JSON.parse(cached);
    const twelveHours = 12 * 60 * 60 * 1000;
    if (Date.now() - timestamp < twelveHours) return text;
    sessionStorage.removeItem(cacheKey); 
  }

  try {
    const response = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, productId, defaultDescription }),
    });

    if (!response.ok) return defaultDescription || '';

    const data = await response.json();
    console.log('[AI] Worker response:', data);

    const text = data?.text?.trim() || '';
    const source = data?.source || '';

    // Only cache verified descriptions with 12hr TTL
    if (text && source === 'cf-verified') {
      sessionStorage.setItem(cacheKey, JSON.stringify({ text, timestamp: Date.now() }));
    }

    return text || defaultDescription || '';
  } catch (err) {
    console.error('[AI] Worker call failed:', err);
    return defaultDescription || '';
  }
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

      const text = await getAIDescription(title, productId, '');
      if (text) {
        p.innerHTML = text;
        p.classList.remove('loading');
      } else {
        p.remove();
      }
    }),
  );
}