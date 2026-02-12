/**
 * Utility to create a table element from an array of JSON objects
 */
function createTable(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Create Headers from the keys of the first object
  const headers = Object.keys(data[0]);
  const headerRow = document.createElement('tr');
  headers.forEach((key) => {
    const th = document.createElement('th');
    th.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize
    headerRow.append(th);
  });
  thead.append(headerRow);

  // Create Rows
  data.forEach((item) => {
    const row = document.createElement('tr');
    headers.forEach((key) => {
      const td = document.createElement('td');
      // Render objects as string if necessary, otherwise plain text
      const val = item[key];
      td.textContent = typeof val === 'object' ? JSON.stringify(val) : val;
      row.append(td);
    });
    tbody.append(row);
  });

  table.append(thead, tbody);
  return table;
}

export default async function decorate(block) {
  // 1. Extract the Endpoint URL from the block's content.
  // In EDS, the author's input is typically in the first cell of the first row.
  const link = block.querySelector('a');
  const endpoint = link ? link.href : block.textContent.trim();

  // Clear the initial content (the authored URL) to prepare for the table
  block.innerHTML = '<div class="loading-spinner">Loading data...</div>';

  if (!endpoint) {
    block.innerHTML = '<div class="error-message">Error: No API URL provided.</div>';
    return;
  }

  try {
    // 2. Fetch the data
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const json = await response.json();

    // Support APIs that return { data: [...] } or just [...]
    const cleanData = Array.isArray(json) ? json : (json.data || []);

    // 3. Generate Table
    const table = createTable(cleanData);

    // 4. Update the DOM
    block.innerHTML = ''; // Clear loading spinner
    if (table) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      wrapper.append(table);
      block.append(wrapper);
    } else {
      block.innerHTML = '<div class="empty-message">No data found.</div>';
    }
  } catch (error) {
    console.error('Fetch error:', error);
    block.innerHTML = `<div class="error-message">Failed to load data: ${error.message}</div>`;
  }
}
