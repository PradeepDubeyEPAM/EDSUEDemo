import { getAccessToken } from '../auth.js';

const AEM_HOST        = process.env.AEM_HOST; // https://author-p24103-e71623.adobeaemcloud.com
const GROQ_API_KEY    = process.env.GROQ_API_KEY;
const GROQ_MODEL      = 'openai/gpt-oss-20b';
const AEM_SITE_ORIGIN = process.env.AEM_SITE_ORIGIN;
const AEM_CLIENT_ID   = process.env.AEM_CLIENT_ID;
const CF_BASE         = '/content/dam/edsuedemo/descriptions';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Retries on 429 with backoff (honors Retry-After if present). A short backoff doesn't
// help if the whole minute's quota is spent, so the fallback wait grows enough to
// actually clear a per-minute window rather than just a request-rate blip.
async function callGroq(body, label, maxRetries = 4) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res;
    try {
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error(`[ERROR] Groq ${label} — network/fetch threw: ${err.message}`);
      return null;
    }

    if (res.ok) {
      const data = await res.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    }

    if (res.status === 429 && attempt < maxRetries) {
      const retryAfter = Number(res.headers.get('retry-after'));
      const waitMs = retryAfter ? retryAfter * 1000 : Math.min(3000 * 2 ** attempt, 20000);
      console.warn(`[RATE LIMIT] ${label} — waiting ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await sleep(waitMs);
      continue;
    }

    const bodyText = await res.text().catch(() => '<unreadable body>');
    console.error(`[ERROR] Groq ${label} (${res.status}): ${bodyText}`);
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

// GET fragment — every path that returns null logs why, so a silent failure run can't happen again.
async function getCF(productId, token) {
  const path = `${CF_BASE}/${productId}`;
  let res;
  try {
    res = await fetch(
      `${AEM_HOST}/adobe/sites/cf/fragments?path=${encodeURIComponent(path)}`,
      { headers: headers(token) }
    );
  } catch (err) {
    console.error(`[ERROR] getCF ${productId} — network/fetch threw: ${err.message}`);
    return null;
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '<unreadable body>');
    console.warn(`[SKIP] ${productId} (${res.status}): ${bodyText}`);
    return null;
  }

  const data = await res.json();
  const fragment = data?.items?.[0];
  if (!fragment) {
    console.warn(`[SKIP] ${productId} — 200 OK but no fragment found at path ${path}`);
    return null;
  }
  return fragment;
}

async function updateCF(fragment, pdpDescription, token) {
  const url = `${AEM_HOST}/adobe/sites/cf/fragments/${fragment.id}`;

  const updatedFields = fragment.fields.map(f => {
    if (f.name === 'pdpDescription') return { ...f, values: [pdpDescription] };
    if (f.name === 'verified')       return { ...f, values: [false] };
    return f;
  });

  let res;
  try {
    res = await fetch(url, {
      method: 'PUT',
      headers: { ...headers(token), 'If-Match': fragment.etag },
      body: JSON.stringify({ title: fragment.title, fields: updatedFields }),
    });
  } catch (err) {
    console.error(`[ERROR] updateCF ${fragment.id} — network/fetch threw: ${err.message}`);
    return false;
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '<unreadable body>');
    console.error(`[ERROR] PUT failed for ${fragment.id} (${res.status}): ${bodyText}`);
    return false;
  }
  return true;
}

async function generateLongDescription({ productTitle, category, shortDescription, offer, targetAudience }) {
  const contextLines = [
    `Product: ${productTitle}`,
    category         ? `Category: ${category}` : null,
    shortDescription ? `Short description: ${shortDescription}` : null,
    offer            ? `Current offer: ${offer}` : null,
    targetAudience   ? `Target audience: ${targetAudience}` : null,
  ].filter(Boolean).join('\n');

  return callGroq({
    model: GROQ_MODEL,
    temperature: 0.3,
    max_tokens: 150,
    messages: [
      { role: 'system', content: 'Write a premium retail product description for a product detail page, 3-4 sentences. Use the provided category, short description, offer, and target audience to make the description specific and grounded — do not invent details that aren\'t implied by the input. No markdown, no headings, no bullet points. Plain text only.' },
      { role: 'user',   content: contextLines },
    ],
  }, 'long');
}

async function main() {
  console.log('=== PDP Description Batch Job Started ===\n');

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

    const getVal = name => fragment.fields.find(f => f.name === name)?.values?.[0];
    const pdpDescription = getVal('pdpDescription');
    const verified       = getVal('verified');

    if (pdpDescription && verified === true) {
      console.log('  Already verified — skipping');
      skipped++; continue;
    }

    const generated_pdp_desc = await generateLongDescription({
      productTitle,
      category:         product.category?.trim(),
      shortDescription: product.shortDescription?.trim(),
      offer:            product.offer?.trim(),
      targetAudience:   product.targetAudience?.trim(),
    });
    if (!generated_pdp_desc) { failed++; continue; }

    const ok = await updateCF(fragment, generated_pdp_desc, token);
    if (ok) { console.log(`  [OK] ${productId}`); generated++; }
    else    { failed++; }

    await sleep(1200); // pace to stay under Groq's per-minute quota
  }

  console.log('\n=== Done ===');
  console.log(`Generated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error('[FATAL]', err.message); process.exit(1); });