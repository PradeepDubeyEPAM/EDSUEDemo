export default function decorate(block) {

  const items = [
    {
      icon: 'flight-pass',
      label: 'Flight pass',
      href: '#'
    },
    {
      icon: 'upgrade',
      label: 'Upgrade',
      href: '#'
    },
    {
      icon: 'seat',
      label: 'Seat',
      href: '#'
    },
    {
      icon: 'extra-bags',
      label: 'Extra bags',
      href: '#'
    },
    {
      icon: 'e-skyshop',
      label: 'E-Skyshop',
      href: '#'
    }
  ];

  block.innerHTML = `
    <div class="ram-shortcuts">

      <button class="ram-shortcut-nav prev" aria-label="Scroll left">
        <span class="chevron"></span>
      </button>

      <div class="ram-shortcuts-wrapper">

        <div class="ram-shortcuts-track">

          ${items.map((item) => `
            <a class="ram-shortcut-item" href="${item.href}">

              <span class="ram-icon ${item.icon}"></span>

              <span class="ram-label">
                ${item.label}
              </span>

            </a>
          `).join('')}

        </div>

      </div>

      <button class="ram-shortcut-nav next" aria-label="Scroll right">
        <span class="chevron"></span>
      </button>

    </div>
  `;

  const wrapper = block.querySelector('.ram-shortcuts-wrapper');
  const prev = block.querySelector('.ram-shortcut-nav.prev');
  const next = block.querySelector('.ram-shortcut-nav.next');

  const updateButtons = () => {

    prev.classList.toggle(
      'disabled',
      wrapper.scrollLeft <= 0
    );

    next.classList.toggle(
      'disabled',
      wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 1
    );
  };

  prev.addEventListener('click', () => {

    wrapper.scrollBy({
      left: -240,
      behavior: 'smooth'
    });
  });

  next.addEventListener('click', () => {

    wrapper.scrollBy({
      left: 240,
      behavior: 'smooth'
    });
  });

  wrapper.addEventListener('scroll', updateButtons);

  window.addEventListener('resize', updateButtons);

  updateButtons();
}