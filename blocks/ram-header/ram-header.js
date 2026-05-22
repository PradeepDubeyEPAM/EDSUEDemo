export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: brand name | brand href
  const brandCells = [...(rows[0]?.children || [])];
  const brandName = brandCells[0]?.textContent?.trim() || 'Royal Air Maroc';
  const brandHref = brandCells[1]?.textContent?.trim() || '/';

  // Row 1-N: nav items — label | href
  const navItems = rows.slice(1).map((row) => {
    const cells = [...row.children];
    return {
      label: cells[0]?.textContent?.trim() || '',
      href: cells[1]?.textContent?.trim() || '#',
    };
  });

  block.innerHTML = '';

  /* ── Top utility bar ───────────────────────────────────── */
  const topBar = document.createElement('div');
  topBar.className = 'ram-header-topbar';

  const oneworldLink = document.createElement('a');
  oneworldLink.href = 'https://www.oneworld.com';
  oneworldLink.target = '_blank';
  oneworldLink.rel = 'noopener noreferrer';
  oneworldLink.className = 'ram-header-oneworld';
  oneworldLink.textContent = 'Oneworld';

  const loginLink = document.createElement('a');
  loginLink.href = '/int-en/safar-flyer/sign-in';
  loginLink.className = 'ram-header-login';
  loginLink.textContent = 'Login | Join';

  topBar.append(oneworldLink, loginLink);

  /* ── Main nav bar ──────────────────────────────────────── */
  const mainBar = document.createElement('div');
  mainBar.className = 'ram-header-main';

  const brandEl = document.createElement('a');
  brandEl.className = 'ram-header-brand';
  brandEl.href = brandHref;
  brandEl.setAttribute('aria-label', brandName);
  brandEl.innerHTML = `
    <svg class="ram-header-logo-icon" viewBox="0 0 40 40" fill="none" aria-hidden="true" width="36" height="36">
      <circle cx="20" cy="20" r="20" fill="#c8102e"/>
      <path d="M10 22 L20 10 L30 22 L25 22 L20 14 L15 22Z" fill="#fff"/>
      <rect x="13" y="22" width="14" height="4" rx="1" fill="#fff"/>
    </svg>
    <span class="ram-header-brand-name">${brandName}</span>
  `;

  const nav = document.createElement('nav');
  nav.className = 'ram-header-nav';
  nav.id = 'ram-nav';
  nav.setAttribute('aria-label', 'Main navigation');

  const ul = document.createElement('ul');
  navItems.forEach(({ label, href }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    // Mark active if hash/path matches current page section
    if (href === window.location.hash || href === window.location.pathname) {
      a.setAttribute('aria-current', 'page');
    }
    li.append(a);
    ul.append(li);
  });
  nav.append(ul);

  /* ── Hamburger (mobile) ────────────────────────────────── */
  const hamburger = document.createElement('button');
  hamburger.className = 'ram-header-hamburger';
  hamburger.setAttribute('aria-label', 'Toggle navigation menu');
  hamburger.setAttribute('aria-controls', 'ram-nav');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('type', 'button');
  hamburger.innerHTML = '<span></span><span></span><span></span>';

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('ram-nav-open', !expanded);
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  // Close menu when a nav link is clicked on mobile
  ul.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('ram-nav-open');
      document.body.style.overflow = '';
    });
  });

  mainBar.append(brandEl, nav, hamburger);
  block.append(topBar, mainBar);
}
