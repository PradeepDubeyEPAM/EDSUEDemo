export default function decorate(block) {
  const rows = [...block.children];
  const cells0 = [...(rows[0]?.children || [])];
  const heading = cells0[0]?.textContent?.trim() || 'Travel Smarter with Our App';
  const description = cells0[1]?.textContent?.trim()
    || 'Book flights, manage bookings, and get real-time updates — all from your pocket.';

  const cells1 = [...(rows[1]?.children || [])];
  const appStoreHref = cells1[0]?.textContent?.trim() || '#';
  const googlePlayHref = cells1[1]?.textContent?.trim() || '#';
  const imgSrc = cells1[2]?.textContent?.trim() || '';

  block.innerHTML = '';

  const inner = document.createElement('div');
  inner.className = 'app-download-inner';

  const textCol = document.createElement('div');
  textCol.className = 'app-download-text';

  const h2 = document.createElement('h2');
  h2.textContent = heading;

  const p = document.createElement('p');
  p.textContent = description;

  const storeLinks = document.createElement('div');
  storeLinks.className = 'app-download-stores';

  const appStoreBtn = document.createElement('a');
  appStoreBtn.href = appStoreHref;
  appStoreBtn.className = 'app-download-store-btn';
  appStoreBtn.setAttribute('aria-label', 'Download on the App Store');
  appStoreBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
    <span><small>Download on the</small><strong>App Store</strong></span>
  `;

  const googlePlayBtn = document.createElement('a');
  googlePlayBtn.href = googlePlayHref;
  googlePlayBtn.className = 'app-download-store-btn';
  googlePlayBtn.setAttribute('aria-label', 'Get it on Google Play');
  googlePlayBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.18 23.76c.35.2.76.21 1.15.02l12.09-6.86-2.71-2.72-10.53 9.56zm14.42-8.17L5.33 22.2l-1.97-1.14L14.9 12l2.7 3.59zM20.4 10.6l-2.37-1.35-3.05 3.05 3.05 3.04 2.39-1.35c.68-.39.68-1.02-.02-3.39zM3.18.24L15.63 7.1l-2.71 2.72L2.33 1.38c-.35-.2-.76-.21-1.15-.02-.4.23-.68.66-.68 1.12v19c0 .46.28.89.68 1.12l.01.01 12.54-12.53z"/>
    </svg>
    <span><small>Get it on</small><strong>Google Play</strong></span>
  `;

  storeLinks.append(appStoreBtn, googlePlayBtn);
  textCol.append(h2, p, storeLinks);

  const imgCol = document.createElement('div');
  imgCol.className = 'app-download-image';
  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = 'Mobile app preview';
    img.loading = 'lazy';
    imgCol.append(img);
  }

  inner.append(textCol, imgCol);
  block.append(inner);
}
