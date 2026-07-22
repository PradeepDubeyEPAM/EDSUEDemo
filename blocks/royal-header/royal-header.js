/* eslint-disable */
import { loadCSS } from '../../scripts/aem.js';

const CLIENTLIB_CSS_PATH = '/etc.clientlibs/aem-cloud-poc/clientlibs/clientlib-react.css';
function ensureClientlibCss() {
  const selector = `link[rel="stylesheet"][href="${CLIENTLIB_CSS_PATH}"]`;
  if (document.querySelector(selector)) return;
  // fire-and-forget (do not await) to avoid blocking header rendering
  loadCSS(CLIENTLIB_CSS_PATH);
}

const LANGUAGE_OPTIONS = ['EN', 'FR', 'DE'];

function buildLangPath(targetLang) {
  const { pathname } = window.location;
  return pathname.replace(
    /((?:\/content\/[^/]+)?\/[a-z]{2}\/)[a-z]{2}(\/|$)/i,
    `$1${targetLang.toLowerCase()}$2`,
  );
}

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

    // Handle image load errors
    img.addEventListener('error', () => {
      console.error('Logo image failed to load:', primaryLogo.imagePath);
      logoSection.classList.add('logo-missing');
      const fallback = document.createElement('span');
      fallback.className = 'logo-fallback';
      fallback.textContent = 'RAM';
      a.innerHTML = '';
      a.appendChild(fallback);
    });

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

    // Handle image load errors for secondary logo
    img.addEventListener('error', () => {
      a.style.display = 'none';
    });

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

  const currentLang = (window.location.pathname.match(
    /(?:\/content\/[^/]+)?\/[a-z]{2}\/([a-z]{2})(?:\/|$)/i,
  )?.[1] || 'en').toUpperCase();
  const activeLabel = LANGUAGE_OPTIONS.includes(currentLang) ? currentLang : LANGUAGE_OPTIONS[0];

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'lang-selector-trigger';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', 'Select language');
  trigger.innerHTML = `
    <span class="lang-globe">🌐</span>
    <span class="lang-label">${activeLabel}</span>
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
    if (lang === activeLabel) {
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
  const nav = document.createElement('nav');
  nav.className = 'main-nav';
  nav.setAttribute('aria-label', 'Primary navigation');

  const ul = document.createElement('ul');

  if (menuItems && menuItems.length > 0) {
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
  }

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

  // Fallback if image fails to load
  img.addEventListener('error', () => {
    searchBtn.innerHTML = `
      <svg class="search-icon-img" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    `;
  });

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
  const langSelector = createLanguageSelector(false);
  if (langSelector) actions.appendChild(langSelector);

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

// Detect if page has hero background
const detectHeroBackground = (header) => {
  // Check if we're on homepage
  const isHomepage = document.body.classList.contains('ram-homepage-page') ||
    window.location.pathname === '/' ||
    window.location.pathname === '/index.html';

  const applyNoHeroMode = (enabled) => {
    header.classList.toggle('no-hero-background', enabled);
    document.body.classList.toggle('ram-no-hero-background', enabled);
  };

  const hasVisualBackground = (heroSection) => {
    if (!heroSection) return false;

    const heroBackground = heroSection.matches('.hero-background')
      ? heroSection
      : heroSection.querySelector('.hero-background');

    const mediaPresent = heroSection.querySelector('img[src], picture source[srcset], video[src]')
      || heroBackground?.querySelector('img[src], picture source[srcset], video[src]');

    if (mediaPresent) return true;

    return [heroSection, heroBackground]
      .filter(Boolean)
      .some((node) => window.getComputedStyle(node).backgroundImage !== 'none');
  };

  if (!isHomepage) {
    // Not homepage - always show dark text
    applyNoHeroMode(true);
    return;
  }

  // Check if there's a hero section
  const heroSection = document.querySelector('.ram-hero, .hero-banner, .hero-section, .hero, .banner');

  if (!heroSection || !hasVisualBackground(heroSection)) {
    // No visual hero background found - use dark text
    applyNoHeroMode(true);
  } else {
    // Has hero - start with light text, check on scroll
    applyNoHeroMode(false);

    // Monitor scroll to toggle colors
    const checkScroll = () => {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      if (heroBottom < 80) {
        // Past hero - use dark text
        applyNoHeroMode(true);
      } else {
        // Still on hero - use light text
        applyNoHeroMode(false);
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }
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

  // Detect and apply hero background logic
  detectHeroBackground(header);

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
          window.location.href = buildLangPath(option.textContent.trim());
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
    // Safe fallback: ensure CSS is requested even if head.html is not applied on this route
    ensureClientlibCss();

    const xfPath = '/content/experience-fragments/aem-cloud-poc/us/en/site/global/header/master';


    // Fetch model.json
    const resp = await fetch(`${xfPath}.model.json`);

    if (!resp.ok) {
      throw new Error(`Failed to fetch model.json: ${resp.status}`);
    }

    const data = await resp.json();
    console.log('Fetched header model.json:', data);

    // Extract props from the CORRECT path
    const props = data?.[':items']?.root?.[':items']?.header_copy_copy || {};
    console.log('Extracted header props:', props);

    const {
      logos = [],
      menuItems = [],
      loginButtonText,
      loginButtonUrl,
    } = props;

    console.log('Menu Items:', menuItems);
    console.log('Logos:', logos);

    // Create header element
    const header = document.createElement('header');
    header.className = 'ram-header';

    // CRITICAL: Add default visibility classes immediately
    // This ensures menu items are visible on load
    header.classList.add('no-hero-background');
    document.body.classList.add('ram-no-hero-background');

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
