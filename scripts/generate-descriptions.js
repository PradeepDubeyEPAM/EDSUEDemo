import { getAEMAccessToken } from './auth.js';

// ── ENV VARS ────────────────────────────────────────────────
const AEM_HOST = process.env.AEM_HOST;
const AEM_SITE_ORIGIN = process.env.AEM_SITE_ORIGIN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

let AEM_TOKEN; // set in main() after auth exchange

// ── FETCH PRODUCT CATALOG ───────────────────────────────────
async function fetchCatalog() {
  const res = await fetch(`${AEM_SITE_ORIGIN}/product-catalog.json`);
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const data = await res.json();
  return data?.data || [];
}

// ── READ INDIVIDUAL CF ──────────────────────────────────────
async function readCF(productId) {
  const res = await fetch(
    `${AEM_HOST}/api/assets/edsuedemo/descriptions/${productId}.json`,
    { headers: { Authorization: `Bearer ${AEM_TOKEN}` } }
  );
  if (!res.ok) {
    console.warn(`  [SKIP] CF not found: ${productId}`);
    return null;
  }
  return res.json();
}

// ── EXTRACT FIELDS ──────────────────────────────────────────
function getCFData(cf) {
  const elements = cf?.properties?.elements ?? {};
  return {
    defaultDescription: stripHtml(elements?.defaultDescription?.value || ''),
    aiDescription: stripHtml(elements?.aiDescription?.value || ''),
    verified: elements?.verified?.value === true,
  };
}

// ── WRITE AI DESCRIPTION TO CF ──────────────────────────────
async function writeAiDescription(productId, aiDescription) {
  const res = await fetch(
    `${AEM_HOST}/api/assets/edsuedemo/descriptions/${productId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${AEM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        class: 'asset',
        properties: {
          elements: {
            aiDescription: { value: aiDescription },
            verified: { value: false },
          },
        },
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    console.error(`  [ERROR] Write failed for ${productId}: ${res.status} ${body}`);
  }
  return res.ok;
}

// ── CALL GROQ ───────────────────────────────────────────────
async function generateDescription(productTitle, defaultDescription) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content: 'Write a short premium retail product description in 2 sentences. No markdown. Plain text only.',
        },
        {
          role: 'user',
          content: `Product: ${productTitle}\nHint: ${defaultDescription}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error(`  [ERROR] Groq failed: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

// ── HELPERS ─────────────────────────────────────────────────
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ── MAIN ────────────────────────────────────────────────────
async function main() {
  AEM_TOKEN = await getAEMAccessToken(); // sets module-level token
  console.log('=== AI Description Batch Job Started ===');

  const products = await fetchCatalog();
  console.log(`Found ${products.length} products\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    const productId = product.productId;
    const productTitle = product.productTitle;

    if (!productId || !productTitle) {
      console.warn('Skipping row — missing productId or productTitle:', product);
      skipped++;
      continue;
    }

    console.log(`Processing: ${productId}`);

    const cf = await readCF(productId);
    if (!cf) { failed++; continue; }

    const data = getCFData(cf);

    // Skip only if aiDescription exists AND verified = true
    if (data.aiDescription && data.verified) {
      console.log(`  Already verified — skipping`);
      skipped++;
      continue;
    }

    const hint = data.defaultDescription || productTitle;
    console.log(`  Generating for: "${productTitle}" | hint: "${hint.substring(0, 50)}..."`);

    const aiDescription = await generateDescription(productTitle, hint);
    if (!aiDescription) {
      console.error(`  Groq returned nothing for: ${productId}`);
      failed++;
      continue;
    }

    const written = await writeAiDescription(productId, aiDescription);
    if (written) {
      console.log(` Written: "${aiDescription.substring(0, 60)}..."`);
      generated++;
    } else {
      failed++;
    }
  }

  console.log('\n=== Batch Job Complete ===');
  console.log(`Generated: ${generated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(` Failed:    ${failed}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});