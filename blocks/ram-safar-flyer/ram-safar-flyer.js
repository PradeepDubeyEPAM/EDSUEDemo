export default function decorate(block) {

  block.innerHTML = `
    <section class="ram-safar-flyer">

      <!-- Background Pattern -->
      <div class="ram-safar-pattern"></div>

      <div class="ram-safar-wrapper">

        <!-- LEFT CONTENT -->
        <div class="ram-safar-content">

          <p class="ram-safar-eyebrow">
            Loyalty program
          </p>

          <h2>
            Welcome to
            <br />
            <strong>Safar Flyer</strong>,
            <br />
            our loyalty
            <br />
            program
          </h2>

          <ul class="ram-safar-list">

            <li>
              <span class="ram-safar-list-icon" aria-hidden="true"></span>
              <span>
                <b>Earn</b> Miles on every flight or activity
                with our airline and non-airline partners
              </span>
            </li>

            <li>
              <span class="ram-safar-list-icon" aria-hidden="true"></span>
              <span>
                <b>Redeem</b> your Miles for exclusive rewards
              </span>
            </li>

          </ul>

          <button class="ram-safar-btn">
            Join now
          </button>

        </div>

        <!-- RIGHT IMAGE -->
        <div class="ram-safar-image-container">

          <div class="ram-safar-image-wrapper">

            <img
              src="https://www.royalairmaroc.com/documents/31824/0/SF+NEW+%281%29.png/5ac63b65-bae6-d7e2-4f1f-e6210fb8ccbe?t=1770297615808"
              alt="Safar Flyer"
            />

          </div>

        </div>

      </div>

    </section>
  `;

  const imageWrapper = block.querySelector('.ram-safar-image-wrapper');

  imageWrapper.addEventListener('mouseenter', () => {
    imageWrapper.classList.add('hovered');
  });

  imageWrapper.addEventListener('mouseleave', () => {
    imageWrapper.classList.remove('hovered');
  });
}