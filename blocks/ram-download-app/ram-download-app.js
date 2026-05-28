export default function decorate(block) {
  block.innerHTML = `
    <section class="ram-download-app">
      <div class="ram-download-shell">
        <div class="ram-download-card">
          <div class="ram-download-content">
            <h2><span>Download our app</h2></span>
            <p class="ram-download-description">
              Unlock a world of convenience with our app! Whether you're
              looking for personalized offers, quick customer support, or a
              flawless user experience. Don't miss out!
            </p>
            <div class="ram-store-buttons">
              <a
                href="https://apps.apple.com/fr/app/royal-air-maroc/id1302059210"
                class="ram-store-btn"
                aria-label="Download on the App Store"
              >
                <img
                  src="https://www.royalairmaroc.com/documents/41472/41474/139574/0eeafef0-2afd-56ce-9fee-76074189a024?t=1760686195594"
                  alt="Download on the App Store"
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.royalairmaroc.app&hl=fr&pli=1"
                class="ram-store-btn"
                aria-label="Get it on Google Play"
              >
                <img
                  src="https://www.royalairmaroc.com/documents/41472/41474/139575/fb702137-ba53-5101-e1d9-102b20352412?t=1760686195658"
                  alt="Get it on Google Play"
                />
              </a>
            </div>
          </div>

          <div class="ram-download-qr">
            <img
              class="ram-qr-image"
              src="https://www.royalairmaroc.com/documents/41472/61892/139760/4345c368-4072-93a6-d9ae-a138d99b0a4a?t=1760686197720"
              alt="Scan to download the Royal Air Maroc app"
            />
          </div>

          <div class="ram-download-visual">
            <div class="ram-phone-wrapper">
              <img
                class="ram-phone-image"
                src="https://www.royalairmaroc.com/documents/41472/61892/139770/00a98c07-1681-2309-4f52-6afd1525b275?t=1760686198334"
                alt="Royal Air Maroc App"
              />
            </div>
          </div>
        </div>

        <div class="ram-download-band" aria-hidden="true">
          <div class="ram-download-band-pattern"></div>
          <div class="ram-download-band-text">
            <span>#DREAMAFRICA</span>
            <span>#MEETMOROCCO</span>
          </div>
        </div>
      </div>
    </section>
  `;

  const phone = block.querySelector('.ram-phone-wrapper');

  if (!phone) {
    return;
  }

  phone.addEventListener('mouseenter', () => {
    phone.classList.add('hovered');
  });

  phone.addEventListener('mouseleave', () => {
    phone.classList.remove('hovered');
  });
}