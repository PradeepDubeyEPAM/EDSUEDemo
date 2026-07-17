import { getAccessToken } from './auth.js';

const AEM_HOST        = process.env.AEM_HOST; // https://author-p24103-e71623.adobeaemcloud.com
const GROQ_API_KEY    = process.env.GROQ_API_KEY;
const GROQ_MODEL       = 'Llama 4 Scout';
const AEM_SITE_ORIGIN = process.env.AEM_SITE_ORIGIN;
const AEM_CLIENT_ID   = process.env.AEM_CLIENT_ID;
const CF_BASE         = '/content/dam/edsuedemo/descriptions';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Shared Groq caller — retries on 429 with backoff (honors Retry-After if present)
async function callGroq(body, label, maxRetries = 4) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    }

    if (res.status === 429 && attempt < maxRetries) {
      const retryAfter = Number(res.headers.get('retry-after'));
      const waitMs = retryAfter ? retryAfter * 1000 : 1000 * 2 ** attempt; // exponential backoff fallback
      console.warn(`[RATE LIMIT] ${label} — waiting ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(waitMs);
      continue;
    }

    console.error(`[ERROR] Groq ${label} (${res.status})`);
    return null;
  }
  return null;
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'X-Api-Key': AEM_CLIENT_ID,
    'Content-Type': 'application/json',
  };
}

// GET fragment — returns the full fragment object including fields
async function getCF(productId, token) {
  const path = `${CF_BASE}/${productId}`;
  const res = await fetch(
    `${AEM_HOST}/adobe/sites/cf/fragments?path=${encodeURIComponent(path)}`,
    { headers: headers(token) }
  );
  if (!res.ok) { console.warn(`[SKIP] ${productId} (${res.status})`); return null; }
  const data = await res.json();
  return data?.items?.[0] || null;
}


async function updateCF(fragment, aiDescription, pdpDescription, token) {
  const url = `${AEM_HOST}/adobe/sites/cf/fragments/${fragment.id}`;

  const updatedFields = fragment.fields.map(f => {
    if (f.name === 'aiDescription')  return { ...f, values: [aiDescription] };
    if (f.name === 'pdpDescription') return { ...f, values: [pdpDescription] };
    if (f.name === 'verified')       return { ...f, values: [false] };
    return f;
  });

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers(token),
      'If-Match': fragment.etag,
    },
    body: JSON.stringify({
      title: fragment.title,   
      fields: updatedFields,
    }),
  });

  if (!res.ok) console.error(`[ERROR] PUT failed (${res.status}):`, await res.text());
  return res.ok;
}
async function generateDescription(productTitle) {
  return callGroq({
    model: GROQ_MODEL,
    temperature: 0.3,
    max_tokens: 80,
    messages: [
      { role: 'system', content: 'Write a short premium retail product description in 1 sentence. No markdown. Plain text only.' },
      { role: 'user',   content: `Product: ${productTitle}` },
    ],
  }, 'short');
}

// Longer variant used on the PDP page — 3-4 sentences, grounded in real catalog data
async function generateLongDescription(product) {
  const {
    productTitle,
    category,
    shortDescription,
    offer,
    targetAudience,
    useCases,
  } = product;

  const contextLines = [
    `Product: ${productTitle}`,
    category         ? `Category: ${category}` : null,
    shortDescription ? `Short description: ${shortDescription}` : null,
    offer             ? `Current offer: ${offer}` : null,
    targetAudience    ? `Target audience: ${targetAudience}` : null,
    useCases          ? `Use cases: ${useCases}` : null,
  ].filter(Boolean).join('\n');

  return callGroq({
    model: GROQ_MODEL,
    temperature: 0.3,
    max_tokens: 200,
    messages: [
      { role: 'system', content: 'Write a premium retail product description for a product detail page, 3-4 sentences. Use the provided category, short description, offer, target audience, and use cases to make the description specific and grounded — do not invent details that aren\'t implied by the input. Naturally mention who the product suits and how it would be used. No markdown, no headings, no bullet points. Plain text only.' },
      { role: 'user',   content: contextLines },
    ],
  }, 'long');
}

async function main() {
  console.log('=== Batch Job Started ===\n');

  const required = ['AEM_HOST', 'AEM_CLIENT_ID', 'AEM_CLIENT_SECRET', 'GROQ_API_KEY', 'AEM_SITE_ORIGIN'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);

  const token = await getAccessToken();
  console.log('Token ready.\n');

  const catalog = await fetch(`${AEM_SITE_ORIGIN}/catalog.json`);
  const { data: products } = await catalog.json();
  console.log(`Found ${products.length} products\n`);

  let generated = 0, skipped = 0, failed = 0;

  for (const product of products) {
    const productId    = product.productId?.trim();
    const productTitle = (product.productTitle ?? product['productTitle (AI input)'])?.trim();

    if (!productId || !productTitle) { skipped++; continue; }

    console.log(`\nProcessing: ${productId}`);

    const fragment = await getCF(productId, token);
    if (!fragment) { failed++; continue; }

    // Pull current field values
    const getVal = name => fragment.fields.find(f => f.name === name)?.values?.[0];
    const aiDescription  = getVal('aiDescription');
    const pdpDescription = getVal('pdpDescription');
    const verified       = getVal('verified');

    // Skip if already has a verified description (covers both fields)
    if (aiDescription && pdpDescription && verified === true) {
      console.log('  Already verified — skipping');
      skipped++; continue;
    }

    const generated_desc = await generateDescription(productTitle);
    if (!generated_desc) { failed++; continue; }

    const generated_pdp_desc = await generateLongDescription({
      productTitle,
      category:         product.category?.trim(),
      shortDescription: product.shortDescription?.trim(),
      offer:            product.offer?.trim(),
      targetAudience:   product.targetAudience?.trim(),
      useCases:         product.useCases?.trim(),
    });
    if (!generated_pdp_desc) { failed++; continue; }

    const ok = await updateCF(fragment, generated_desc, generated_pdp_desc, token);
    if (ok) { console.log(`  [OK] ${productId}`); generated++; }
    else    { failed++; }

    await sleep(400); // pace requests to stay under Groq's rate limit
  }

  console.log('\n=== Done ===');
  console.log(`Generated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error('[FATAL]', err.message); process.exit(1); });