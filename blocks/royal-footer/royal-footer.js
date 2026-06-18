/* eslint-disable */
import { loadCSS } from '../../scripts/aem.js';

// Utility functions
const getImageSrc = (imagePath) => imagePath || '';

// SVG Icons
const createSearchIcon = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '11');
  circle.setAttribute('cy', '11');
  circle.setAttribute('r', '6.5');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '2');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'm16 16 4.5 4.5');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');

  svg.appendChild(circle);
  svg.appendChild(path);
  return svg;
};

const createChevronIcon = () => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M3.2 5.5 8 10.3l4.8-4.8');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.8');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  svg.appendChild(path);
  return svg;
};

// Search form component
const createSearchForm = (searchBarText, idSuffix = 'desktop') => {
  const form = document.createElement('form');
  form.className = `ram-footer-search ram-footer-search-${idSuffix}`;
  form.setAttribute('role', 'search');

  const label = document.createElement('label');
  label.htmlFor = `footer-search-${idSuffix}`;
  label.className = 'ram-footer-search-label';
  label.textContent = searchBarText;

  const searchBox = document.createElement('div');
  searchBox.className = 'ram-search-box';

  const input = document.createElement('input');
  input.id = `footer-search-${idSuffix}`;
  input.type = 'search';
  input.placeholder = searchBarText;

  const button = document.createElement('button');
  button.type = 'submit';
  button.setAttribute('aria-label', 'Search');
  button.appendChild(createSearchIcon());

  searchBox.appendChild(input);
  searchBox.appendChild(button);
  form.appendChild(label);
  form.appendChild(searchBox);

  return form;
};

// Panel content (columns with links)
const createPanelContent = (columns) => {
  const panelGroups = document.createElement('div');
  panelGroups.className = 'ram-footer-panel-groups';

  columns.forEach((column) => {
    const section = document.createElement('section');
    section.className = 'ram-footer-panel-group';

    if (column.columnTitle) {
      const heading = document.createElement('h4');
      heading.className = 'ram-footer-panel-heading';
      heading.textContent = column.columnTitle;
      section.appendChild(heading);
    }

    if (column.links && column.links.length > 0) {
      const ul = document.createElement('ul');
      ul.className = 'ram-footer-link-list';

      column.links.forEach((link) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href || '#';
        a.textContent = link.label;
        li.appendChild(a);
        ul.appendChild(li);
      });

      section.appendChild(ul);
    }

    panelGroups.appendChild(section);
  });

  return panelGroups;
};

// Desktop navigation and panels
const createDesktopFooter = (dropdownItems, searchBarText) => {
  const topDiv = document.createElement('div');
  topDiv.className = 'ram-footer-top ram-footer-top-desktop';

  // Navigation tabs
  const nav = document.createElement('div');
  nav.className = 'ram-footer-nav';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Footer Navigation');

  dropdownItems.forEach((dropdown, index) => {
    const navItem = document.createElement('div');
    navItem.className = 'ram-footer-nav-item';
    navItem.dataset.index = index;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ram-footer-toggle ram-footer-toggle-desktop';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `footer-panel-desktop-${index}`);

    const span = document.createElement('span');
    span.textContent = dropdown.title;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'ram-footer-toggle-icon';
    iconSpan.appendChild(createChevronIcon());

    button.appendChild(span);
    button.appendChild(iconSpan);
    navItem.appendChild(button);
    nav.appendChild(navItem);
  });

  topDiv.appendChild(nav);

  // Search form
  if (searchBarText) {
    topDiv.appendChild(createSearchForm(searchBarText, 'desktop'));
  }

  // Panels container
  const panelsDiv = document.createElement('div');
  panelsDiv.className = 'ram-footer-panels ram-footer-panels-desktop';

  dropdownItems.forEach((dropdown, index) => {
    const panel = document.createElement('div');
    panel.id = `footer-panel-desktop-${index}`;
    panel.className = 'ram-footer-panel ram-footer-panel-desktop';
    panel.hidden = true;

    if (dropdown.columns && dropdown.columns.length > 0) {
      panel.appendChild(createPanelContent(dropdown.columns));
    }

    panelsDiv.appendChild(panel);
  });

  return { topDiv, panelsDiv };
};

