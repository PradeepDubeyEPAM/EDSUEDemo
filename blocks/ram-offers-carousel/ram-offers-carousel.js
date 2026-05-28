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

  const getStep = () => {
    const firstSlide = block.querySelector('.ram-slide');
    const track = block.querySelector('.ram-carousel-track');
    if (!firstSlide) return 460;
    const slideRect = firstSlide.getBoundingClientRect();
    const gap = track ? parseFloat(window.getComputedStyle(track).gap || '0') : 0;
    return Math.round(slideRect.width + gap);
  };

  const hasOverflow = () => wrapper.scrollWidth > wrapper.clientWidth + 2;

  const moveNext = (smooth = true) => {
    if (!hasOverflow()) return;

    const step = getStep();
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    const atEnd = wrapper.scrollLeft + step >= maxScroll - 2;

    if (atEnd) {
      if (smooth) {
        wrapper.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        wrapper.scrollLeft = 0;
      }
      return;
    }

    if (smooth) {
      wrapper.scrollBy({ left: step, behavior: 'smooth' });
    } else {
      wrapper.scrollLeft += step;
    }
  };

  const shouldAutoRotate = () => window.innerWidth < 1321;

  let autoTimer = null;

  const stopAutoRotate = () => {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const startAutoRotate = () => {
    stopAutoRotate();

    if (!shouldAutoRotate() || !hasOverflow()) return;

    autoTimer = window.setInterval(() => {
      moveNext(false);
    }, 2000);
  };

  prev.addEventListener('click', () => {

    wrapper.scrollBy({
      left: -getStep(),
      behavior: 'smooth'
    });

    startAutoRotate();
  });

  next.addEventListener('click', () => {

    moveNext();

    startAutoRotate();
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

  wrapper.addEventListener('mouseenter', stopAutoRotate);
  wrapper.addEventListener('mouseleave', startAutoRotate);
  wrapper.addEventListener('focusin', stopAutoRotate);
  wrapper.addEventListener('focusout', startAutoRotate);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoRotate();
    } else {
      startAutoRotate();
    }
  });

  window.addEventListener('resize', startAutoRotate);

  startAutoRotate();
}