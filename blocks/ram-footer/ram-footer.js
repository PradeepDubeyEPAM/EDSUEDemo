export default function decorate(block) {
  const rows = [...block.children];

  block.innerHTML = '';

  const inner = document.createElement('div');
  inner.className = 'ram-footer-inner';

  const linkColumns = [];
  let socialRow = null;
  let legalRow = null;
  let copyrightText = '© 2026 Royal Air Maroc. All rights reserved.';

  rows.forEach((row) => {
    const cells = [...row.children];
    const firstCell = cells[0]?.textContent?.trim() || '';

    if (firstCell.toLowerCase() === 'social') {
      socialRow = cells.slice(1).map((c) => c.textContent.trim()).filter(Boolean);
    } else if (firstCell.toLowerCase() === 'legal') {
      legalRow = cells.slice(1).map((c) => {
        const [label, href] = c.textContent.trim().split('|');
        return { label: label?.trim(), href: href?.trim() || '#' };
      });
    } else if (firstCell.toLowerCase() === 'copyright') {
      copyrightText = cells[1]?.textContent?.trim() || copyrightText;
    } else {
      // Footer link column: first cell = heading, remaining = "Label|URL"
      const heading = firstCell;
      const links = cells.slice(1).map((c) => {
        const [label, href] = c.textContent.trim().split('|');
        return { label: label?.trim(), href: href?.trim() || '#' };
      }).filter((l) => l.label);
      if (heading) linkColumns.push({ heading, links });
    }
  });

  /* ── Top: link columns ──────────────────────────────────── */
  if (linkColumns.length) {
    const colsWrap = document.createElement('div');
    colsWrap.className = 'ram-footer-cols';

    linkColumns.forEach(({ heading, links }) => {
      const col = document.createElement('div');
      col.className = 'ram-footer-col';

      const h3 = document.createElement('h3');
      h3.textContent = heading;
      col.append(h3);

      const ul = document.createElement('ul');
      links.forEach(({ label, href }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        li.append(a);
        ul.append(li);
      });
      col.append(ul);
      colsWrap.append(col);
    });

    inner.append(colsWrap);
  }

  /* ── Middle: social icons ───────────────────────────────── */
  const SOCIAL_ICONS = {
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1a1a2e"/></svg>`,
  };

  function detectPlatform(url) {
    if (url.includes('facebook')) return 'facebook';
    if (url.includes('twitter') || url.includes('x.com')) return 'twitter';
    if (url.includes('instagram')) return 'instagram';
    if (url.includes('youtube')) return 'youtube';
    return null;
  }

  if (socialRow && socialRow.length) {
    const socialWrap = document.createElement('div');
    socialWrap.className = 'ram-footer-social';

    const label = document.createElement('span');
    label.textContent = 'Follow us on';
    socialWrap.append(label);

    socialRow.forEach((url) => {
      const platform = detectPlatform(url);
      if (!platform) return;
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', platform.charAt(0).toUpperCase() + platform.slice(1));
      a.innerHTML = SOCIAL_ICONS[platform];
      socialWrap.append(a);
    });

    inner.append(socialWrap);
  }

  /* ── Bottom: legal + copyright ──────────────────────────── */
  const bottomBar = document.createElement('div');
  bottomBar.className = 'ram-footer-bottom';

  if (legalRow && legalRow.length) {
    const legalNav = document.createElement('nav');
    legalNav.className = 'ram-footer-legal';
    legalNav.setAttribute('aria-label', 'Legal links');
    legalRow.forEach(({ label, href }) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      legalNav.append(a);
    });
    bottomBar.append(legalNav);
  }

  const copy = document.createElement('p');
  copy.className = 'ram-footer-copyright';
  copy.textContent = copyrightText;
  bottomBar.append(copy);

  inner.append(bottomBar);
  block.append(inner);
}
