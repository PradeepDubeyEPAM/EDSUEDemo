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
        'Royal Air Marco Cargo'
      ]
    },

    {
      title: 'Destinations',
      links: [
        'Africa',
        'Europe',
        'Middle East',
        'North America',
        'Asia',
        'Flight schedules'
      ]
    },

    {
      title: 'Help',
      links: [
        'Contact us',
        'Manage booking',
        'Baggage information',
        'Check-in',
        'Travel requirements',
        'FAQs'
      ]
    }
  ];

  const socialLinks = [
    {
      label: 'Facebook',
      icon: 'f'
    },

    {
      label: 'Instagram',
      icon: '◎'
    },

    {
      label: 'X',
      icon: '✕'
    },

    {
      label: 'YouTube',
      icon: '▶'
    },

    {
      label: 'LinkedIn',
      icon: 'in'
    }
  ];

  block.innerHTML = `
    <footer class="ram-footer">

      <!-- TOP SECTION -->
      <div class="ram-footer-top">

        <div class="ram-footer-brand">

          <img
            src="https://www.royalairmaroc.com/o/ram-theme/images/logo-white.svg"
            alt="Royal Air Maroc"
          />

          <p>
            The largest airline in Morocco connecting
            Africa to the world with excellence and hospitality.
          </p>

        </div>

        <div class="ram-footer-search">

          <label>
            Search on Royal Air Maroc
          </label>

          <div class="ram-search-box">

            <input
              type="text"
              placeholder="Search..."
            />

            <button aria-label="Search">
              →
            </button>

          </div>

        </div>

      </div>

      <!-- LINKS -->
      <div class="ram-footer-links">

        ${footerLinks.map((group) => `
          <div class="ram-footer-column">

            <h3>
              ${group.title}
            </h3>

            <ul>

              ${group.links.map((link) => `
                <li>
                  <a href="#">
                    ${link}
                  </a>
                </li>
              `).join('')}

            </ul>

          </div>
        `).join('')}

      </div>

      <!-- PAYMENT -->
      <div class="ram-footer-payments">

        <p>
          Payment methods
        </p>

        <div class="ram-payment-icons">

          <span>VISA</span>
          <span>Mastercard</span>
          <span>PayPal</span>
          <span>AMEX</span>

        </div>

      </div>

      <!-- SOCIAL -->
      <div class="ram-footer-social">

        <p>
          Follow us
        </p>

        <div class="ram-social-icons">

          ${socialLinks.map((social) => `
            <a
              href="#"
              aria-label="${social.label}"
              class="ram-social-icon"
            >
              ${social.icon}
            </a>
          `).join('')}

        </div>

      </div>

      <!-- BOTTOM -->
      <div class="ram-footer-bottom">

        <div class="ram-footer-legal">

          <a href="#">
            Legal notice
          </a>

          <a href="#">
            Privacy policy
          </a>

          <a href="#">
            Cookies
          </a>

          <a href="#">
            Terms & conditions
          </a>

        </div>

        <p>
          © Royal Air Maroc 2026. All rights reserved.
        </p>

      </div>

    </footer>
  `;

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