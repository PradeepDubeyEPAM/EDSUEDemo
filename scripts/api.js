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

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
      console.error(json.errors);
      throw new Error('GraphQL errors occurred');
    }

    return json;

  } catch (error) {
    console.error('fetchAPI failed:', error);
    return null;
  }
}