const WORKER_URL = 'https://gemini-proxy.jayabhishikthapuredla.workers.dev';

export default async function decorate(block) {
  block.innerHTML = `
    <div class="dashboard-loading">
      <p>Loading AI Descriptions Dashboard...</p>
    </div>
  `;

  try {
    const res = await fetch(`${WORKER_URL}/stats`, { method: 'GET' });

    if (!res.ok) throw new Error(`Worker returned ${res.status}`);

    const stats = await res.json();

    block.innerHTML = `
      <div class="dashboard-wrapper">

        <div class="dashboard-header">
          <h2>AI Descriptions Dashboard</h2>
          <span class="dashboard-updated">Last refreshed: ${new Date().toLocaleTimeString()}</span>
        </div>

        <div class="dashboard-stats">
          <div class="stat-card stat-total">
            <div class="stat-number">${stats.total}</div>
            <div class="stat-label">Total Products</div>
          </div>
          <div class="stat-card stat-verified">
            <div class="stat-number">${stats.verified}</div>
            <div class="stat-label">Verified ✅</div>
          </div>
          <div class="stat-card stat-pending">
            <div class="stat-number">${stats.pending}</div>
            <div class="stat-label">Pending Review ⏳</div>
          </div>
        </div>

        <div class="dashboard-filters">
          <button class="filter-btn active" data-filter="all">All (${stats.total})</button>
          <button class="filter-btn" data-filter="verified">Verified (${stats.verified})</button>
          <button class="filter-btn" data-filter="pending">Pending (${stats.pending})</button>
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
          <tbody>
            ${stats.products.map((p) => `
              <tr data-status="${p.verified ? 'verified' : 'pending'}">
                <td class="product-id">${p.productId}</td>
                <td>
                  ${p.verified
                    ? '<span class="badge badge-verified">✅ Verified</span>'
                    : '<span class="badge badge-pending">⏳ Pending</span>'}
                </td>
                <td class="description-cell">
                  ${p.aiDescription
                    ? `<span class="description-text">${p.aiDescription}</span>`
                    : '<span class="no-description">Not generated yet</span>'}
                </td>
                <td class="modified-date">${p.lastModified || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

      </div>
    `;

    // filter buttons
    block.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        block.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        block.querySelectorAll('tbody tr').forEach((row) => {
          if (filter === 'all' || row.dataset.status === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });

  } catch (err) {
    block.innerHTML = `
      <div class="dashboard-error">
        <p>Failed to load dashboard. Please try again.</p>
        <small>${err.message}</small>
      </div>
    `;
  }
}