const AEM_HOST = process.env.AEM_HOST;
const AEM_TOKEN = process.env.AEM_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const AEM_SITE_ORIGIN = process.env.AEM_SITE_ORIGIN;

const CF_BASE = `${AEM_HOST}/api/assets/edsuedemo/descriptions/product-descriptions`;

// ── 1. FETCH PRODUCT CATALOG ───────────────────────────────
async function fetchCatalog() {
const res = await fetch(`${AEM_SITE_ORIGIN}/product-catalog.json`);
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const data = await res.json();
  return data?.data || [];
}

// ── 2. READ CF VARIATION ───────────────────────────────────
async function readVariation(productId) {
  const res = await fetch(`${CF_BASE}/${productId}.json`, {
    headers: { Authorization: `Bearer ${AEM_TOKEN}` },
  });
  if (!res.ok) {
    console.warn(`  [SKIP] CF variation not found: ${productId}`);
    return null;
  }
  return res.json();
}

// ── 3. WRITE AI DESCRIPTION TO VARIATION ──────────────────
async function writeAiDescription(productId, aiDescription) {
  const res = await fetch(`${CF_BASE}/${productId}`, {
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
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`  [ERROR] Write failed for ${productId}: ${res.status} ${body}`);
  }
  return res.ok;
}

// ── 4. CALL GROQ ───────────────────────────────────────────
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

// ── 5. STRIP HTML ──────────────────────────────────────────
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').trim();
}

// ── MAIN ───────────────────────────────────────────────────
async function main() {
  console.log('=== AI Description Batch Job Started ===');
  console.log(`Catalog: ${AEM_SITE_ORIGIN}/us/en/product-catalog.json`);

  const products = await fetchCatalog();
  console.log(`Found ${products.length} products\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    // catalog columns are productId and productTitle
    const productId = product.productId;
    const productTitle = product.productTitle;

    if (!productId || !productTitle) {
      console.warn('Skipping row — missing productId or productTitle:', product);
      skipped++;
      continue;
    }

    console.log(`Processing: ${productId}`);

    const cf = await readVariation(productId);
    if (!cf) {
      failed++;
      continue;
    }

    const elements = cf?.properties?.elements || {};
    const existingAiDesc = stripHtml(elements?.aiDescription?.value || '');

    // Skip if already has AI description (don't overwrite)
    if (existingAiDesc) {
      console.log(`  Already has aiDescription — skipping`);
      skipped++;
      continue;
    }

    const defaultDesc = stripHtml(elements?.defaultDescription?.value || '') || productTitle;

    const aiDescription = await generateDescription(productTitle, defaultDesc);
    if (!aiDescription) {
      console.error(`  Groq returned nothing for: ${productId}`);
      failed++;
      continue;
    }

    const written = await writeAiDescription(productId, aiDescription);
    if (written) {
      console.log(`   Written: "${aiDescription.substring(0, 60)}..."`);
      generated++;
    } else {
      failed++;
    }
  }

  console.log('\n=== Batch Job Complete ===');
  console.log(` Generated: ${generated}`);
  console.log(` Skipped:   ${skipped}`);
  console.log(`Failed:    ${failed}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
