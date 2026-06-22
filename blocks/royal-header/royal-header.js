/* eslint-disable */
import { loadCSS } from '../../scripts/aem.js';

const LANGUAGE_OPTIONS = ['EN', 'FR', 'DE'];

// Utility: Chunk array into groups
const chunkArray = (array, chunkSize) => {
  if (!Array.isArray(array) || array.length === 0 || chunkSize <= 0) {
    return [];
  }
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Create Alert Bar
const createAlertBar = () => {
  const alertBar = document.createElement('div');
  alertBar.className = 'ram-alert-bar';
  alertBar.setAttribute('role', 'region');
  alertBar.setAttribute('aria-label', 'Travel alerts');
  alertBar.innerHTML = `
    <div class="ram-alert-inner">
      <span class="ram-alert-icon" aria-hidden="true">ⓘ</span>
      <p class="ram-alert-text">
        <span>Travel Restrictions</span>
        <span class="ram-alert-more">Read More</span>
      </p>
      <button class="ram-alert-next" aria-label="Next alert" type="button">›</button>
    </div>
  `;
  return alertBar;
};

// Create Logo Section from logos array
const createLogoSection = (logos) => {
  if (!logos || logos.length === 0) return null;

  const logoSection = document.createElement('div');
  logoSection.className = 'logo-section';

  const primaryLogo = logos[0];
  const secondaryLogo = logos[1];

  if (primaryLogo?.imagePath) {
    const a = document.createElement('a');
    a.href = primaryLogo.linkUrl || '/';

    const img = document.createElement('img');
    img.className = 'header__logo__img';
    img.src = primaryLogo.imagePath;
    img.alt = primaryLogo.altText || 'Header logo';

    img.addEventListener('error', () => {
      logoSection.classList.add('logo-missing');
    });

    if (img.complete && img.naturalWidth === 0) {
      logoSection.classList.add('logo-missing');
    }

    a.appendChild(img);
    logoSection.appendChild(a);
  }

  if (secondaryLogo?.imagePath) {
    const a = document.createElement('a');
    a.href = secondaryLogo.linkUrl || '/';
    a.className = 'header__oneworld';
    a.id = 'oneworld-logo-desktop';

    const img = document.createElement('img');
    img.className = 'header__oneworld__img';
    img.src = secondaryLogo.imagePath;
    img.alt = secondaryLogo.altText || 'Header logo';

    a.appendChild(img);
    logoSection.appendChild(a);
  }

  return logoSection;
};

// Create mega menu from links array with multi-column layout
const createMegaMenu = (links, menuTitle) => {
  if (!links || links.length === 0) return null;

  const megaMenu = document.createElement('div');
  megaMenu.className = 'mega-menu';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'mega-menu-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.textContent = '×';
  megaMenu.appendChild(closeBtn);

  // Create columns
  const columnSize = Math.max(1, Math.ceil(links.length / 3));
  const linkColumns = chunkArray(links, columnSize);

  const megaColumns = document.createElement('div');
  megaColumns.className = 'mega-columns';

  linkColumns.forEach((columnLinks, columnIndex) => {
    const column = document.createElement('div');
    column.className = 'menu-column';

    const h4 = document.createElement('h4');
    if (columnIndex > 0) {
      h4.className = 'menu-column-title-placeholder';
    }
    h4.textContent = menuTitle;
    column.appendChild(h4);

    columnLinks.forEach((link) => {
      const a = document.createElement('a');
      a.className = 'mega-menu-link';
      a.href = link.url || '#';
      a.textContent = link.title;
      column.appendChild(a);
    });

    megaColumns.appendChild(column);
  });

  megaMenu.appendChild(megaColumns);
  return megaMenu;
};

// Create Language Selector
const createLanguageSelector = (isMobile = false) => {
  const langSelector = document.createElement('div');
  langSelector.className = isMobile ? 'lang-selector lang-selector--mobile' : 'lang-selector';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'lang-selector-trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', 'Select language');
  trigger.innerHTML = `
    <span class="lang-globe">🌐</span>
    <span class="lang-label">${LANGUAGE_OPTIONS[0]}</span>
    <span class="lang-caret">▾</span>
  `;

  const menu = document.createElement('ul');
  menu.className = 'lang-menu';
  menu.setAttribute('role', 'listbox');
  menu.setAttribute('aria-label', 'Language options');
  menu.style.display = 'none';

  LANGUAGE_OPTIONS.forEach((lang) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-option';
    if (lang === LANGUAGE_OPTIONS[0]) {
      btn.classList.add('is-active');
    }
    btn.textContent = lang;
    li.appendChild(btn);
    menu.appendChild(li);
  });

  langSelector.appendChild(trigger);
  langSelector.appendChild(menu);

  return langSelector;
};

