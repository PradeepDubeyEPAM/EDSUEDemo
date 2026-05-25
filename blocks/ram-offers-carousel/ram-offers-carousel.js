export default function decorate(block) {

  const slides = [
    {
      title: 'Discover',
      image: 'https://www.royalairmaroc.com/documents/20127/3178766/family-pack.jpg',
      alt: 'Family Pack'
    },

    {
      title: 'Discover',
      image: 'https://www.royalairmaroc.com/documents/20127/3178766/safar-flyer.jpg',
      alt: 'Safar Flyer'
    },

    {
      title: 'Discover',
      image: 'https://www.royalairmaroc.com/documents/20127/3178766/business-class.jpg',
      alt: 'Business Class'
    }
  ];

  block.innerHTML = `
    <section class="ram-updates-carousel">

      <div class="ram-updates-header">

        <h2>
          Offers and Updates
        </h2>

        <div class="ram-carousel-controls">

          <button class="ram-nav prev" aria-label="Previous slide">
            <span></span>
          </button>

          <button class="ram-nav next" aria-label="Next slide">
            <span></span>
          </button>

        </div>

      </div>

      <div class="ram-carousel-wrapper">

        <div class="ram-carousel-track">

          ${slides.map((slide) => `
            <article class="ram-slide">

              <div class="ram-slide-image">

                <img
                  src="${slide.image}"
                  alt="${slide.alt}"
                  loading="lazy"
                />

              </div>

              <div class="ram-slide-overlay"></div>

              <div class="ram-slide-content">

                <button class="ram-slide-btn">
                  ${slide.title}
                </button>

              </div>

            </article>
          `).join('')}

        </div>

      </div>

    </section>
  `;

  const wrapper = block.querySelector('.ram-carousel-wrapper');

  const prev = block.querySelector('.ram-nav.prev');
  const next = block.querySelector('.ram-nav.next');

  const slideWidth = 460;

  prev.addEventListener('click', () => {

    wrapper.scrollBy({
      left: -slideWidth,
      behavior: 'smooth'
    });
  });

  next.addEventListener('click', () => {

    wrapper.scrollBy({
      left: slideWidth,
      behavior: 'smooth'
    });
  });

  const slidesEl = block.querySelectorAll('.ram-slide');

  slidesEl.forEach((slide) => {

    slide.addEventListener('mouseenter', () => {
      slide.classList.add('hovered');
    });

    slide.addEventListener('mouseleave', () => {
      slide.classList.remove('hovered');
    });
  });
}