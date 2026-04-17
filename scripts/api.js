export async function fetchAPI(query, variables = {}, endpoint) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    return json.data;

  } catch (error) {
    console.error('fetchAPI failed:', error);
    return null;
  }
}