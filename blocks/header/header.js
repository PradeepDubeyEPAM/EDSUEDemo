import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

// Gemini proxy — key lives in Cloudflare, never in GitHub
const GEMINI_PROXY_URL = 'https://gemini-proxy.jayabhishikthapuredla.workers.dev';

// ── NAV HELPERS ────────────────────────────────────────────

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  sections
    .querySelectorAll('.nav-sections .default-content-wrapper > ul > li')
    .forEach((section) => section.setAttribute('aria-expanded', expanded));
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded =
    forceExpanded !== null
      ? !forceExpanded
      : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

// ── SESSION ────────────────────────────────────────────────

function getSession() {
  try {
    const d = localStorage.getItem('userSession');
    return d ? JSON.parse(d) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem('userSession');
}

// ── AI DESCRIPTIONS ────────────────────────────────────────

async function getAIDescription(title) {
  const cacheKey = `card-desc-${title}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(GEMINI_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Write a short 1-2 sentence promotional product description for "${title}". No quotes.`,
      }),
    });
    if (!response.ok) return '';
    const data = await response.json();
    const text = data?.text?.trim() || '';
    if (text) sessionStorage.setItem(cacheKey, text);
    return text;
  } catch {
    return '';
  }
}

async function addAIDescriptions(container) {
  await new Promise((resolve) => setTimeout(resolve, 0));

  const cards = container.querySelectorAll('.cards-card-body');
  if (!cards.length) return;

  await Promise.all(
    [...cards].map(async (body) => {
      // Use heading if present, otherwise fall back to first <p> (card title)
      const heading = body.querySelector('h1,h2,h3,h4,h5,h6,p');
      const img = body.closest('li')?.querySelector('picture img');
      const title = heading?.textContent?.trim() || img?.alt?.trim();
      if (!title) return;

      const p = document.createElement('p');
      p.className = 'cards-card-description loading';
      p.style.cssText = 'font-size:13px;color:#666;font-style:italic;margin-top:6px;';
      p.textContent = 'Loading description…';
      body.appendChild(p);

      const text = await getAIDescription(title);
      p.textContent = text || '';
      p.classList.remove('loading');
      p.style.fontStyle = 'normal';
    }),
  );
}

// ── OFFERS ─────────────────────────────────────────────────