// Mobile navigation
const createMobileFooter = (dropdownItems, searchBarText) => {
  const mobileDiv = document.createElement('div');
  mobileDiv.className = 'ram-footer-mobile';
  mobileDiv.setAttribute('aria-label', 'Footer mobile navigation');

  // Search form
  if (searchBarText) {
    mobileDiv.appendChild(createSearchForm(searchBarText, 'mobile'));
  }

  // Mobile nav
  const mobileNav = document.createElement('div');
  mobileNav.className = 'ram-footer-mobile-nav';

  dropdownItems.forEach((dropdown, index) => {
    const mobileItem = document.createElement('div');
    mobileItem.className = 'ram-footer-mobile-item';
    mobileItem.dataset.index = index;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ram-footer-toggle ram-footer-toggle-mobile';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `footer-panel-mobile-${index}`);

    const span = document.createElement('span');
    span.textContent = dropdown.title;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'ram-footer-toggle-icon';
    iconSpan.appendChild(createChevronIcon());

    button.appendChild(span);
    button.appendChild(iconSpan);

    const panel = document.createElement('div');
    panel.id = `footer-panel-mobile-${index}`;
    panel.className = 'ram-footer-panel ram-footer-panel-mobile';
    panel.hidden = true;

    if (dropdown.columns && dropdown.columns.length > 0) {
      panel.appendChild(createPanelContent(dropdown.columns));
    }

    mobileItem.appendChild(button);
    mobileItem.appendChild(panel);
    mobileNav.appendChild(mobileItem);
  });

  mobileDiv.appendChild(mobileNav);
  return mobileDiv;
};

// Middle section (payments + social)
const createMiddleSection = (paymentLabel, paymentImages, socialMediaLabel, socialMediaInfo) => {
  const middleDiv = document.createElement('div');
  middleDiv.className = 'ram-footer-middle';

  // Payments
  if (paymentImages && paymentImages.length > 0) {
    const paymentsDiv = document.createElement('div');
    paymentsDiv.className = 'ram-footer-payments';

    if (paymentLabel) {
      const p = document.createElement('p');
      p.textContent = paymentLabel;
      paymentsDiv.appendChild(p);
    }

    const iconsDiv = document.createElement('div');
    iconsDiv.className = 'ram-payment-icons';

    paymentImages.forEach((payment, index) => {
      const a = document.createElement('a');
      a.href = payment.link || '#';
      a.className = 'ram-payment-link';

      const img = document.createElement('img');
      img.src = getImageSrc(payment.imagePath);
      img.alt = `Payment ${index + 1}`;
      img.className = 'ram-payment-image';

      a.appendChild(img);
      iconsDiv.appendChild(a);
    });

    paymentsDiv.appendChild(iconsDiv);
    middleDiv.appendChild(paymentsDiv);
  }

  // Social media
  if (socialMediaInfo && socialMediaInfo.length > 0) {
    const socialDiv = document.createElement('div');
    socialDiv.className = 'ram-footer-social';

    if (socialMediaLabel) {
      const p = document.createElement('p');
      p.textContent = socialMediaLabel;
      socialDiv.appendChild(p);
    }

    const iconsDiv = document.createElement('div');
    iconsDiv.className = 'ram-social-icons';

    socialMediaInfo.forEach((social, index) => {
      const a = document.createElement('a');
      a.href = social.link || '#';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'ram-social-icon';

      const img = document.createElement('img');
      img.src = getImageSrc(social.imagePath);
      img.alt = `Social ${index + 1}`;

      a.appendChild(img);
      iconsDiv.appendChild(a);
    });

    socialDiv.appendChild(iconsDiv);
    middleDiv.appendChild(socialDiv);
  }

  return middleDiv;
};

// Bottom section (legal links + copyright)
const createBottomSection = (portletContent, copyrightInfo) => {
  const bottomDiv = document.createElement('div');
  bottomDiv.className = 'ram-footer-bottom';

  if (portletContent && portletContent.length > 0) {
    const legalDiv = document.createElement('div');
    legalDiv.className = 'ram-footer-legal';

    portletContent.forEach((portlet) => {
      const a = document.createElement('a');
      a.href = portlet.href || '#';
      a.textContent = portlet.label;
      legalDiv.appendChild(a);
    });

    bottomDiv.appendChild(legalDiv);
  }

  if (copyrightInfo) {
    const p = document.createElement('p');
    p.textContent = copyrightInfo;
    bottomDiv.appendChild(p);
  }

  return bottomDiv;
};