// Create Navigation from menuItems array
const createNavigation = (menuItems, loginButtonText, loginButtonUrl) => {
  if (!menuItems || menuItems.length === 0) return null;

  const nav = document.createElement('nav');
  nav.className = 'main-nav';
  nav.setAttribute('aria-label', 'Primary navigation');

  const ul = document.createElement('ul');

  menuItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.dataset.index = index;

    const hasLinks = item.links && item.links.length > 0;
    if (hasLinks) {
      li.className = 'has-dropdown';
    }

    const a = document.createElement('a');
    a.href = item.url || '#';
    a.textContent = item.title;
    li.appendChild(a);

    if (hasLinks) {
      const megaMenu = createMegaMenu(item.links, item.title);
      if (megaMenu) li.appendChild(megaMenu);
    }

    ul.appendChild(li);
  });

  nav.appendChild(ul);

  // Mobile nav footer
  const mobileFooter = document.createElement('div');
  mobileFooter.className = 'mobile-nav-footer';

  const mobileLangSelector = createLanguageSelector(true);
  mobileFooter.appendChild(mobileLangSelector);

  if (loginButtonText) {
    const loginBtn = document.createElement('a');
    loginBtn.href = loginButtonUrl || '#';
    loginBtn.className = 'login-join-btn login-join-btn--mobile';
    loginBtn.textContent = loginButtonText;
    mobileFooter.appendChild(loginBtn);
  }

  nav.appendChild(mobileFooter);

  return nav;
};

// Create Search Button
const createSearchButton = () => {
  const searchBtn = document.createElement('button');
  searchBtn.className = 'search-btn';
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.type = 'button';

  const img = document.createElement('img');
  img.src = '/icons/search.svg';
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  img.className = 'search-icon-img';

  searchBtn.appendChild(img);
  return searchBtn;
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

  // Search button
  actions.appendChild(createSearchButton());

  // Language selector (desktop)
  actions.appendChild(createLanguageSelector(false));

  // Login button
  const loginBtn = createLoginButton(loginButtonText, loginButtonUrl);
  if (loginBtn) actions.appendChild(loginBtn);

  return actions;
};

// Create Mobile Menu Toggle
const createMobileToggle = () => {
  const toggle = document.createElement('button');
  toggle.className = 'mobile-menu-toggle';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.textContent = '☰';
  return toggle;
};

