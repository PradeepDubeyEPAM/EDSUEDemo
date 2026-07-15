const TAB_DATA = [
  {
    id: 'assistant',
    label: 'RAM Assistant',
    eyebrow: 'Mobile apps',
    title: 'RAM Assistant : a valuable travel companion',
    description: [],
    bodyHtml: `
      <p class="seat-content-body">
        You would like to benefit from a personalized assistance throughout your trip?
        <br><br>
        Download the RAM Assistant application and get to know your new travel companion.
        <br>
        Available on
        <a class="ram-assistant-tab-store-link" href="https://play.google.com/store/apps/details?id=com.ram1" target="_blank" rel="noopener noreferrer">Google Play</a>
        et
        <a class="ram-assistant-tab-store-link" href="https://apps.apple.com/us/app/ram-assistant/id1459363249" target="_blank" rel="noopener noreferrer">App Store</a>
        <br><br>
        This application, specially created to enhance your customer experience, allows you to access, from your cell phone, all the information about your flight. You will be able to :
        <br><br>
        -Follow the status of your flight in real time
        <br>
        -Save time by registering online
        <br>
        -Order your special meals up to 48 hours before departure
        <br>
        -Request the assistance you need during your trip
        <br>
        -Track the status of your luggage throughout your trip
        <br>
        -Check your Safar Flyer account balance and discover all the advantages your card offers you.
        <br><br>
        You will never travel alone on board Royal Air Maroc again!
      </p>
    `,
    heroImage: '/icons/hero.png',
    heroAlt: 'Royal Air Maroc assistant application',
    storeLinks: [],
    features: [
      {
        title: 'Follow your flight in real time',
        copy: 'Receive live updates for check-in, gate, and schedule changes directly from your phone.',
        image: '/icons/entertainment.jpg',
        imageAlt: 'Flight status updates on a mobile phone',
      },
      {
        title: 'Manage every step easily',
        copy: 'Register online, request assistance, and keep your trip details accessible throughout the journey.',
        image: '/icons/meal.jpg',
        imageAlt: 'Traveler using mobile services',
      },
    ],
  },
  {
    id: 'mystery-shopper',
    label: 'Mystery Shopper App',
    eyebrow: 'Mobile apps',
    title: 'Discover the new version of Royal Air Maroc Mystery Shopper app!',
    description: [],
    bodyHtml: `
      <p class="seat-content-body">
        Integrated with RAM Assistant, this upgrade allows you to contribute to enhance your travel experience. The new version features improved functionality and an optimized interface for a better user experience.
        <br>
        This new version offers enhanced features and presents an optimized interface for a better user experience.
        <br>
        As a Safar Flyer member, you can earn extra Miles by participating in the assessment and help make every flight an exceptional experience.
        <br><br>
        Download RAM Assistant App now to explore the updated Mystery Shopper features!
        <br><br>
        Available on
        <a class="ram-assistant-tab-store-link" href="https://play.google.com/store/apps/details?id=com.ram1" target="_blank" rel="noopener noreferrer">Google Play</a>
        and
        <a class="ram-assistant-tab-store-link" href="https://apps.apple.com/us/app/ram-assistant/id1459363249" target="_blank" rel="noopener noreferrer">App Store</a>
      </p>
    `,
    heroImage: '/icons/ram-app-hero.jpg',
    heroAlt: 'Mystery shopper mobile application',
    storeLinks: [],
    features: [
      {
        title: 'Contribute to every journey',
        copy: 'Share your observations and help improve the customer experience through guided in-app missions.',
        image: '/icons/laggage.jpg',
        imageAlt: 'Traveler reviewing their journey',
      },
      {
        title: 'Earn more as a member',
        copy: 'Participate in evaluations and unlock more value from your Safar Flyer membership.',
        image: '/icons/legroom.jpg',
        imageAlt: 'Safar Flyer member journey benefits',
      },
    ],
  },
  {
    id: 'all-in-one',
    label: 'Royal Air Maroc "All-In-One" App',
    eyebrow: 'Mobile apps',
    title: 'Royal Air Maroc Mobile App',
    richLayout: true,
    description: [],
    bodyHtml: `
      <p class="seat-content-body seat-content-body-centered">
        Travel with ease with the new app. Book, manage, and track your journey directly from your smartphone. The new version is designed to support you at every step with greater fluidity and flexibility. Access a wide range of services and discover new features added regularly to enrich your travel experience. Download it now. Simplify your journeys by downloading the Royal Air Maroc mobile app today.
        <br><br>
        Available on
        <a class="ram-assistant-tab-store-link" href="https://play.google.com/store/apps/details?id=com.ram1" target="_blank" rel="noopener noreferrer">Google Play</a>
        and
        <a class="ram-assistant-tab-store-link" href="https://apps.apple.com/us/app/ram-assistant/id1459363249" target="_blank" rel="noopener noreferrer">App Store</a>
      </p>
    `,
    heroImage: '/icons/ram-app-hero.jpg',
    heroAlt: 'Royal Air Maroc all-in-one mobile app',
    storeLinks: [],
    features: [
      {
        title: 'Book in just a few clicks',
        copy: 'Search, book, and pay securely in just a few taps, with the option to hold your reservation or book multi-destination flights.',
        image: '/icons/ram-app-booking.jpg',
        imageAlt: 'Mobile phone showing booking features',
      },
      {
        title: 'Manage your trip with ease',
        copy: 'Add baggage, select your seat, request assistance, or upgrade. All services are accessible directly in the app.',
        image: '/icons/ram-app-manage.jpg',
        imageAlt: 'Mobile trip management features',
      },
      {
        title: 'Check-in and stay informed',
        copy: 'Check in online and receive live flight updates, including reminders, gate changes, and personalized offers.',
        image: '/icons/ram-app-checking.jpg',
        imageAlt: 'Mobile check-in and flight update features',
      },
    ],
  },
];

