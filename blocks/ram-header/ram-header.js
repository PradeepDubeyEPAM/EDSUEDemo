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

              <div class="mega-menu">
                <div class="menu-column">
                  <h4>Flights</h4>
                  <a href="#">Book a Flight</a>
                  <a href="#">Manage Booking</a>
                  <a href="#">Flight Status</a>
                </div>

                <div class="menu-column">
                  <h4>Services</h4>
                  <a href="#">Seat Selection</a>
                  <a href="#">Extra Baggage</a>
                  <a href="#">Upgrade</a>
                </div>
              </div>
            </li>

            <li class="has-dropdown">
              <a href="#">Explore</a>

              <div class="mega-menu">
                <div class="menu-column">
                  <h4>Europe</h4>
                  <a href="#">Paris</a>
                  <a href="#">London</a>
                  <a href="#">Madrid</a>
                </div>

                <div class="menu-column">
                  <h4>Africa</h4>
                  <a href="#">Casablanca</a>
                  <a href="#">Marrakech</a>
                  <a href="#">Dakar</a>
                </div>
              </div>
            </li>

            <li>
              <a href="#">Experience</a>
            </li>

            <li>
              <a href="#">Information</a>
            </li>

            <li>
              <a href="#">Safar Flyer</a>
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

  const showLogoFallback = () => {
    logoSection?.classList.add('logo-missing');
  };

  if (logoImage) {
    logoImage.addEventListener('error', showLogoFallback);
    if (logoImage.complete && logoImage.naturalWidth === 0) {
      showLogoFallback();
    }
  }

  mobileToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Mobile Dropdowns
  const dropdownItems = block.querySelectorAll('.has-dropdown');

  dropdownItems.forEach((item) => {

    const link = item.querySelector(':scope > a');

    link.addEventListener('click', (e) => {

      if (window.innerWidth <= 992) {
        e.preventDefault();

        // Close others
        dropdownItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('dropdown-open');
          }
        });

        item.classList.toggle('dropdown-open');
      }
    });
  });

  // Sticky Header
  window.addEventListener('scroll', () => {

    const header = block.querySelector('.ram-header');

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

      dropdownItems.forEach((item) => {
        item.classList.remove('dropdown-open');
      });
    }
  });
}