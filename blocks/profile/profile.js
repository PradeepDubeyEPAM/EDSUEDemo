/**
 * Decorates the profile block.
 * Expected content model (two rows):
 *   Row 1 — col 1: headshot image | col 2: name (h2), title (h3), download link
 *   Row 2 — col 1: biography paragraphs
 * @param {Element} block the profile block element
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const [headerRow, bioRow] = rows;

  // --- Header row: photo + identity ---
  const cols = [...headerRow.querySelectorAll(':scope > div')];
  const [photoCol, identityCol] = cols;

  // Photo
  const photoDiv = document.createElement('div');
  photoDiv.className = 'profile-photo';
  const photoEl = photoCol.querySelector('picture, img');
  if (photoEl) photoDiv.append(photoEl);

  // Identity: move all children (h2, h3, download link paragraph)
  const identityDiv = document.createElement('div');
  identityDiv.className = 'profile-identity';
  [...identityCol.children].forEach((el) => identityDiv.append(el));

  // Mark the download link paragraph for styling
  const downloadAnchor = identityDiv.querySelector('a[href$=".pdf"]');
  if (downloadAnchor) {
    const downloadP = downloadAnchor.closest('p');
    if (downloadP) downloadP.classList.add('profile-download');
  }

  const headerDiv = document.createElement('div');
  headerDiv.className = 'profile-header';
  headerDiv.append(photoDiv, identityDiv);

  // --- Bio row: biography paragraphs ---
  const bioDiv = document.createElement('div');
  bioDiv.className = 'profile-bio';
  if (bioRow) {
    const [bioCol] = [...bioRow.querySelectorAll(':scope > div')];
    [...bioCol.children].forEach((el) => bioDiv.append(el));
  }

  block.replaceChildren(headerDiv, bioDiv);
}
