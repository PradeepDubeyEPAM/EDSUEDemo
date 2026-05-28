const CATALOG_URL = 'https://main--edsuedemo--pradeepdubeyepam.aem.live/product-catalog.json';
const AEM_HOST = 'https://author-p24103-e71623.adobeaemcloud.com';

async function getProductIds() {
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const data = await res.json();
  return data.data.map(r => r.productId);
}

async function fetchStats() {
  const productIds = await getProductIds();

  const products = await Promise.all(
    productIds.map(async (productId) => {
      const path = encodeURIComponent(`/content/dam/edsuedemo/descriptions/${productId}`);
      const res = await fetch(`${AEM_HOST}/adobe/sites/cf/fragments?path=${path}`, { credentials: 'include' });
      if (!res.ok) return { productId, verified: false, aiDescription: '', lastModified: null };

      const data = await res.json();
      const fragment = data?.items?.[0];
      if (!fragment) return { productId, verified: false, aiDescription: '', lastModified: null };

      const getVal = (name) => fragment.fields?.find(f => f.name === name)?.values?.[0];
      const rawVerified = getVal('verified');
      return {
        productId,
        verified: rawVerified === true || rawVerified === 'true',
        aiDescription: getVal('aiDescription') || '',
        lastModified: fragment.modified?.at
          ? new Date(fragment.modified.at).toLocaleDateString('en-IN')
          : null,
      };
    })
  );

  return {
    total: products.length,
    verified: products.filter(p => p.verified).length,
    pending: products.filter(p => !p.verified).length,
    products,
  };
}

function renderRows() {
  const tbody = document.getElementById('dash-tbody');
  if (!tbody) return;

  const filtered = window.__dashProducts.filter(p => {
    if (window.__dashFilter === 'verified') return p.verified;
    if (window.__dashFilter === 'pending') return !p.verified;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="padding:24px;text-align:center;color:#aaa;">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><span class="product-id">${p.productId}</span></td>
      <td>
        ${p.verified
          ? '<span class="badge badge-verified">Verified</span>'
          : '<span class="badge badge-pending">Pending</span>'}
      </td>
      <td class="description-cell">
        ${p.aiDescription
          ? `<span class="description-text">${p.aiDescription}</span>`
          : '<span class="no-description">Not generated yet</span>'}
      </td>
      <td><span class="modified-date">${p.lastModified || '—'}</span></td>
    </tr>
  `).join('');
}

window.dashSetFilter = function (filter) {
  window.__dashFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderRows();
};

export default async function decorate(block) {
  block.classList.add('ai-dashboard');
  block.innerHTML = '<p class="dashboard-loading">Loading dashboard...</p>';

  let stats;
  try {
    stats = await fetchStats();
  } catch (e) {
    block.innerHTML = '<p class="dashboard-error">Failed to load dashboard. Please try again later.</p>';
    console.error('[Dashboard]', e);
    return;
  }

  const now = new Date().toLocaleTimeString('en-IN');

  block.innerHTML = `
    <div class="dashboard-wrapper">

      <div class="dashboard-header">
        <h2>AI Descriptions Dashboard</h2>
        <span class="dashboard-updated">Last refreshed: ${now}</span>
      </div>

      <div class="dashboard-stats">
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

      <div class="dashboard-filters">
        <button class="filter-btn active" data-filter="all" onclick="dashSetFilter('all')">All (${stats.total})</button>
        <button class="filter-btn" data-filter="verified" onclick="dashSetFilter('verified')">Verified (${stats.verified})</button>
        <button class="filter-btn" data-filter="pending" onclick="dashSetFilter('pending')">Pending (${stats.pending})</button>
      </div>

      <table class="dashboard-table">
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

  window.__dashProducts = stats.products;
  window.__dashFilter = 'all';
  renderRows();
}