function getActiveTab(tabId) {
  return TAB_DATA.find((tab) => tab.id === tabId) || TAB_DATA[0];
}

function renderStoreLinks(links = []) {
  if (!links.length) return '';

  const items = links.map((link) => `
    <a class="ram-assistant-tab-store-link" href="${link.href}" target="_blank" rel="noreferrer">
      ${link.label}
    </a>
  `).join('');

  return `
    <p class="ram-assistant-tab-store-links">
      Available on ${items}
    </p>
  `;
}

function renderPanel(tab) {
  const descriptionContent = tab.bodyHtml
    || tab.description.map((item) => `<p>${item}</p>`).join('');

  if (tab.richLayout) {
    const featureItems = tab.features.map((feature, index) => `
      <article class="ram-assistant-tab-feature${index % 2 ? ' is-reversed' : ''}">
        <div class="ram-assistant-tab-feature-media">
          <img src="${feature.image}" alt="${feature.imageAlt}" loading="lazy">
        </div>
        <div class="ram-assistant-tab-feature-copy">
          <h3>${feature.title}</h3>
          <p>${feature.copy}</p>
        </div>
      </article>
    `).join('');

    return `
      <div class="ram-assistant-tab-layout ram-assistant-tab-layout-rich">
        <div class="ram-assistant-tab-hero">
          <img src="${tab.heroImage}" alt="${tab.heroAlt}" loading="lazy">
        </div>
        <div class="ram-assistant-tab-copy ram-assistant-tab-copy-centered">
          <h2>${tab.title}</h2>
          <div class="ram-assistant-tab-description">
            ${descriptionContent}
          </div>
        </div>
        <div class="ram-assistant-tab-features">
          ${featureItems}
        </div>
      </div>
    `;
  }

  return `
    <div class="ram-assistant-tab-layout">
      <div class="ram-assistant-tab-copy">
        <h2>${tab.title}</h2>
        <div class="ram-assistant-tab-description">
          ${descriptionContent}
        </div>
        ${renderStoreLinks(tab.storeLinks)}
      </div>
    </div>
  `;
}

function renderTabs(activeId) {
  const activeTab = getActiveTab(activeId);
  const tabs = TAB_DATA.map((tab) => `
      <button
        type="button"
        class="ram-assistant-tab-button${tab.id === activeId ? ' is-active' : ''}"
        role="tab"
        aria-selected="${tab.id === activeId}"
        aria-controls="ram-assistant-tab-panel-${tab.id}"
        id="ram-assistant-tab-${tab.id}"
        data-assistant-tab="${tab.id}"
        tabindex="${tab.id === activeId ? '0' : '-1'}"
      >
        ${tab.label}
      </button>
    `).join('');

  return `
    <section class="ram-assistant-tab-shell">
      <div class="ram-assistant-tab-nav" role="tablist" aria-label="Royal Air Maroc mobile applications">
        ${tabs}
      </div>
      <div
        class="ram-assistant-tab-panel"
        role="tabpanel"
        id="ram-assistant-tab-panel-${activeTab.id}"
        aria-labelledby="ram-assistant-tab-${activeTab.id}"
      >
        ${renderPanel(activeTab)}
      </div>
    </section>
  `;
}

function activateTab(block, nextId) {
  block.querySelectorAll('[data-assistant-tab]').forEach((button) => {
    const isActive = button.dataset.assistantTab === nextId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', String(isActive));
    button.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  const panel = block.querySelector('.ram-assistant-tab-panel');
  const activeTab = getActiveTab(nextId);
  panel.id = `ram-assistant-tab-panel-${activeTab.id}`;
  panel.setAttribute('aria-labelledby', `ram-assistant-tab-${activeTab.id}`);
  panel.innerHTML = renderPanel(activeTab);
}

export default function decorate(block) {
  const defaultTab = TAB_DATA[0].id;
  block.innerHTML = renderTabs(defaultTab);

  block.addEventListener('click', (event) => {
    const button = event.target.closest('[data-assistant-tab]');
    if (!button || !block.contains(button)) return;
    activateTab(block, button.dataset.assistantTab);
  });
}
