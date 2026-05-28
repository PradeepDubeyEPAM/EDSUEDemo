export default function decorate(block) {

  const offer = {
    city: 'Paris',
    price: '280',
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400'
  };

  block.innerHTML = `
    <section class="ram-offers-section">

      <div class="ram-pattern"></div>

      <div class="ram-offers-wrapper">

        <!-- LEFT CONTENT -->
        <div class="ram-offers-content">

          <h2>
            Start your <strong>journey</strong>
          </h2>

          <p>
            we make it memorable
          </p>

          <button class="ram-offers-btn">
            See all offers
          </button>

        </div>

        <!-- RIGHT OFFER CARDS -->
        <div class="ram-offers-cards">
          <article class="ram-offer-card active">

            <div class="ram-offer-image">

              <img
                src="${offer.image}"
                alt="${offer.city}"
              />

            </div>

            <div class="ram-offer-details">

              <div class="ram-arrow"></div>

              <div class="ram-offer-meta">

                <h3>${offer.city}</h3>

                <p>
                  From
                  <strong>${offer.price}</strong>
                  ${offer.currency}/ RT
                </p>

                <a href="#" class="ram-offer-book">
                  Book now
                  <span aria-hidden="true">›</span>
                </a>

              </div>

            </div>

          </article>

        </div>

      </div>

    </section>
  `;
}