async function loadSingleOffer({ container, offerPath, titleKey, lang }) {
  const [placeholderJson, offerHtml] = await Promise.all([
    fetch(`${window.location.origin}/placeholders.json`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetch(`${window.location.origin}${offerPath}.plain.html`)
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

let _offersLoaded = false;

async function loadOffersOnPage(attributes = {}) {
  const path = window.location.pathname;
  if (path.includes('/nav') || path.includes('/footer')) return;
  if (_offersLoaded) return;
  _offersLoaded = true;

  const urlLang = path.split('/')[2] || 'en';
  const lang = ['en', 'fr', 'de'].includes(urlLang) ? urlLang : 'en';

  const fragmentBlocks = [...document.querySelectorAll('[data-offer-base]')];

  for (const block of fragmentBlocks) {
    const base = block.getAttribute('data-offer-base');
    const folderType = base.split('/').pop();
    const attributeValue = attributes[folderType];
    if (!attributeValue) continue;

    const offerPath = `${base}/${attributeValue}`;
    const titleKey = `offer-title-${attributeValue}`;

    block.style.display = '';
    block.innerHTML = '<p style="font-family:sans-serif;padding:1rem;">Loading offers…</p>';

    const prevEl = block.previousElementSibling;
    if (prevEl && prevEl.classList.contains('offers-title')) prevEl.remove();

    // eslint-disable-next-line no-await-in-loop
    await loadSingleOffer({ container: block, offerPath, titleKey, lang });
  }
}

function removeOffers() {
  _offersLoaded = false;
  document.querySelectorAll('.offers-title').forEach((t) => t.remove());
  document.querySelectorAll('[data-offer-base]').forEach((block) => {
    block.style.display = 'none';
    block.innerHTML = '';
  });
}

// ── NAV UI ─────────────────────────────────────────────────

function showLoggedInUI(username) {
  const existing = document.getElementById('nav-user-wrapper');
  if (existing) existing.remove();

  const loginBtn = document.getElementById('nav-login-btn-trigger');
  const navTools = loginBtn ? loginBtn.parentElement : document.querySelector('.nav-tools');
  if (loginBtn) loginBtn.style.display = 'none';

  const wrapper = document.createElement('div');
  wrapper.id = 'nav-user-wrapper';
  wrapper.style.cssText = 'display:flex;align-items:center;gap:10px;margin-left:12px;';

  const text = document.createElement('span');
  text.style.cssText = 'font-size:14px;font-family:sans-serif;';
  text.textContent = `Logged in as ${username} `;

  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Logout';
  logoutBtn.style.cssText = `
    background:#e34850;color:white;border:none;
    border-radius:20px;padding:6px 14px;cursor:pointer;font-size:14px;
  `;
  logoutBtn.addEventListener('click', handleLogout);

  wrapper.appendChild(text);
  wrapper.appendChild(logoutBtn);
  if (navTools) navTools.appendChild(wrapper);
}

function showLoggedOutUI() {
  const wrapper = document.getElementById('nav-user-wrapper');
  if (wrapper) wrapper.remove();
  const loginBtn = document.getElementById('nav-login-btn-trigger');
  if (loginBtn) loginBtn.style.display = '';
}

function handleLogout() {
  clearSession();
  removeOffers();
  showLoggedOutUI();
}

// ── REACTIVE SESSION SYNC ──────────────────────────────────

let _refreshScheduled = false;
function refreshUIFromSession() {
  if (_refreshScheduled) return;
  _refreshScheduled = true;
  setTimeout(() => {
    _refreshScheduled = false;
    const session = getSession();
    if (session) {
      showLoggedInUI(session.username);
      loadOffersOnPage(session.attributes);
    } else {
      removeOffers();
      showLoggedOutUI();
    }
  }, 0);
}

let _lastKnownSession = localStorage.getItem('userSession');

window.addEventListener('storage', (e) => {
  if (e.key === 'userSession') refreshUIFromSession();
});

const _originalSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function setItem(key, value) {
  _originalSetItem(key, value);
  if (key === 'userSession') {
    _lastKnownSession = value;
    refreshUIFromSession();
  }
};

const _originalRemoveItem = localStorage.removeItem.bind(localStorage);
localStorage.removeItem = function removeItem(key) {
  _originalRemoveItem(key);
  if (key === 'userSession') {
    _lastKnownSession = null;
    refreshUIFromSession();
  }
};

setInterval(() => {
  const current = localStorage.getItem('userSession');
  if (current !== _lastKnownSession) {
    _lastKnownSession = current;
    refreshUIFromSession();
  }
}, 1000);

// ── LOGIN POPUP ────────────────────────────────────────────

function showLoginPopup() {
  const existing = document.getElementById('nav-login-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'nav-login-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.5);
    display:flex;align-items:center;justify-content:center;z-index:9999;
  `;

  const popup = document.createElement('div');
  popup.style.cssText = `
    background:white;border-radius:12px;padding:2rem;width:360px;
    box-shadow:0 4px 24px rgba(0,0,0,0.18);
  `;
  popup.innerHTML = `
    <h2 style="margin:0 0 1rem;font-size:1.25rem;font-family:sans-serif;">Welcome Back</h2>
    <input id="nl-username" type="text" placeholder="Enter username"
      style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;
      border-radius:8px;font-size:14px;box-sizing:border-box;"/>
    <input id="nl-password" type="password" placeholder="Enter password"
      style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;
      border-radius:8px;font-size:14px;box-sizing:border-box;"/>
    <p id="nl-error" style="color:red;font-size:13px;margin:0 0 8px;
      font-family:sans-serif;min-height:18px;"></p>
    <button id="nl-submit"
      style="width:100%;padding:12px;background:#1473e6;color:white;
      border:none;border-radius:8px;font-size:15px;cursor:pointer;font-family:sans-serif;">
      Login
    </button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const submitBtn = popup.querySelector('#nl-submit');

  const doLogin = async () => {
    const username = popup.querySelector('#nl-username').value.trim();
    const password = popup.querySelector('#nl-password').value.trim();
    const errorEl = popup.querySelector('#nl-error');
    errorEl.textContent = '';

    if (!username || !password) {
      errorEl.textContent = 'Please enter both fields.';
      return;
    }

    submitBtn.textContent = 'Logging in…';
    submitBtn.disabled = true;

    try {
      const BASE_URL = window.location.hostname.includes('aem.live')
        ? ''
        : 'https://main--edsuedemo--pradeepdubeyepam.aem.page';

      const resp = await fetch(`${BASE_URL}/blocks/login/data.json`);
      const data = await resp.json();
      const user = data.users.find(
        (u) => u.username === username && u.password === password,
      );

      if (user) {
        localStorage.setItem('userSession', JSON.stringify({
          username: user.username,
          attributes: user.attributes,
        }));
        overlay.remove();
      } else {
        errorEl.textContent = 'Invalid username or password.';
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
      }
    } catch {
      errorEl.textContent = 'Something went wrong. Try again.';
      submitBtn.textContent = 'Login';
      submitBtn.disabled = false;
    }
  };

  submitBtn.addEventListener('click', doLogin);
  popup.querySelectorAll('input').forEach((input) => {
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  });
}

// ── MAIN DECORATE ──────────────────────────────────────────

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const locale = window.location.pathname.split('/').slice(0, 3).join('/');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : `${locale}/nav`;
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections
      .querySelectorAll(':scope .default-content-wrapper > ul > li')
      .forEach((navSection) => {
        if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
        navSection.addEventListener('click', () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      });
  }

  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  const loginBtn = block.querySelector('#nav-login-btn-trigger');
  if (loginBtn) loginBtn.addEventListener('click', showLoginPopup);

  // Restore session on page load
  const session = getSession();
  if (session) {
    showLoggedInUI(session.username);
    let attempts = 0;
    const tryLoad = setInterval(() => {
      attempts++;
      const hasFragment = document.querySelector('[data-offer-base]');
      if (hasFragment || attempts > 20) {
        clearInterval(tryLoad);
        loadOffersOnPage(session.attributes);
      }
    }, 100);
  }
}