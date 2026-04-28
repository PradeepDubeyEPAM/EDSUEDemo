export function setCache(key, value, ttlMs) {
  if (value === undefined || value === null) return; // prevent bad writes

  const data = {
    value,
    expiry: Date.now() + ttlMs
  };

  localStorage.setItem(key, JSON.stringify(data));
}

export function getCache(key) {
  const raw = localStorage.getItem(key);

  if (!raw || raw === 'null' || raw === 'undefined') {
    return null;
  }

  try {
    const data = JSON.parse(raw);

    // Ensure structure is correct
    if (!data || typeof data !== 'object') {
      localStorage.removeItem(key);
      return null;
    }

    // Expiry check
    if (!data.expiry || Date.now() > data.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return data.value ?? null;

  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}