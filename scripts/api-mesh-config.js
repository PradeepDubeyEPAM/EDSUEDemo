let configCache;

export async function getConfig() {
  if (configCache) return configCache;

  try {
    const resp = await fetch('/api-mesh-config.json');

    if (!resp.ok) {
      throw new Error(`Config fetch failed: ${resp.status}`);
    }

    const json = await resp.json();

    const config = {};

    //  Handle your actual structure
    if (Array.isArray(json.data)) {
      json.data.forEach((item) => {
        if (item.Property) {
          config[item.Property.trim()] = item.Value?.trim();
        }
      });
    }

    configCache = config;
    return config;

  } catch (e) {
    console.error('Config load failed:', e);
    return {};
  }
}