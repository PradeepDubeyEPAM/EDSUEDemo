import { addAIDescriptions } from '../cards/ai-descriptions.js';

async function loadSingleOffer({ container, offerPath, titleKey, lang }) {
  const [placeholderJson, offerHtml] = await Promise.all([
    fetch(`${window.location.origin}/placeholders.json`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetch(`${window.location.origin}${offerPath}.plain.html?t=${Date.now()}`)
  .then((r) => (r.ok ? r.text() : null))
  .catch(() => null),
  ]);

  if (placeholderJson) {
    const rows = Array.isArray(placeholderJson?.data)
      ? placeholderJson.data
      : Array.isArray(placeholderJson) ? placeholderJson : [];
    const row = rows.find((d) => (d.key || d.Key) === titleKey);
    if (row && (row[lang] || row.en)) {
      const titleEl = document.createElement('h2');
      titleEl.classList.add('offers-title');
      titleEl.style.cssText = `
        font-family: var(--body-font-family, sans-serif);
        padding: 0 2rem 0.5rem;
        font-size: 1.5rem;
        color: #0D3B8C;
      `;
      titleEl.textContent = row[lang] || row.en;
      container.before(titleEl);
    }
  }

  if (offerHtml) {
    container.innerHTML = offerHtml;
    const cardsBlocks = container.querySelectorAll('.cards');
    if (cardsBlocks.length) {
      if (!document.querySelector('link[href*="cards.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/blocks/cards/cards.css';
        document.head.appendChild(link);
      }
      const { default: decorateCards } = await import('../cards/cards.js');
      await Promise.all([...cardsBlocks].map((card) => decorateCards(card)));
      await addAIDescriptions(container);
    }
  } else {
    container.innerHTML = '<p style="font-family:sans-serif;padding:1rem;">Offers coming soon.</p>';
  }
}

export async function loadOffersOnPage(attributes = {}) {
  const path = window.location.pathname;
  if (path.includes('/nav') || path.includes('/footer')) return;

  // ── REMOVED _offersLoaded flag entirely ──

  const urlLang = path.split('/')[2] || 'en';
  const lang = ['en', 'fr', 'de'].includes(urlLang) ? urlLang : 'en';

  const fragmentBlocks = [...document.querySelectorAll('[data-offer-base]')];

  for (const block of fragmentBlocks) {
    const base = block.getAttribute('data-offer-base');
    const folderType = base.split('/').pop();
    const attributeValue = attributes[folderType];
    if (!attributeValue) continue;

    const offerPath = `${base}/${attributeValue}`;
    const titleKey  = `offer-title-${attributeValue}`;

    block.style.display = '';
    block.innerHTML = '<p style="font-family:sans-serif;padding:1rem;">Loading offers…</p>';

    const prevEl = block.previousElementSibling;
    if (prevEl && prevEl.classList.contains('offers-title')) prevEl.remove();

    await loadSingleOffer({ container: block, offerPath, titleKey, lang });
  }
}

export function removeOffers() {
  document.querySelectorAll('.offers-title').forEach((t) => t.remove());
  document.querySelectorAll('[data-offer-base]').forEach((block) => {
    block.style.display = 'none';
    block.innerHTML = '';
  });
}