// Toggle functionality
const setupToggleInteraction = (footer) => {
  let expandedIndex = null;

  const handleToggle = (index, isDesktop) => {
    const prefix = isDesktop ? 'desktop' : 'mobile';
    const navItems = footer.querySelectorAll(`.ram-footer-${isDesktop ? 'nav-item' : 'mobile-item'}`);
    const panels = footer.querySelectorAll(`.ram-footer-panel-${prefix}`);
    const panelsContainer = footer.querySelector(`.ram-footer-panels-${prefix}`);

    // Close currently open panel if clicking same
    if (expandedIndex === index) {
      navItems[index]?.classList.remove('is-active');
      panels[index].hidden = true;

      const button = navItems[index]?.querySelector('button');
      if (button) button.setAttribute('aria-expanded', 'false');

      if (panelsContainer) panelsContainer.classList.remove('has-active-panel');

      expandedIndex = null;
    } else {
      // Close all panels
      navItems.forEach((item) => item.classList.remove('is-active'));
      panels.forEach((panel) => { panel.hidden = true; });
      footer.querySelectorAll('.ram-footer-toggle').forEach((btn) => {
        btn.setAttribute('aria-expanded', 'false');
      });

      // Open selected panel
      if (navItems[index]) {
        navItems[index].classList.add('is-active');
        panels[index].hidden = false;

        const button = navItems[index].querySelector('button');
        if (button) button.setAttribute('aria-expanded', 'true');

        if (panelsContainer) panelsContainer.classList.add('has-active-panel');
      }

      expandedIndex = index;
    }
  };

  // Desktop toggles
  footer.querySelectorAll('.ram-footer-toggle-desktop').forEach((button, index) => {
    button.addEventListener('click', () => handleToggle(index, true));
  });

  // Mobile toggles
  footer.querySelectorAll('.ram-footer-toggle-mobile').forEach((button, index) => {
    button.addEventListener('click', () => handleToggle(index, false));
  });
};

export default async function decorate(block) {
  try {
    const xfPath = '/content/experience-fragments/aem-cloud-poc/us/en/site/footer-xf/master';

    // Load AEM React clientlib CSS directly
    // AEM serves non-hashed path that automatically resolves to current hashed version
    const clientlibCSSPath = '/etc.clientlibs/aem-cloud-poc/clientlibs/clientlib-react.css';

    await loadCSS(clientlibCSSPath);
    console.log('AEM clientlib CSS loaded from:', clientlibCSSPath);


    // Fetch model.json
    const resp = await fetch(`${xfPath}.model.json`);

    if (!resp.ok) {
      throw new Error(`Failed to fetch model.json: ${resp.status}`);
    }

    const data = await resp.json();
    console.log('Fetched model.json:', data);

    // Extract props from nested structure: :items > root > :items > footer_cmp
    const props = data?.[':items']?.root?.[':items']?.footer_cmp || {};
    console.log('Extracted props:', props);

    const {
      dropdownItems = [],
      searchBarText,
      copyrightInfo,
      portletContent = [],
      socialMediaLabel,
      socialMediaInfo = [],
      paymentLabel,
      paymentImages = []
    } = props;

    // Create footer element
    const footer = document.createElement('footer');
    footer.className = 'ram-footer';

    // Build desktop footer
    const { topDiv, panelsDiv } = createDesktopFooter(dropdownItems, searchBarText);
    footer.appendChild(topDiv);
    footer.appendChild(panelsDiv);
    footer.appendChild(createMobileFooter(dropdownItems, searchBarText));
    footer.appendChild(createMiddleSection(paymentLabel, paymentImages, socialMediaLabel, socialMediaInfo));
    footer.appendChild(createBottomSection(portletContent, copyrightInfo));
    block.appendChild(footer);
    setupToggleInteraction(footer);

    console.log('Footer rendered successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading royal footer:', error);
    block.innerHTML = '<p>Error loading footer content</p>';
  }
}
