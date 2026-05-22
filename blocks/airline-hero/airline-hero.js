export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: background image URL
  const bgUrl = rows[0]?.firstElementChild?.textContent?.trim();
  // Row 1: heading
  const headingEl = rows[1]?.firstElementChild;
  // Row 2: subheading
  const subEl = rows[2]?.firstElementChild;
  // Row 3: CTA link
  const ctaEl = rows[3]?.firstElementChild?.querySelector('a');

  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'airline-hero-wrapper';

  const bg = document.createElement('div');
  bg.className = 'airline-hero-bg';
  if (bgUrl) bg.style.backgroundImage = `url('${bgUrl}')`;

  const overlay = document.createElement('div');
  overlay.className = 'airline-hero-overlay';

  const content = document.createElement('div');
  content.className = 'airline-hero-content';

  if (headingEl) {
    const h1 = document.createElement('h1');
    h1.textContent = headingEl.textContent.trim();
    content.append(h1);
  }

  if (subEl) {
    const p = document.createElement('p');
    p.textContent = subEl.textContent.trim();
    content.append(p);
  }

  if (ctaEl) {
    const btn = document.createElement('a');
    btn.className = 'airline-hero-cta';
    btn.href = ctaEl.href || '#';
    btn.textContent = ctaEl.textContent.trim();
    content.append(btn);
  }

  overlay.append(content);
  wrapper.append(bg, overlay);
  block.append(wrapper);
}
