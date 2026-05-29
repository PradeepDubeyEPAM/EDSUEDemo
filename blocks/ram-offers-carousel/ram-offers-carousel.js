export default function decorate(block) {

  const slides = [
    {
      title: 'Discover',
      image: '/icons/carousel-family-pack.jpg',
      alt: 'Family Pack'
    },

    {
      title: 'Discover',
      image: '/icons/carousel-safar-flyer.jpg',
      alt: 'Safar Flyer'
    }
  ];

  block.innerHTML = `
    <section class="ram-updates-carousel">

      <div class="ram-updates-header">

        <h2>
          Offers and Updates
        </h2>

        <div class="ram-carousel-controls">

          ${slides.map((slide, index) => `
            <button class="ram-nav ram-indicator${index === 0 ? ' is-active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}: ${slide.alt}">
              <span></span>
            </button>
          `).join('')}

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
  const indicators = [...block.querySelectorAll('.ram-indicator')];
  const slidesEl = [...block.querySelectorAll('.ram-slide')];
  let currentIndex = 0;

  const getStep = () => {
    const firstSlide = block.querySelector('.ram-slide');
    const track = block.querySelector('.ram-carousel-track');
    if (!firstSlide) return 460;
    const slideRect = firstSlide.getBoundingClientRect();
    const gap = track ? parseFloat(window.getComputedStyle(track).gap || '0') : 0;
    return Math.round(slideRect.width + gap);
  };

  const hasOverflow = () => wrapper.scrollWidth > wrapper.clientWidth + 2;

  const setActiveIndicator = (index) => {
    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === index;
      indicator.classList.toggle('is-active', isActive);
      indicator.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const getCurrentIndex = () => {
    const step = getStep();
    if (!step) return 0;
    const index = Math.round(wrapper.scrollLeft / step);
    return Math.max(0, Math.min(slidesEl.length - 1, index));
  };

  const goToIndex = (index, smooth = true) => {
    if (!slidesEl.length) return;
    const nextIndex = Math.max(0, Math.min(slidesEl.length - 1, index));
    const step = getStep();
    const left = nextIndex * step;

    if (smooth) {
      wrapper.scrollTo({ left, behavior: 'smooth' });
    } else {
      wrapper.scrollLeft = left;
    }

    currentIndex = nextIndex;
    setActiveIndicator(currentIndex);
  };

  const moveNext = (smooth = true) => {
    if (!hasOverflow()) return;

    const nextIndex = (currentIndex + 1) % slidesEl.length;
    goToIndex(nextIndex, smooth);
  };

  const shouldAutoRotate = () => true;

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

  indicators.forEach((indicator) => {
    indicator.addEventListener('click', () => {
      const targetIndex = Number(indicator.dataset.index || 0);
      goToIndex(targetIndex);
      startAutoRotate();
    });
  });

  wrapper.addEventListener('scroll', () => {
    const scrolledIndex = getCurrentIndex();
    if (scrolledIndex !== currentIndex) {
      currentIndex = scrolledIndex;
      setActiveIndicator(currentIndex);
    }
  }, { passive: true });

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

  setActiveIndicator(currentIndex);

  startAutoRotate();
}