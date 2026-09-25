import { getConfig } from './api-mesh-config.js';

export async function fetchAPI(query, variables = {}, endpoint) {
  try {
    const config = await getConfig();
    const endpoint = config.apiMeshEndpoint;

      if (!endpoint) {
        throw new Error('apiMeshEndpoint not configured');
      }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'AvjS1j8evWc1UwUZGG88hrvcxbUU0k7mM8xddvIN360='
      },
      body: JSON.stringify({ query, variables }),
    });

    // Parse the body first: a mesh can return a non-200 status and still include usable data
    let json;
    try {
      json = await response.json();
    } catch (e) {
      throw new Error(`API error: ${response.status}`);
    }

    // Only fail when there is no data at all
    if (!json || !json.data) {
      throw new Error(json?.errors?.[0]?.message || `API error: ${response.status}`);
    }

    // Partial result (e.g. a Petstore pet with a null name): log it and keep the data
    if (json.errors?.length) {
      console.warn('API Mesh partial errors:', json.errors);
    }

    return json;

  } catch (error) {
    console.error('fetchAPI failed:', error);
    return null;
  }
}