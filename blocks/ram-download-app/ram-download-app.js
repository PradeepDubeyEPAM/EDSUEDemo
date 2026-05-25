export default function decorate(block) {

  block.innerHTML = `
    <section class="ram-download-app">

      <!-- Background Pattern -->
      <div class="ram-download-pattern"></div>

      <!-- Moving Hashtags -->
      <div class="ram-hashtag-strip">

        <div class="ram-hashtag-track">

          <span>#DreamAfrica</span>
          <span>#MeetMorocco</span>

        </div>

      </div>

      <div class="ram-download-wrapper">

        <!-- LEFT CONTENT -->
        <div class="ram-download-content">

          <p class="ram-download-eyebrow">
            Mobile App
          </p>

          <h2>
            Download
            <br />
            our app
          </h2>

          <p class="ram-download-description">
            Book flights, manage your trips,
            check in online and stay updated
            with Royal Air Maroc wherever you are.
          </p>

          <!-- Store Buttons -->
          <div class="ram-store-buttons">

            <a
              href="#"
              class="ram-store-btn"
              aria-label="Download on the App Store"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
              />
            </a>

            <a
              href="#"
              class="ram-store-btn"
              aria-label="Get it on Google Play"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
              />
            </a>

          </div>

        </div>

        <!-- RIGHT VISUAL -->
        <div class="ram-download-visual">

          <div class="ram-phone-wrapper">

            <img
              class="ram-phone-image"
              src="https://www.royalairmaroc.com/documents/20127/3178766/mockup-app.png"
              alt="Royal Air Maroc App"
            />

          </div>

          <!-- QR CARD -->
          <div class="ram-qr-card">

            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://www.royalairmaroc.com"
              alt="QR Code"
            />

            <p>
              Scan to download
            </p>

          </div>

        </div>

      </div>

    </section>
  `;

  const phone = block.querySelector('.ram-phone-wrapper');

  phone.addEventListener('mouseenter', () => {
    phone.classList.add('hovered');
  });

  phone.addEventListener('mouseleave', () => {
    phone.classList.remove('hovered');
  });
}