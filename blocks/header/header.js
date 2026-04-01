import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

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
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
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

// ── LOGIN HELPERS ──────────────────────────────────────────

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

function updateNavLoginStatus(username) {
  const loginBtn = document.getElementById('nav-login-btn-trigger');
  if (loginBtn) {
    loginBtn.textContent = `Logged in ${username} 👋`;
    loginBtn.style.cursor = 'default';
    loginBtn.style.background = '#2d9d78'; // green to show logged in
    loginBtn.style.pointerEvents = 'none';
  }
}

function loadOffersOnPage(country) {
  const langSegment = window.location.pathname.split('/')[2] || 'en';
  const offerPath = `/us/${langSegment}/offers/${country}`;

  // skip nav and footer pages
  const path = window.location.pathname;
  if (path.includes('/nav') || path.includes('/footer')) return;

  let offersSection = document.getElementById('offers-section');
  if (!offersSection) {
    offersSection = document.createElement('div');
    offersSection.id = 'offers-section';
    offersSection.style.padding = '2rem';

    const main = document.querySelector('main');
    if (main) {
      // inject after FIRST section (hero), BEFORE second section (text/image blocks)
      const sections = main.querySelectorAll('.section');
      if (sections.length >= 2) {
        // insert between section[0] (hero) and section[1] (text/image)
        main.insertBefore(offersSection, sections[1]);
      } else if (sections.length === 1) {
        sections[0].after(offersSection);
      } else {
        main.appendChild(offersSection);
      }
    }
  }

  offersSection.style.display = 'block';
  offersSection.innerHTML = '<p>Loading offers...</p>';

  fetch(`${window.location.origin}${offerPath}.plain.html`)
    .then((r) => (r.ok ? r.text() : null))
    .then((html) => {
      offersSection.innerHTML = html || '<p>Offers coming soon.</p>';
    })
    .catch(() => {
      offersSection.innerHTML = '<p>Offers coming soon.</p>';
    });
}

function showLoginPopup() {
  const existing = document.getElementById('nav-login-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'nav-login-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center;
    justify-content: center; z-index: 9999;
  `;

  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white; border-radius: 12px;
    padding: 2rem; width: 360px;
  `;

  popup.innerHTML = `
    <h2 style="margin:0 0 1rem;font-size:1.25rem;font-family:sans-serif;">Welcome Back</h2>
    <input id="nl-username" type="text" placeholder="Enter username"
      style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;
      border-radius:8px;font-size:14px;box-sizing:border-box;"/>
    <input id="nl-password" type="password" placeholder="Enter password"
      style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;
      border-radius:8px;font-size:14px;box-sizing:border-box;"/>
    <p id="nl-error" style="color:red;font-size:13px;margin:0 0 8px;font-family:sans-serif;"></p>
    <button id="nl-submit"
      style="width:100%;padding:12px;background:#1473e6;color:white;
      border:none;border-radius:8px;font-size:15px;cursor:pointer;font-family:sans-serif;">
      Login
    </button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  const submitBtn = document.getElementById('nl-submit');

  submitBtn.addEventListener('click', async () => {
    const username = document.getElementById('nl-username').value.trim();
    const password = document.getElementById('nl-password').value.trim();
    const error = document.getElementById('nl-error');
    error.textContent = '';

    if (!username || !password) {
      error.textContent = 'Please enter both fields.';
      return;
    }

    submitBtn.textContent = 'Logging in…';
    submitBtn.disabled = true;

    try {
      const BASE_URL = window.location.hostname.includes('aem.live')
        ? '' : 'https://main--edsuedemo--pradeepdubeyepam.aem.page';

      const resp = await fetch(`${BASE_URL}/blocks/login/data.json`);
      const data = await resp.json();
      const user = data.users.find(
        (u) => u.username === username && u.password === password,
      );

      if (user) {
        localStorage.setItem('userSession', JSON.stringify({
          username: user.username,
          country: user.country,
        }));
        overlay.remove();
        updateNavLoginStatus(user.username);
        loadOffersOnPage(user.country);
      } else {
        error.textContent = 'Invalid username or password.';
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
      }
    } catch {
      error.textContent = 'Something went wrong. Try again.';
      submitBtn.textContent = 'Login';
      submitBtn.disabled = false;
    }
  });

  [document.getElementById('nl-username'), document.getElementById('nl-password')].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitBtn.click();
    });
  });
}

// ── HANDLE BACK BUTTON — clear session so offers don't persist ──
// Use sessionStorage as a "this tab visited" flag.
// If user navigates back to a page fresh, we treat them as guest.
window.addEventListener('pageshow', (e) => {
  // e.persisted = true means page was restored from bfcache (back button)
  if (e.persisted) {
    clearSession();
    // Remove offers section if it exists
    const offersSection = document.getElementById('offers-section');
    if (offersSection) offersSection.remove();
    // Reset login button
    const loginBtn = document.getElementById('nav-login-btn-trigger');
    if (loginBtn) {
      loginBtn.textContent = 'Login';
      loginBtn.style.cursor = 'pointer';
      loginBtn.style.background = '#1473e6';
      loginBtn.style.pointerEvents = 'auto';
    }
  }
});

// ── MAIN DECORATE ──────────────────────────────────────────

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const locale = window.location.pathname.split('/').slice(0, 3).join('/');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${locale}/nav`;
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
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
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

  // ── ADD LOGIN BUTTON TO NAV TOOLS ──
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const loginBtn = document.createElement('button');
    loginBtn.id = 'nav-login-btn-trigger';
    loginBtn.textContent = 'Login';
    loginBtn.style.cssText = `
      background: #1473e6; color: white;
      border: none; border-radius: 20px;
      padding: 8px 20px; font-size: 14px;
      cursor: pointer; margin-left: 12px;
    `;
    loginBtn.addEventListener('click', showLoginPopup);
    navTools.appendChild(loginBtn);
  }
  // RESTORE SESSION ON PAGE LOAD ──
  
  const isBackNav = sessionStorage.getItem('wasLoggedIn') === 'true' && !getSession();
  const session = getSession();

  if (session && !isBackNav) {
    // Valid session exists — restore login state
    sessionStorage.setItem('wasLoggedIn', 'true');
    updateNavLoginStatus(session.username);
    loadOffersOnPage(session.country);
  } else if (!session) {
    // No session — clear the flag too
    sessionStorage.removeItem('wasLoggedIn');
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
