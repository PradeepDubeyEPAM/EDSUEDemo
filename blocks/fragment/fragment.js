/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

// eslint-disable-next-line import/no-cycle
import { decorateMain } from '../../scripts/scripts.js';
import { loadSections } from '../../scripts/aem.js';

export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    let finalPath = path.replace(/(\\.plain)?\\.html/, '');
    const isXF = finalPath.startsWith('/content/experience-fragments');

    const supported = ['en', 'fr', 'hi'];
    const userLang = navigator?.language?.toLowerCase?.() || 'en';
    const lang = userLang.slice(0, 2);
    const promoLang = supported.includes(lang) ? lang : 'default';

    const isMobile = window.matchMedia('(max-width: 899px)').matches;
    const device = isMobile ? 'mobile' : 'desktop';

    if (finalPath.endsWith('/banners') && !isXF) {
      finalPath += `/promo-${promoLang}/${device}`;
    }

    const resp = await fetch(`${finalPath}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(finalPath, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();

  // ── OFFER PLACEHOLDER DETECTION ──
  // If this fragment block points to an /offers/ path,
  // treat it as an offer config holder — NOT a rendered fragment.
  // Store the EDS path as data-offer-base so header.js can read it.
  // Hide the block completely for guests (Option B — nothing shown until login).
  const cleanPath = path.replace(/(\\.plain)?\\.html$/, '');
  const isOfferBlock = cleanPath.includes('/offers/');

  if (isOfferBlock) {
    // Strip AEM content prefix to get the EDS-readable path
    // e.g. /content/edsuedemo/us/en/offers/apparel/cities → /us/en/offers/apparel/cities
    const edsPath = cleanPath.replace(/^\/content\/[^/]+/, '');
    block.setAttribute('data-offer-base', edsPath);

    // Hide completely for guests — header.js reveals after login
    block.style.display = 'none';

    // Do NOT load fragment content — this block is config only
    return;
  }

  // ── NORMAL FRAGMENT BEHAVIOUR (non-offer fragments) ──
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.classList.add(...fragmentSection.classList);
      block.classList.remove('section');
      block.replaceChildren(...fragmentSection.childNodes);
    }
  }
}