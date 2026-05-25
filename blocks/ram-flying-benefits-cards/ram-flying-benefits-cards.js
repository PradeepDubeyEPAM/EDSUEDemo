export default function decorate(block) {

  const benefits = [
    {
      title: 'Meals included in all our flights',
      description: 'Delight in carefully prepared complimentary meals on flights',
      icon: 'meal'
    },

    {
      title: 'Free hold luggage for your trip',
      description: 'Travel stress-free with included complimentary baggage allowance',
      icon: 'luggage'
    },

    {
      title: 'Entertainment on board',
      description: 'Enjoy the latest movies and music during flights',
      icon: 'entertainment'
    },

    {
      title: 'Extra leg room in all our flights',
      description: 'Stretch out and enjoy enhanced comfort on flights',
      icon: 'legroom'
    }
  ];

  block.innerHTML = `
    <section class="ram-flying-benefits">

      <div class="ram-benefits-wrapper">

        <div class="ram-benefits-header">

          <h2>
            What makes so great
            <br />
            flying with us?
          </h2>

        </div>

        <div class="ram-benefits-grid">

          ${benefits.map((benefit) => `
            <article class="ram-benefit-card">

              <div class="ram-benefit-icon ${benefit.icon}"></div>

              <div class="ram-benefit-content">

                <h3>
                  ${benefit.title}
                </h3>

                <p>
                  ${benefit.description}
                </p>

                <button class="ram-benefit-link">
                  Learn more
                </button>

              </div>

            </article>
          `).join('')}

        </div>

      </div>

    </section>
  `;

  const cards = block.querySelectorAll('.ram-benefit-card');

  cards.forEach((card) => {

    card.addEventListener('mouseenter', () => {

      cards.forEach((item) => {
        item.classList.remove('active');
      });

      card.classList.add('active');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('active');
    });
  });
}