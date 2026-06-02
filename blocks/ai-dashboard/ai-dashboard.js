const WORKER_URL = 'https://aemstats.jayabhishikthapuredla.workers.dev/';

function renderRows() {
  const tbody = document.getElementById('dash-tbody');
  if (!tbody) return;

  const filtered = (window.__dashProducts || []).filter(p => {
    if (window.__dashFilter === 'verified') return p.verified;
    if (window.__dashFilter === 'pending') return !p.verified;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="dash-empty">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="cell-product">${p.productId}</td>
      <td class="cell-status">
        ${p.verified
          ? '<span class="badge badge-verified">Verified</span>'
          : '<span class="badge badge-pending">Pending</span>'}
      </td>
      <td class="cell-desc">
        ${p.aiDescription
          ? `<span class="desc-text">${p.aiDescription}</span>`
          : '<em class="desc-empty">Not generated yet</em>'}
      </td>
      <td class="cell-date">${p.lastModified || '—'}</td>
    </tr>
  `).join('');
}

function dashSetFilter(filter) {
  window.__dashFilter = filter;
  document.querySelectorAll('.dash-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `dash-btn-${filter}`);
  });
  renderRows();
}

export default async function decorate(block) {
  block.innerHTML = '<p class="dash-loading">Loading dashboard...</p>';

  let stats;
  try {
    const res = await fetch(WORKER_URL, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    stats = await res.json();
  } catch (e) {
    block.innerHTML = '<p class="dash-error">Failed to load dashboard. Please try again later.</p>';
    console.error('[Dashboard] Fetch error:', e);
    return;
  }

  const now = new Date().toLocaleTimeString('en-IN');

  block.innerHTML = `
    <div class="dash-wrapper">
      <div class="dash-header">
        <h2 class="dash-title">AI Descriptions Dashboard</h2>
        <span class="dash-updated">Last refreshed: ${now}</span>
      </div>

      <div class="dash-stats">
        <div class="stat-card stat-total">
          <div class="stat-number">${stats.total}</div>
          <div class="stat-label">Total Products</div>
        </div>
        <div class="stat-card stat-verified">
          <div class="stat-number">${stats.verified}</div>
          <div class="stat-label">Verified</div>
        </div>
        <div class="stat-card stat-pending">
          <div class="stat-number">${stats.pending}</div>
          <div class="stat-label">Pending Review</div>
        </div>
      </div>

      <div class="dash-filters">
        <button id="dash-btn-all" class="dash-filter-btn active">All (${stats.total})</button>
        <button id="dash-btn-verified" class="dash-filter-btn">Verified (${stats.verified})</button>
        <button id="dash-btn-pending" class="dash-filter-btn">Pending (${stats.pending})</button>
      </div>

      <table class="dash-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Status</th>
            <th>AI Description</th>
            <th>Last Modified</th>
          </tr>
        </thead>
        <tbody id="dash-tbody"></tbody>
      </table>
    </div>
  `;

  document.getElementById('dash-btn-all')
    .addEventListener('click', () => dashSetFilter('all'));
  document.getElementById('dash-btn-verified')
    .addEventListener('click', () => dashSetFilter('verified'));
  document.getElementById('dash-btn-pending')
    .addEventListener('click', () => dashSetFilter('pending'));

  window.__dashProducts = stats.products;
  window.__dashFilter = 'all';
  renderRows();
}