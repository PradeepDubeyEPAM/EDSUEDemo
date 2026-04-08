import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

// ── NAV KEYBOARD / FOCUS HELPERS ──────────────────────────

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
    .forEach((section) => {
      section.setAttribute('aria-expanded', expanded);
    });
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

// ── SESSION HELPERS ────────────────────────────────────────

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

// ── OFFERS ─────────────────────────────────────────────────

let _currentOffersCity = null;

function loadOffersOnPage(city) {
  const path = window.location.pathname;
  if (path.includes('/nav') || path.includes('/footer')) return;

  if (_currentOffersCity === city) return;
  _currentOffersCity = city;

  const langSegment = path.split('/')[2] || 'en';
  const offerPath = `/us/${langSegment}/offers/${city}`;

  // remove existing title if any
  const existingTitle = document.getElementById('offers-title');
  if (existingTitle) existingTitle.remove();

  let offersSection = document.getElementById('offers-section');
  if (!offersSection) {
    offersSection = document.createElement('div');
    offersSection.id = 'offers-section';
    offersSection.style.padding = '2rem';

    const main = document.querySelector('main');
    if (main) {
      const sections = main.querySelectorAll('.section');
      if (sections.length >= 2) {
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

   fetch(`${window.location.origin}/store-placeholders.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((json) => {
      if (!json) return;
      const row = json.data.find((d) => d.key === `offer-title-${city}`);
     const title = row
      ? (row[langSegment] || row['en'] || row.value || '')
      : '';
     if (title) {
     const titleEl = document.createElement('h2');
      titleEl.id = 'offers-title';
  titleEl.style.cssText = 'font-family:sans-serif;padding:0 2rem 1rem;';
  titleEl.textContent = title;
  offersSection.before(titleEl);
}
    })
    .catch(() => {});

  //  fetch actual offer page content

  fetch(`${window.location.origin}${offerPath}.plain.html`)
    .then((r) => (r.ok ? r.text() : null))
    .then((html) => {
      offersSection.innerHTML = html || '<p>Offers coming soon.</p>';
    })
    .catch(() => {
      offersSection.innerHTML = '<p>Offers coming soon.</p>';
    });
}

function removeOffers() {
  _currentOffersCity = null;
  const offersSection = document.getElementById('offers-section');
  if (offersSection) offersSection.remove();
  const offersTitle = document.getElementById('offers-title');
  if (offersTitle) offersTitle.remove();
}

// ── NAV UI ─────────────────────────────────────────────────

function showLoggedInUI(username) {
  const existing = document.getElementById('nav-user-wrapper');
  if (existing) existing.remove();

  const loginBtn = document.getElementById('nav-login-btn-trigger');
  const navTools = loginBtn
    ? loginBtn.parentElement
    : document.querySelector('.nav-tools');

  if (loginBtn) loginBtn.remove();

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
    border-radius:20px;padding:6px 14px;cursor:pointer;
    font-size:14px;
  `;
  logoutBtn.addEventListener('click', handleLogout);

  wrapper.appendChild(text);
  wrapper.appendChild(logoutBtn);
  if (navTools) navTools.appendChild(wrapper);
}

function showLoggedOutUI() {
  const wrapper = document.getElementById('nav-user-wrapper');
  if (wrapper) wrapper.remove();

  if (!document.getElementById('nav-login-btn-trigger')) {
    const navTools = document.querySelector('.nav-tools');
    if (navTools) navTools.appendChild(createLoginButton());
  }
}

function createLoginButton() {
  const btn = document.createElement('button');
  btn.id = 'nav-login-btn-trigger';
  btn.textContent = 'Login';
  btn.style.cssText = `
    background:#1473e6;color:white;
    border:none;border-radius:20px;
    padding:8px 20px;font-size:14px;
    cursor:pointer;margin-left:12px;
  `;
  btn.addEventListener('click', showLoginPopup);
  return btn;
}

// ── LOGOUT ─────────────────────────────────────────────────

function handleLogout() {
  clearSession();
  removeOffers();
  showLoggedOutUI();
}

// ── REACTIVE UI ────────────────────────────────────────────

let _refreshScheduled = false;
function refreshUIFromSession() {
  if (_refreshScheduled) return;
  _refreshScheduled = true;

  setTimeout(() => {
    _refreshScheduled = false;
    const session = getSession();
    if (session) {
      showLoggedInUI(session.username);
      loadOffersOnPage(session.city);
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

// DevTools fallback poller
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
    position:fixed;inset:0;
    background:rgba(0,0,0,0.5);
    display:flex;align-items:center;
    justify-content:center;z-index:9999;
  `;

  const popup = document.createElement('div');
  popup.style.cssText = `
    background:white;border-radius:12px;
    padding:2rem;width:360px;
  `;
  popup.innerHTML = `
    <h2 style="margin:0 0 1rem;font-size:1.25rem;font-family:sans-serif;">Welcome Back</h2>
    <input id="nl-username" type="text" placeholder="Enter username"
      style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;
      border-radius:8px;font-size:14px;box-sizing:border-box;"/>
    <input id="nl-password" type="password" placeholder="Enter password"
      style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;
      border-radius:8px;font-size:14px;box-sizing:border-box;"/>
    <p id="nl-error" style="color:red;font-size:13px;margin:0 0 8px;font-family:sans-serif;min-height:18px;"></p>
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
        localStorage.setItem(
          'userSession',
          JSON.stringify({ username: user.username, city: user.city }),
        );
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
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
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
  isDesktop.addEventListener('change', () =>
    toggleMenu(nav, navSections, isDesktop.matches),
  );

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) navTools.appendChild(createLoginButton());

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Restore session on page load
  const session = getSession();
  if (session) {
    showLoggedInUI(session.username);
    loadOffersOnPage(session.city);
  }
}
