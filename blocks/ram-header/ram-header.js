export default function decorate(block) {

  block.innerHTML = `
    <header class="ram-header">

      <div class="ram-alert-bar" role="region" aria-label="Travel alerts">
        <span class="ram-alert-icon" aria-hidden="true">ⓘ</span>
        <p class="ram-alert-text">
          <a href="#">Travel Restrictions to the United States</a>
          <a href="#" class="ram-alert-more">Read More</a>
        </p>
        <button class="ram-alert-next" aria-label="Next alert">›</button>
      </div>

      <!-- Top Utility Bar -->
      <!-- Main Header -->
      <div class="main-header">

        <!-- Logo -->
        <div class="logo-section">
          <a href="/">
            <img class="header__logo__img" src="/icons/logo_ram.svg" alt="Royal Air Maroc" />
          </a>
          <a href="/oneworld" class="header__oneworld" id="oneworld-logo-desktop">
            <img class="header__oneworld__img" src="/icons/oneworld.png" alt="Oneworld" />
          </a>
        </div>

        <!-- Navigation -->
        <nav class="main-nav">
          <ul>

            <li class="has-dropdown">
              <a href="#">Book</a>

              <div class="mega-menu mega-menu-book">
                <button class="mega-menu-close" type="button" aria-label="Close menu">×</button>

                <div class="mega-columns">
                  <div class="menu-column">
                    <h4>Plan your trip</h4>
                    <a href="#">Book a flight</a>
                    <a href="#">Hotels</a>
                    <a href="#">eSim</a>
                    <a href="#">Car rentals</a>
                    <a href="#">My driver</a>
                    <a href="#">Activities</a>
                  </div>

                  <div class="menu-column">
                    <h4>Extras</h4>
                    <a href="#">Add extra luggage</a>
                    <a href="#">Select seat</a>
                    <a href="#">E-Skyshop</a>
                    <a href="#">Upgrade</a>
                  </div>

                  <div class="menu-column">
                    <h4>Manage</h4>
                    <a href="#">Online Check-in</a>
                    <a href="#">Flight Status</a>
                    <a href="#">Flight Schedule</a>
                    <a href="#">Manage Booking</a>
                    <a href="#">RAM RESALE</a>
                  </div>
                </div>

                <a href="#" class="mega-offer-card" aria-label="Explore offers">
                  <img src="/icons/world.png" alt="Explore offers" />
                  <span>Explore offers →</span>
                </a>
              </div>
            </li>

            <li class="has-dropdown">
              <a href="#">Explore</a>

              <div class="mega-menu">
                <button class="mega-menu-close" type="button" aria-label="Close menu">×</button>

                <div class="menu-column">
                  <h4>Trending</h4>
                  <a href="#">Paris</a>
                  <a href="#">New York</a>
                  <a href="#">Istanbul</a>
                  <a href="#">Dubai</a>
                  <a href="#">Cairo</a>
                </div>

                <div class="menu-column">
                  <h4>Our Destinations</h4>
                  <a href="#">Europe</a>
                  <a href="#">Africa</a>
                  <a href="#">North America</a>
                  <a href="#">South America</a>
                  <a href="#">Asia</a>
                </div>

                <div class="menu-column">
                  <h4>Discover</h4>
                  <a href="#">Discover Morocco</a>
                  <a href="#">Our Network</a>
                  <a href="#">Road Map</a>
                  <a href="#">oneworld</a>
                </div>

                <a href="#" class="mega-offer-card" aria-label="Explore offers">
                  <img src="/icons/paris.jpeg" alt="Explore offers" />
                  <span>Explore offers →</span>
                </a>
              </div>
            </li>

            <li class="has-dropdown">
              <a href="#">Experience</a>

              <div class="mega-menu">
                <button class="mega-menu-close" type="button" aria-label="Close menu">×</button>

                <div class="menu-column">
                  <h4>At the airport</h4>
                  <a href="#">Royal Air Maroc lounges</a>
                  <a href="#">Partner lounges</a>
                  <a href="#">Children</a>
                  <a href="#">Airport Transit</a>
                </div>

                <div class="menu-column">
                  <h4>On-board</h4>
                  <a href="#">Dining onboard</a>
                  <a href="#">Entertainment</a>
                  <a href="#">Seats</a>
                  <a href="#">Sky press</a>
                </div>

                <div class="menu-column">
                  <h4>About us</h4>
                  <a href="#">Our fleet</a>
                  <a href="#">Dreamliner</a>
                  <a href="#">Applications Mobile</a>
                  <a href="#">Royal Air Maroc Cargo</a>
                  <a href="#">International United for Wildlife</a>
                </div>

                <a href="#" class="mega-offer-card" aria-label="Experience offers">
                  <img src="/icons/business.png" alt="Experience offers" />
                  <span>Travel better →</span>
                </a>
              </div>
            </li>

            <li class="has-dropdown">
              <a href="#">Information</a>

              <div class="mega-menu">
                <button class="mega-menu-close" type="button" aria-label="Close menu">×</button>

                <div class="menu-column">
                  <h4>Before travel</h4>
                  <a href="#">Baggage information</a>
                  <a href="#">Payment methods</a>
                  <a href="#">Fare conditions</a>
                  <a href="#">Check-in conditions</a>
                  <a href="#">Travel documents</a>
                  <a href="#">Service fees</a>
                  <a href="#">Visa and vaccinations</a>
                </div>

                <div class="menu-column">
                  <h4>Special needs</h4>
                  <a href="#">Travel with pets</a>
                  <a href="#">Children and pregnancy</a>
                  <a href="#">Special attendance</a>
                  <a href="#">Special meals</a>
                  <a href="#">Unattendance minors</a>
                  <a href="#">Special services</a>
                  <a href="#">Reduce mobility</a>
                </div>

                <a href="#" class="mega-offer-card" aria-label="Information">
                  <img src="/icons/card.png" alt="Information" />
                  <span>Need help? →</span>
                </a>
              </div>
            </li>

            <li class="has-dropdown">
              <a href="#">Safar Flyer</a>

              <div class="mega-menu">
                <button class="mega-menu-close" type="button" aria-label="Close menu">×</button>

                <div class="menu-column">
                  <h4>Discover Safar Flyer</h4>
                  <a href="#">How it works</a>
                  <a href="#">Safar Flyer & oneWorld</a>
                  <a href="#">Blue benefits</a>
                  <a href="#">Silver benefits</a>
                  <a href="#">Gold benefits</a>
                  <a href="#">Platinum benefits</a>
                </div>

                <div class="menu-column">
                  <h4>Programs</h4>
                  <a href="#">Family program</a>
                  <a href="#">Corporate program</a>
                  <a href="#">Access to lounge areas</a>
                </div>

                <div class="menu-column">
                  <h4>Earn and spend miles</h4>
                  <a href="#">How to earn miles</a>
                  <a href="#">How to spend miles</a>
                  <a href="#">Miles calculator</a>
                  <a href="#">Cash & miles</a>
                  <a href="#">Status booster</a>
                </div>

                <a href="#" class="mega-offer-card" aria-label="Safar Flyer">
                  <img src="/icons/carousel-safar-flyer.jpg" alt="Safar Flyer" />
                  <span>Join now →</span>
                </a>
              </div>
            </li>

          </ul>
        </nav>

        <!-- Actions -->
        <div class="header-actions">
          <button class="search-btn" aria-label="Search">
            <img src="/icons/search.svg" alt="" aria-hidden="true" class="search-icon-img" />
          </button>
          <div class="lang-selector">
            <span class="lang-globe">&#127760;</span>
            <span class="lang-label">EN</span>
            <span class="lang-caret">&#9660;</span>
          </div>
          <a href="#" class="login-join-btn">Login | Join</a>
        </div>

        <!-- Mobile Toggle -->
        <button class="mobile-menu-toggle" aria-label="Menu">
          ☰
        </button>

      </div>
    </header>
  `;

  // Mobile Menu Toggle
  const mobileToggle = block.querySelector('.mobile-menu-toggle');
  const nav = block.querySelector('.main-nav');
  const logoImage = block.querySelector('.logo-section img');
  const logoSection = block.querySelector('.logo-section');
  const header = block.querySelector('.ram-header');

  const showLogoFallback = () => {
    logoSection?.classList.add('logo-missing');
  };

  if (logoImage) {
    logoImage.addEventListener('error', showLogoFallback);
    if (logoImage.complete && logoImage.naturalWidth === 0) {
      showLogoFallback();
    }
  }

  const updateHeaderThemeByHeroBackground = () => {
    const heroBackground = document.querySelector('.ram-hero .hero-background');
    const hasInlineHeroImage = !!heroBackground?.querySelector('img[src]');
    const computedHeroBackground = heroBackground ? window.getComputedStyle(heroBackground).backgroundImage : 'none';
    const hasCssHeroBackground = computedHeroBackground && computedHeroBackground !== 'none';
    const hasHeroBackground = hasInlineHeroImage || hasCssHeroBackground;
    header.classList.toggle('no-hero-background', !hasHeroBackground);
    document.body.classList.toggle('ram-no-hero-background', !hasHeroBackground);
  };

  updateHeaderThemeByHeroBackground();
  requestAnimationFrame(updateHeaderThemeByHeroBackground);
  setTimeout(updateHeaderThemeByHeroBackground, 300);
  setTimeout(updateHeaderThemeByHeroBackground, 1200);
  window.addEventListener('load', updateHeaderThemeByHeroBackground);
  window.addEventListener('resize', updateHeaderThemeByHeroBackground);

  const themeObserver = new MutationObserver(() => {
    updateHeaderThemeByHeroBackground();
  });

  themeObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'src'],
  });

  const closeAllDropdowns = () => {
    dropdownItems.forEach((item) => {
      item.classList.remove('dropdown-open', 'nav-active');
    });
  };

  const syncMenuOpenState = () => {
    if (window.innerWidth <= 992) {
      header.classList.remove('menu-open');
      return;
    }
    const hasOpenDropdown = Array.from(dropdownItems).some((item) => item.classList.contains('dropdown-open'));
    header.classList.toggle('menu-open', hasOpenDropdown);
  };

  mobileToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    nav.classList.toggle('active');
    syncMenuOpenState();
  });

  // Mobile Dropdowns
  const dropdownItems = block.querySelectorAll('.has-dropdown');

  dropdownItems.forEach((item) => {

    const link = item.querySelector(':scope > a');
    const closeButton = item.querySelector('.mega-menu-close');

    link.addEventListener('click', (e) => {

      if (window.innerWidth <= 992) {
        e.preventDefault();

        // Close others
        dropdownItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('dropdown-open', 'nav-active');
          }
        });

        item.classList.toggle('dropdown-open');
        item.classList.toggle('nav-active', item.classList.contains('dropdown-open'));
        syncMenuOpenState();
      } else {
        e.preventDefault();
        const shouldOpen = !item.classList.contains('dropdown-open');
        closeAllDropdowns();
        if (shouldOpen) {
          item.classList.add('dropdown-open', 'nav-active');
        }
        syncMenuOpenState();
      }
    });

    closeButton?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      item.classList.remove('dropdown-open', 'nav-active');
      syncMenuOpenState();
    });
  });

  // Sticky Header
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
      nav.classList.remove('open');
      nav.classList.remove('active');

      closeAllDropdowns();
      block.querySelectorAll('.main-nav > ul > li').forEach((node) => node.classList.remove('nav-active'));
      syncMenuOpenState();
    }
  });

  window.addEventListener('resize', syncMenuOpenState);
}