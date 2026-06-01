export default function decorate(block) {
  const footerLinks = [
    {
      title: 'About us',
      links: [
        'Our Fleet',
        'Our Network',
        'Our Partners',
        'Dreamliner',
        'Mobile App',
        'Royal Air Marco Cargo',
        'International United for Wildlife Taskforce',
      ],
    },

    {
      title: 'Destinations',
      sections: [
        {
          title: 'To Europe',
          links: [
            'Flights to Istanbul',
            'Flights to Bruxelles',
            'Flights to Barcelona',
            'Flights to Madrid',
            'Flights to London',
            'Flights to Geneva',
            'Flights to Amsterdam',
            'Flights to Milan',
            'Flights to Bologna',
            'Flights to Malaga',
            'Flights to Frankfurt',
            'Flights to Roma',
            'Flights to Lisboa',
          ],
        },
        {
          title: 'To Morocco',
          links: [
            'Flights to Agadir',
            'Flights to Casablanca',
            'Flights to Dakhla',
            'Flights to Ouarzazate',
            'Flights to Rabat',
            'Flights to Tetouan',
            'Flights to Tangier',
            'Flights to Oujda',
            'Flights to Fes',
            'Flights to Laayoune',
            'Flights to Nador',
          ],
        },
        {
          title: 'To France',
          links: [
            'Flights to Paris',
            'Flights to Marseille',
            'Flights to Lyon',
            'Flights to Nice',
            'Flights to Toulouse',
            'Flights to Bordeaux',
            'Flights to Nantes',
          ],
        },
        {
          title: 'To Africa',
          links: [
            'Flights to Dakar',
            'Flights to Abidjan',
            'Flights to Bamako',
            'Flights to Conakry',
            'Flights to Paria',
            'Flights to Banjul',
            'Flights to Bangui',
            'Flights to Brazzaville',
            'Flights to Ouagadougou',
            'Flights to Lome',
            'Flights to Nouakchot',
            'Flights to Lagos',
            'Flights to Kinshasa',
            'Flights to Tunis',
            'Flights to Cairo',
            'Flights to Accra',
            'Flights to Malabo',
            'Flights to Monrovia',
            'Flights to Niamey',
            'Flights to Douala',
            'Flights to Yaounde',
          ],
        },
        {
          title: 'Other flights',
          links: [
            'Flights to Montreal',
            'Flights to New York',
            'Flights to Washington',
            'Flights to Miami',
            'Flights to Jeddah',
            'Flights to Doha',
            'Flights to Dubai',
            'Flights to Riyadh',
          ],
        },
      ],
    },

    {
      title: 'Help',
      links: [
        'Baggage incidents',
        'Frequently asked questions',
        'Worldwide agencies',
        'Delays and Disruptions',
        'Service claims',
        'Special needs',
        'Contact us',
      ],
    },
  ];

  const paymentMethods = [
    {
      title: 'IATA Pay',
      src: '/icons/payment-iata-pay.png',
    },
    {
      title: 'UATP',
      src: '/icons/payment-uatp.png',
    },
    {
      title: 'Mastercard',
      src: '/icons/payment-mastercard.png',
    },
    {
      title: 'Visa',
      src: '/icons/payment-visa.png',
    },
  ];

  const socialLinks = [
    {
      label: 'Facebook',
      icon: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.1c0-.9.3-1.6 1.7-1.6H16V4.8c-.3 0-.9-.1-1.8-.1-3 0-4.7 1.8-4.7 5V11H7v3h2.5v7h4z" />
        </svg>`,
    },

    {
      label: 'Instagram',
      icon: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 1 0 12 7.2zm0 8A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4z" />
          <path d="M17.3 3.8H6.7A2.9 2.9 0 0 0 3.8 6.7v10.6a2.9 2.9 0 0 0 2.9 2.9h10.6a2.9 2.9 0 0 0 2.9-2.9V6.7a2.9 2.9 0 0 0-2.9-2.9zm1.3 13.5c0 .7-.6 1.3-1.3 1.3H6.7c-.7 0-1.3-.6-1.3-1.3V6.7c0-.7.6-1.3 1.3-1.3h10.6c.7 0 1.3.6 1.3 1.3v10.6z" />
          <circle cx="17.5" cy="6.5" r="1.1" />
        </svg>`,
    },

    {
      label: 'X',
      icon: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.9 4H21l-4.7 5.3L21.8 20h-4.3l-3.4-6-5.2 6H6.8l5.1-5.8L2.6 4h4.5l3 5.3L18.9 4zM17.4 18.4h1.2L7.9 5.5H6.6l10.8 12.9z" />
        </svg>`,
    },

    {
      label: 'YouTube',
      icon: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21.6 8.2a2.8 2.8 0 0 0-2-2c-1.8-.5-7.6-.5-7.6-.5s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 3.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-3.8zM10 15.3V8.7l5.8 3.3-5.8 3.3z" />
        </svg>`,
    },

    {
      label: 'Messenger',
      icon: `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C6.5 2 2.2 6.1 2.2 11.2c0 2.9 1.4 5.4 3.7 7v3.6l3.5-1.9c.8.2 1.7.3 2.6.3 5.5 0 9.8-4.1 9.8-9.2S17.5 2 12 2zm1 12.4-2.5-2.7-4.8 2.7 5.3-5.7 2.5 2.7 4.8-2.7-5.3 5.7z" />
        </svg>`,
    },
  ];

  const chevronIcon = `
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.2 5.5 8 10.3l4.8-4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;

  const searchIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`;

  const renderLinkItems = (links) => links.map((link) => `
    <li>
      <a href="#">${link}</a>
    </li>`).join('');

  const renderPanelContent = (group) => {
    if (group.sections) {
      return `
        <div class="ram-footer-panel-groups">
          ${group.sections.map((section) => `
            <section class="ram-footer-panel-group">
              <h4 class="ram-footer-panel-heading">${section.title}</h4>
              <ul class="ram-footer-link-list">
                ${renderLinkItems(section.links)}
              </ul>
            </section>`).join('')}
        </div>`;
    }

    return `
      <ul class="ram-footer-link-list">
        ${renderLinkItems(group.links)}
      </ul>`;
  };

  const renderSearchForm = (className, inputId) => `
    <form class="ram-footer-search ${className}" role="search">
      <label class="ram-footer-search-label" for="${inputId}">Search on our website</label>
      <div class="ram-search-box">
        <input
          id="${inputId}"
          type="search"
          placeholder="Search on our website"
        />

        <button type="submit" aria-label="Search">
          ${searchIcon}
        </button>
      </div>
    </form>`;

  block.innerHTML = `
    <footer class="ram-footer">
      <div class="ram-footer-top ram-footer-top-desktop">
        <div class="ram-footer-nav" role="tablist" aria-label="Footer navigation">
          ${footerLinks.map((group, index) => {
    const panelId = `ram-footer-panel-desktop-${index}`;
    const buttonId = `ram-footer-toggle-desktop-${index}`;

    return `
              <div class="ram-footer-nav-item">
                <button
                  type="button"
                  id="${buttonId}"
                  class="ram-footer-toggle ram-footer-toggle-desktop"
                  data-footer-index="${index}"
                  aria-expanded="false"
                  aria-controls="${panelId}"
                >
                  <span>${group.title}</span>
                  <span class="ram-footer-toggle-icon">${chevronIcon}</span>
                </button>
              </div>`;
  }).join('')}
        </div>

        ${renderSearchForm('ram-footer-search-desktop', 'ram-footer-search-input-desktop')}
      </div>

      <div class="ram-footer-panels ram-footer-panels-desktop">
        ${footerLinks.map((group, index) => {
    const panelId = `ram-footer-panel-desktop-${index}`;
    const buttonId = `ram-footer-toggle-desktop-${index}`;

    return `
            <div
              id="${panelId}"
              class="ram-footer-panel ram-footer-panel-desktop"
              role="region"
              aria-labelledby="${buttonId}"
              hidden
            >
              ${renderPanelContent(group)}
            </div>`;
  }).join('')}
      </div>

      <div class="ram-footer-mobile" aria-label="Footer mobile navigation">
        ${renderSearchForm('ram-footer-search-mobile', 'ram-footer-search-input-mobile')}

        <div class="ram-footer-mobile-nav">
          ${footerLinks.map((group, index) => {
    const panelId = `ram-footer-panel-mobile-${index}`;
    const buttonId = `ram-footer-toggle-mobile-${index}`;

    return `
              <div class="ram-footer-mobile-item">
                <button
                  type="button"
                  id="${buttonId}"
                  class="ram-footer-toggle ram-footer-toggle-mobile"
                  data-footer-index="${index}"
                  aria-expanded="false"
                  aria-controls="${panelId}"
                >
                  <span>${group.title}</span>
                  <span class="ram-footer-toggle-icon">${chevronIcon}</span>
                </button>

                <div
                  id="${panelId}"
                  class="ram-footer-panel ram-footer-panel-mobile"
                  role="region"
                  aria-labelledby="${buttonId}"
                  hidden
                >
                  ${renderPanelContent(group)}
                </div>
              </div>`;
  }).join('')}
        </div>
      </div>

      <div class="ram-footer-middle">
        <div class="ram-footer-payments">
          <p>Payment Methods</p>
          <div class="ram-payment-icons">
            ${paymentMethods.map((method) => `
              <a href="#" class="ram-payment-link" title="${method.title}" aria-label="${method.title}">
                <img src="${method.src}" alt="${method.title}" class="ram-payment-image" />
              </a>`).join('')}
          </div>
        </div>

        <div class="ram-footer-social">
          <p>Follow us on</p>
          <div class="ram-social-icons">
            ${socialLinks.map((social) => `
              <a
                href="#"
                aria-label="${social.label}"
                class="ram-social-icon"
              >
                ${social.icon}
              </a>`).join('')}
          </div>
        </div>
      </div>

      <div class="ram-footer-bottom">
        <div class="ram-footer-legal">
          <a href="#">Site map</a>
          <a href="#">General terms and conditions</a>
          <a href="#">Our Partners</a>
        </div>
        <p>© 2026 Royal Air Maroc. Tous les droits reserves</p>
      </div>
    </footer>
  `;

  const desktopToggles = [...block.querySelectorAll('.ram-footer-toggle-desktop')];
  const desktopPanels = [...block.querySelectorAll('.ram-footer-panel-desktop')];
  const mobileToggles = [...block.querySelectorAll('.ram-footer-toggle-mobile')];
  const mobilePanels = [...block.querySelectorAll('.ram-footer-panel-mobile')];
  const footerPanelsContainer = block.querySelector('.ram-footer-panels-desktop');

  const setExpandedIndex = (nextIndex = null) => {
    desktopToggles.forEach((button, index) => {
      const isActive = index === nextIndex;

      button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      button.parentElement.classList.toggle('is-active', isActive);
      desktopPanels[index].hidden = !isActive;
    });

    mobileToggles.forEach((button, index) => {
      const isActive = index === nextIndex;

      button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      button.parentElement.classList.toggle('is-active', isActive);
      mobilePanels[index].hidden = !isActive;
    });

    footerPanelsContainer?.classList.toggle('has-active-panel', nextIndex !== null);
  };

  [...desktopToggles, ...mobileToggles].forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.footerIndex);
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      setExpandedIndex(isExpanded ? null : index);
    });
  });

  block.querySelectorAll('.ram-footer-search').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  });

  const socialIcons = block.querySelectorAll('.ram-social-icon');
  socialIcons.forEach((icon) => {
    icon.addEventListener('mouseenter', () => {
      icon.classList.add('hovered');
    });

    icon.addEventListener('mouseleave', () => {
      icon.classList.remove('hovered');
    });
  });
} 