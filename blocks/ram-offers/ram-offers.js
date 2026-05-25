export default function decorate(block) {

  const offers = [
    {
      city: 'Paris',
      price: '279',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400'
    },

    {
      city: 'Dubai',
      price: '399',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1400'
    },

    {
      city: 'Marrakech',
      price: '199',
      currency: 'EUR',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1400'
    }
  ];

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

          ${offers.map((offer, index) => `
            <article
              class="ram-offer-card ${index === 0 ? 'active' : ''}"
            >

              <div class="ram-offer-image">

                <img
                  src="${offer.image}"
                  alt="${offer.city}"
                />

              </div>

              <div class="ram-offer-details">

                <div class="ram-arrow"></div>

                <div>

                  <h3>${offer.city}</h3>

                  <p>
                    From
                    <strong>${offer.price}</strong>
                    ${offer.currency}/ RT
                  </p>

                </div>

              </div>

            </article>
          `).join('')}

        </div>

      </div>

    </section>
  `;

  const cards = block.querySelectorAll('.ram-offer-card');

  cards.forEach((card) => {

    card.addEventListener('mouseenter', () => {

      cards.forEach((c) => c.classList.remove('active'));

      card.classList.add('active');
    });
  });
}