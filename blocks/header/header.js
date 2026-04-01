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

//LOGIN + SESSION //

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

//UI UPDATE //

function updateNavLoginStatus(username) {
  const loginBtn = document.getElementById('nav-login-btn-trigger');
  if (!loginBtn) return;

  const navTools = loginBtn.parentElement;
  loginBtn.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'nav-user-wrapper';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '10px';

  const text = document.createElement('span');
  text.textContent = `Logged in as ${username} `;

  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Logout';
  logoutBtn.style.cssText = `
    background:#e34850;color:white;border:none;
    border-radius:20px;padding:6px 14px;cursor:pointer;
  `;

  logoutBtn.addEventListener('click', handleLogout);

  wrapper.appendChild(text);
  wrapper.appendChild(logoutBtn);
  navTools.appendChild(wrapper);
}

function handleLogout() {
  clearSession();
  refreshUIFromSession();
}

//OFFERS//

function loadOffersOnPage(country) {
  const langSegment = window.location.pathname.split('/')[2] || 'en';
  const offerPath = `/us/${langSegment}/offers/${country}`;

  let offersSection = document.getElementById('offers-section');

  if (!offersSection) {
    offersSection = document.createElement('div');
    offersSection.id = 'offers-section';

    const main = document.querySelector('main');
    const sections = main?.querySelectorAll('.section') || [];

    if (sections.length >= 2) {
      main.insertBefore(offersSection, sections[1]);
    } else {
      main.appendChild(offersSection);
    }
  }

  offersSection.innerHTML = 'Loading offers...';

  fetch(`${window.location.origin}${offerPath}.plain.html`)
    .then(r => r.ok ? r.text() : null)
    .then(html => {
      offersSection.innerHTML = html || 'No offers';
    })
    .catch(() => {
      offersSection.innerHTML = 'Error loading offers';
    });
}

//EACTIVE//

function refreshUIFromSession() {
  const session = getSession();

  const wrapper = document.getElementById('nav-user-wrapper');
  const loginBtn = document.getElementById('nav-login-btn-trigger');

  if (session) {
    if (!wrapper) updateNavLoginStatus(session.username);
    loadOffersOnPage(session.country);
  } else {
    const offers = document.getElementById('offers-section');
    if (offers) offers.remove();

    if (wrapper) wrapper.remove();

    if (!loginBtn) {
      const navTools = document.querySelector('.nav-tools');
      const btn = document.createElement('button');
      btn.id = 'nav-login-btn-trigger';
      btn.textContent = 'Login';
      btn.addEventListener('click', showLoginPopup);
      navTools.appendChild(btn);
    }
  }
}


window.addEventListener('storage', refreshUIFromSession);


const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, value) {
  originalSetItem.apply(this, arguments);
  if (key === 'userSession') refreshUIFromSession();
};

//Login//

function showLoginPopup() {
  const username = prompt('username');
  const password = prompt('password');

  fetch('/blocks/login/data.json')
    .then(r => r.json())
    .then(data => {
      const user = data.users.find(u => u.username === username && u.password === password);

      if (user) {
        localStorage.setItem('userSession', JSON.stringify(user));
      } else {
        alert('Invalid login');
      }
    });
}

//Main//

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const locale = window.location.pathname.split('/').slice(0, 3).join('/');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${locale}/nav`;
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const navTools = nav.querySelector('.nav-tools');

  const loginBtn = document.createElement('button');
  loginBtn.id = 'nav-login-btn-trigger';
  loginBtn.textContent = 'Login';
  loginBtn.addEventListener('click', showLoginPopup);

  navTools.appendChild(loginBtn);

  block.append(nav);

  
  refreshUIFromSession();
}