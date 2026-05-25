export default function decorate(block) {

  block.innerHTML = `
    <header class="ram-header">

      <!-- Top Utility Bar -->
      <div class="top-bar">
        <div class="top-bar-left">
          <a href="#">EN</a>
          <span>|</span>
          <a href="#">FR</a>
          <span>|</span>
          <a href="#">ES</a>
        </div>

        <div class="top-bar-right">
          <a href="#">Login</a>
          <span>|</span>
          <a href="#">Join Safar Flyer</a>
        </div>
      </div>

      <!-- Main Header -->
      <div class="main-header">

        <!-- Logo -->
        <div class="logo-section">
          <a href="/">
            <img src="/icons/logo.svg" alt="Royal Air Maroc" />
          </a>
        </div>

        <!-- Navigation -->
        <nav class="main-nav">
          <ul>

            <li class="has-dropdown">
              <a href="#">Booking</a>

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
              <a href="#">Destinations</a>

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
              <a href="#">Offers</a>
            </li>

            <li>
              <a href="#">Experience</a>
            </li>

            <li>
              <a href="#">Help</a>
            </li>

          </ul>
        </nav>

        <!-- Actions -->
        <div class="header-actions">
          <button class="search-btn">Search</button>
          <button class="book-btn">Book a Flight</button>
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