// Setup all interactions
const setupInteractions = (block, header) => {
  const mobileToggle = header.querySelector('.mobile-menu-toggle');
  const nav = header.querySelector('.main-nav');
  const dropdownItems = header.querySelectorAll('.has-dropdown');
  let activeMenuIndex = null;
  let mobileMenuOpen = false;

  // Check if desktop
  const isDesktop = () => window.innerWidth > 992;

  // Update header classes
  const updateHeaderClasses = () => {
    if (mobileMenuOpen) {
      header.classList.add('menu-open-mobile');
    } else {
      header.classList.remove('menu-open-mobile');
    }

    if (isDesktop() && activeMenuIndex !== null) {
      header.classList.add('menu-open');
    } else {
      header.classList.remove('menu-open');
    }
  };

  // Mobile menu toggle
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenuOpen = !mobileMenuOpen;
      nav.classList.toggle('open');
      nav.classList.toggle('active', mobileMenuOpen);
      mobileToggle.textContent = mobileMenuOpen ? '✕' : '☰';
      mobileToggle.setAttribute('aria-label', mobileMenuOpen ? 'Close menu' : 'Open menu');
      updateHeaderClasses();
    });
  }

  // Dropdown interactions (desktop and mobile)
  dropdownItems.forEach((item, index) => {
    const link = item.querySelector(':scope > a');
    const megaMenu = item.querySelector('.mega-menu');
    const closeBtn = megaMenu?.querySelector('.mega-menu-close');

    if (link) {
      link.addEventListener('click', (e) => {
        const hasDropdown = item.classList.contains('has-dropdown');
        if (!hasDropdown) return;

        e.preventDefault();

        if (isDesktop()) {
          // Desktop: toggle dropdown
          if (activeMenuIndex === index) {
            activeMenuIndex = null;
            item.classList.remove('dropdown-open', 'nav-active');
          } else {
            // Close other dropdowns
            dropdownItems.forEach((other) => {
              other.classList.remove('dropdown-open', 'nav-active');
            });
            activeMenuIndex = index;
            item.classList.add('dropdown-open', 'nav-active');
          }
        } else {
          // Mobile: toggle dropdown
          if (activeMenuIndex === index) {
            activeMenuIndex = null;
            item.classList.remove('dropdown-open');
          } else {
            dropdownItems.forEach((other) => {
              other.classList.remove('dropdown-open');
            });
            activeMenuIndex = index;
            item.classList.add('dropdown-open');
          }
        }

        updateHeaderClasses();
      });
    }

    // Close button in mega menu
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        activeMenuIndex = null;
        item.classList.remove('dropdown-open', 'nav-active');
        updateHeaderClasses();
      });
    }
  });

  // Language selectors
  const langSelectors = header.querySelectorAll('.lang-selector');
  langSelectors.forEach((selector) => {
    const trigger = selector.querySelector('.lang-selector-trigger');
    const menu = selector.querySelector('.lang-menu');
    const options = selector.querySelectorAll('.lang-option');
    const label = selector.querySelector('.lang-label');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = selector.classList.contains('is-open');
        
        // Close other language selectors
        langSelectors.forEach((other) => {
          if (other !== selector) {
            other.classList.remove('is-open');
            const otherMenu = other.querySelector('.lang-menu');
            const otherTrigger = other.querySelector('.lang-selector-trigger');
            if (otherMenu) otherMenu.style.display = 'none';
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        selector.classList.toggle('is-open');
        menu.style.display = isOpen ? 'none' : 'block';
        trigger.setAttribute('aria-expanded', !isOpen);
      });

      options.forEach((option) => {
        option.addEventListener('click', () => {
          const selectedLang = option.textContent;
          
          // Update all language selectors
          langSelectors.forEach((sel) => {
            const lbl = sel.querySelector('.lang-label');
            const opts = sel.querySelectorAll('.lang-option');
            if (lbl) lbl.textContent = selectedLang;
            opts.forEach((opt) => {
              opt.classList.toggle('is-active', opt.textContent === selectedLang);
            });
            sel.classList.remove('is-open');
            const mnu = sel.querySelector('.lang-menu');
            const trg = sel.querySelector('.lang-selector-trigger');
            if (mnu) mnu.style.display = 'none';
            if (trg) trg.setAttribute('aria-expanded', 'false');
          });
        });
      });
    }
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      mobileMenuOpen = false;
      activeMenuIndex = null;
      if (nav) {
        nav.classList.remove('open', 'active');
      }
      if (mobileToggle) {
        mobileToggle.textContent = '☰';
        mobileToggle.setAttribute('aria-label', 'Open menu');
      }
      dropdownItems.forEach((item) => {
        item.classList.remove('dropdown-open', 'nav-active');
      });
      langSelectors.forEach((selector) => {
        selector.classList.remove('is-open');
        const menu = selector.querySelector('.lang-menu');
        const trigger = selector.querySelector('.lang-selector-trigger');
        if (menu) menu.style.display = 'none';
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
      updateHeaderClasses();
    }
  });

  // Handle resize
  window.addEventListener('resize', () => {
    const desktop = isDesktop();
    if (!desktop) {
      activeMenuIndex = null;
      dropdownItems.forEach((item) => {
        item.classList.remove('nav-active');
      });
    }
    updateHeaderClasses();
  });

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
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

    // Alert bar
    header.appendChild(createAlertBar());

    const mainHeader = document.createElement('div');
    mainHeader.className = 'main-header';

    // Logo section
    const logoSection = createLogoSection(logos);
    if (logoSection) mainHeader.appendChild(logoSection);

    // Navigation
    const nav = createNavigation(menuItems, loginButtonText, loginButtonUrl);
    if (nav) mainHeader.appendChild(nav);

    // Header actions (search, language, login)
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