import { getAccessToken } from './auth.js';

const AEM_HOST        = process.env.AEM_HOST; // https://author-p24103-e71623.adobeaemcloud.com
const GROQ_API_KEY    = process.env.GROQ_API_KEY;
const AEM_SITE_ORIGIN = process.env.AEM_SITE_ORIGIN;
const AEM_CLIENT_ID   = process.env.AEM_CLIENT_ID;
const CF_BASE         = '/content/dam/edsuedemo/descriptions';

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'X-Api-Key': AEM_CLIENT_ID,
    'Content-Type': 'application/json',
  };
}

// GET fragment — returns the full fragment object including fields[]
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

// PATCH fragment — update only aiDescription + verified fields
async function updateCF(fragment, aiDescription, token) {
  const url = `${AEM_HOST}/adobe/sites/cf/fragments/${fragment.id}`;

  const updatedFields = fragment.fields.map(f => {
    if (f.name === 'aiDescription') return { ...f, values: [aiDescription] };
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
      title: fragment.title,   // ← this was missing
      fields: updatedFields,
    }),
  });

  if (!res.ok) console.error(`[ERROR] PUT failed (${res.status}):`, await res.text());
  return res.ok;
}
async function generateDescription(productTitle, hint) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 120,
      messages: [
        { role: 'system', content: 'Write a short premium retail product description in 2 sentences. No markdown. Plain text only.' },
        { role: 'user',   content: `Product: ${productTitle}\nHint: ${hint}` },
      ],
    }),
  });
  if (!res.ok) { console.error(`[ERROR] Groq (${res.status})`); return null; }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

async function main() {
  console.log('=== Batch Job Started ===\n');

  const required = ['AEM_HOST', 'AEM_CLIENT_ID', 'AEM_CLIENT_SECRET', 'GROQ_API_KEY', 'AEM_SITE_ORIGIN'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);

  const token = await getAccessToken();
  console.log('Token ready.\n');

  const catalog = await fetch(`${AEM_SITE_ORIGIN}/product-catalog.json`);
  const { data: products } = await catalog.json();
  console.log(`Found ${products.length} products\n`);

  let generated = 0, skipped = 0, failed = 0;

  for (const product of products) {
    const productId    = product.productId?.trim();
    const productTitle = product.productTitle?.trim();

    if (!productId || !productTitle) { skipped++; continue; }

    console.log(`\nProcessing: ${productId}`);

    const fragment = await getCF(productId, token);
    if (!fragment) { failed++; continue; }

    // Pull current field values
    const getVal = name => fragment.fields.find(f => f.name === name)?.values?.[0];
    const aiDescription = getVal('aiDescription');
    const verified      = getVal('verified');

    // Skip if already has a verified description
    if (aiDescription && verified === true) {
      console.log('  Already verified — skipping');
      skipped++; continue;
    }

    const hint = stripHtml(getVal('defaultDescription') || '') || productTitle;
    const generated_desc = await generateDescription(productTitle, hint);
    if (!generated_desc) { failed++; continue; }

    const ok = await updateCF(fragment, generated_desc, token);
    if (ok) { console.log(`  [OK] ${productId}`); generated++; }
    else    { failed++; }
  }

  console.log('\n=== Done ===');
  console.log(`Generated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error('[FATAL]', err.message); process.exit(1); });