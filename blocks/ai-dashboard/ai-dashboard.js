const WORKER_URL = 'https://gemini-proxy.jayabhishikthapuredla.workers.dev/stats';

export default async function decorate(block) {
  block.innerHTML = '<p>Loading dashboard...</p>';

  let stats;
  try {
    const res = await fetch(WORKER_URL, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    stats = await res.json();
  } catch (e) {
    block.innerHTML = '<p style="color:red;">Failed to load dashboard. Please try again later.</p>';
    console.error('[Dashboard] Fetch error:', e);
    return;
  }

  const now = new Date().toLocaleTimeString('en-IN');

  block.innerHTML = `
    <div style="font-family:sans-serif;padding:2rem;max-width:900px;margin:0 auto;">

      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:2rem;">
        <h2 style="color:#0D3B8C;margin:0;">AI Descriptions Dashboard</h2>
        <span style="font-size:12px;color:#aaa;">Last refreshed: ${now}</span>
      </div>

      <!-- Stat cards -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;">
        <div style="background:#f0f4ff;border-radius:12px;padding:1.5rem;text-align:center;">
          <div style="font-size:2.5rem;font-weight:700;color:#0D3B8C;">${stats.total}</div>
          <div style="font-size:14px;color:#555;margin-top:4px;">Total Products</div>
        </div>
        <div style="background:#f0fff4;border-radius:12px;padding:1.5rem;text-align:center;">
          <div style="font-size:2.5rem;font-weight:700;color:#1a7f4b;">${stats.verified}</div>
          <div style="font-size:14px;color:#555;margin-top:4px;">Verified </div>
        </div>
        <div style="background:#fff8f0;border-radius:12px;padding:1.5rem;text-align:center;">
          <div style="font-size:2.5rem;font-weight:700;color:#e07b00;">${stats.pending}</div>
          <div style="font-size:14px;color:#555;margin-top:4px;">Pending Review </div>
        </div>
      </div>

      <!-- Filter buttons -->
      <div style="display:flex;gap:8px;margin-bottom:1rem;">
        <button
          id="dash-btn-all"
          onclick="dashSetFilter('all')"
          style="padding:6px 16px;border-radius:20px;border:1.5px solid #0D3B8C;background:#0D3B8C;color:white;font-size:13px;cursor:pointer;font-weight:600;">
          All (${stats.total})
        </button>
        <button
          id="dash-btn-verified"
          onclick="dashSetFilter('verified')"
          style="padding:6px 16px;border-radius:20px;border:1.5px solid #ccc;background:white;color:#555;font-size:13px;cursor:pointer;">
           Verified (${stats.verified})
        </button>
        <button
          id="dash-btn-pending"
          onclick="dashSetFilter('pending')"
          style="padding:6px 16px;border-radius:20px;border:1.5px solid #ccc;background:white;color:#555;font-size:13px;cursor:pointer;">
           Pending (${stats.pending})
        </button>
      </div>

      <!-- Table -->
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#0D3B8C;color:white;">
            <th style="padding:10px 12px;text-align:left;border-radius:8px 0 0 0;">Product ID</th>
            <th style="padding:10px 12px;text-align:left;">Status</th>
            <th style="padding:10px 12px;text-align:left;">AI Description</th>
            <th style="padding:10px 12px;text-align:left;border-radius:0 8px 0 0;">Last Modified</th>
          </tr>
        </thead>
        <tbody id="dash-tbody"></tbody>
      </table>

    </div>
  `;

  // Store products on window so the inline onclick handler can reach them
  window.__dashProducts = stats.products;
  window.__dashFilter = 'all';

  window.dashSetFilter = function (filter) {
    window.__dashFilter = filter;

    // Update button styles
    const buttons = {
      all:      document.getElementById('dash-btn-all'),
      verified: document.getElementById('dash-btn-verified'),
      pending:  document.getElementById('dash-btn-pending'),
    };
    Object.entries(buttons).forEach(([key, btn]) => {
      if (!btn) return;
      const active = key === filter;
      btn.style.background = active ? '#0D3B8C' : 'white';
      btn.style.color = active ? 'white' : '#555';
      btn.style.borderColor = active ? '#0D3B8C' : '#ccc';
      btn.style.fontWeight = active ? '600' : '400';
    });

    renderRows();
  };

  function renderRows() {
    const tbody = document.getElementById('dash-tbody');
    if (!tbody) return;

    const filtered = window.__dashProducts.filter(p => {
      if (window.__dashFilter === 'verified') return p.verified;
      if (window.__dashFilter === 'pending')  return !p.verified;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="padding:24px;text-align:center;color:#aaa;">
            No products found.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((p, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9f9f9' : 'white'};">
        <td style="padding:10px 12px;font-weight:500;">${p.productId}</td>
        <td style="padding:10px 12px;">
          ${p.verified
            ? '<span style="color:#1a7f4b;font-weight:600;"> Verified</span>'
            : '<span style="color:#e07b00;font-weight:600;"> Pending</span>'}
        </td>
        <td style="padding:10px 12px;color:#555;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${p.aiDescription || '<em style="color:#aaa;">Not generated yet</em>'}
        </td>
        <td style="padding:10px 12px;color:#888;">${p.lastModified || '—'}</td>
      </tr>
    `).join('');
  }

  renderRows();
}