export default function decorate(block) {

  block.innerHTML = `
    <section class="ram-newsletter">

      <div class="ram-newsletter-wrapper">

        <!-- LEFT IMAGE -->
        <div class="ram-newsletter-image-section">

          <div class="ram-newsletter-image-wrapper">

            <img
              src="https://www.royalairmaroc.com/documents/41472/61879/139564/3435adb4-597f-67f7-17ec-236c2bea7894?t=1760686195610"
              alt="Newsletter"
            />

          </div>

        </div>

        <!-- RIGHT CONTENT -->
        <div class="ram-newsletter-content">

          <p class="ram-newsletter-eyebrow">
            Newsletter
          </p>

          <h2>
            Join our newsletter
          </h2>

          <p class="ram-newsletter-description">
            Subscribe to receive exclusive offers,
            inspiration for your next trips,
            travel updates and the latest news
            from Royal Air Maroc.
          </p>

          <form class="ram-newsletter-form">

            <div class="ram-newsletter-input-wrapper">

              <input
                type="email"
                placeholder="Your email address"
                aria-label="Email address"
              />

            </div>

            <button type="submit">
              Subscribe
            </button>

          </form>

          <p class="ram-newsletter-note">
            By subscribing, you agree to receive
            promotional communications from
            Royal Air Maroc.
          </p>

        </div>

      </div>

    </section>
  `;

  const form = block.querySelector('.ram-newsletter-form');

  form.addEventListener('submit', (e) => {

    e.preventDefault();

    const button = form.querySelector('button');

    button.innerText = 'Subscribed ✓';

    button.classList.add('success');
  });

  const image = block.querySelector('.ram-newsletter-image-wrapper');

  image.addEventListener('mouseenter', () => {
    image.classList.add('hovered');
  });

  image.addEventListener('mouseleave', () => {
    image.classList.remove('hovered');
  });
}