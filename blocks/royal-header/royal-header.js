/* eslint-disable */
import { loadCSS } from '../../scripts/aem.js';

// Create Logo Section from logos array
const createLogoSection = (logos) => {
  if (!logos || logos.length === 0) return null;

  const logoSection = document.createElement('div');
  logoSection.className = 'logo-section';

  logos.forEach((logo) => {
    const a = document.createElement('a');
    a.href = logo.linkUrl || '#';

    const img = document.createElement('img');
    img.className = 'header__logo__img';
    img.src = logo.imagePath || '';
    img.alt = logo.altText || '';

    img.addEventListener('error', () => {
      logoSection.classList.add('logo-missing');
    });

    if (img.complete && img.naturalWidth === 0) {
      logoSection.classList.add('logo-missing');
    }

    a.appendChild(img);
    logoSection.appendChild(a);
  });

  return logoSection;
};

// Create mega menu from links array
const createMegaMenu = (links) => {
  if (!links || links.length === 0) return null;

  const megaMenu = document.createElement('div');
  megaMenu.className = 'mega-menu';

  const column = document.createElement('div');
  column.className = 'menu-column';

  links.forEach((link) => {
    const a = document.createElement('a');
    a.href = link.url || '#';
    a.textContent = link.title;
    column.appendChild(a);
  });

  megaMenu.appendChild(column);
  return megaMenu;
};

// Create Navigation from menuItems array
const createNavigation = (menuItems) => {
  if (!menuItems || menuItems.length === 0) return null;

  const nav = document.createElement('nav');
  nav.className = 'main-nav';

  const ul = document.createElement('ul');

  menuItems.forEach((item) => {
    const li = document.createElement('li');

    const hasLinks = item.links && item.links.length > 0;
    if (hasLinks) {
      li.className = 'has-dropdown';
    }

    const a = document.createElement('a');
    a.href = item.url || '#';
    a.textContent = item.title;
    li.appendChild(a);

    if (hasLinks) {
      const megaMenu = createMegaMenu(item.links);
      if (megaMenu) li.appendChild(megaMenu);
    }

    ul.appendChild(li);
  });

  nav.appendChild(ul);
  return nav;
};

// Create Login Button
const createLoginButton = (loginButtonText, loginButtonUrl) => {
  if (!loginButtonText) return null;

  const loginBtn = document.createElement('a');
  loginBtn.href = loginButtonUrl || '#';
  loginBtn.className = 'login-join-btn';
  loginBtn.textContent = loginButtonText;
  return loginBtn;
};

// Create Header Actions
const createHeaderActions = (loginButtonText, loginButtonUrl) => {
  const actions = document.createElement('div');
  actions.className = 'header-actions';

  const loginBtn = createLoginButton(loginButtonText, loginButtonUrl);
  if (loginBtn) actions.appendChild(loginBtn);

  return actions;
};

// Create Mobile Menu Toggle
const createMobileToggle = () => {
  const toggle = document.createElement('button');
  toggle.className = 'mobile-menu-toggle';
  toggle.setAttribute('aria-label', 'Menu');
  toggle.textContent = '☰';
  return toggle;
};

// Setup all interactions
const setupInteractions = (block, header) => {
  const mobileToggle = header.querySelector('.mobile-menu-toggle');
  const nav = header.querySelector('.main-nav');
  const dropdownItems = header.querySelectorAll('.has-dropdown');

  // Mobile menu toggle
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('open');
    });
  }

  // Mobile dropdowns
  dropdownItems.forEach((item) => {
    const link = item.querySelector(':scope > a');
    if (link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          dropdownItems.forEach((other) => {
            if (other !== item) other.classList.remove('dropdown-open');
          });
          item.classList.toggle('dropdown-open');
        }
      });
    }
  });

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!block.contains(e.target)) {
      if (nav) nav.classList.remove('open');
      dropdownItems.forEach((item) => item.classList.remove('dropdown-open'));
    }
  });
};

export default async function decorate(block) {
  try {
    const xfPath = '/content/experience-fragments/aem-cloud-poc/us/en/site/global/header/master';

    // Load AEM React clientlib CSS
    const clientlibCSSPath = '/etc.clientlibs/aem-cloud-poc/clientlibs/clientlib-react.css';
    await loadCSS(clientlibCSSPath);

    // Fetch model.json
    const resp = await fetch(`${xfPath}.model.json`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch model.json: ${resp.status}`);
    }

    const data = await resp.json();
    console.log('Fetched header model.json:', data);

    // Extract props: :items > root > :items > header_copy_copy
    const props = data?.[':items']?.root?.[':items']?.header_copy_copy || {};
    console.log('Extracted header props:', props);

    const {
      logos = [],
      menuItems = [],
      loginButtonText,
      loginButtonUrl,
    } = props;

    // Create header element
    const header = document.createElement('header');
    header.className = 'ram-header';

    const mainHeader = document.createElement('div');
    mainHeader.className = 'main-header';

    // Logo section
    const logoSection = createLogoSection(logos);
    if (logoSection) mainHeader.appendChild(logoSection);

    // Navigation
    const nav = createNavigation(menuItems);
    if (nav) mainHeader.appendChild(nav);

    // Header actions (login button)
    const actions = createHeaderActions(loginButtonText, loginButtonUrl);
    mainHeader.appendChild(actions);

    // Mobile toggle
    mainHeader.appendChild(createMobileToggle());

    header.appendChild(mainHeader);
    block.appendChild(header);

    setupInteractions(block, header);

    console.log('Header rendered successfully');
  } catch (error) {
    console.error('Error loading royal header:', error);
    block.innerHTML = '<p>Error loading header content</p>';
  }
}