const AEM_HOST = process.env.AEM_HOST;
const AEM_TOKEN = process.env.AEM_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const AEM_SITE_ORIGIN = process.env.AEM_SITE_ORIGIN;

const CF_URL = `${AEM_HOST}/api/assets/edsuedemo/descriptions/product-descriptions`;

// ── 1. FETCH PRODUCT CATALOG ───────────────────────────────
async function fetchCatalog() {
  const res = await fetch(`${AEM_SITE_ORIGIN}/product-catalog.json`);
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const data = await res.json();
  return data?.data || [];
}

// ── 2. READ ENTIRE MASTER CF ONCE ─────────────────────────
async function readMasterCF() {
  const res = await fetch(`${CF_URL}.json`, {
    headers: { Authorization: `Bearer ${AEM_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`Master CF read failed: ${res.status}`);
  }
  return res.json();
}

// ── 3. EXTRACT VARIATION DATA FROM CF RESPONSE ────────────
// Structure: cf.properties.elements.{fieldName}.variations.{variationName}.value
function getVariationData(cf, variationName) {
  const elements = cf?.properties?.elements;
  if (!elements) return null;

  const defaultDescription = stripHtml(
    elements?.defaultDescription?.variations?.[variationName]?.value || ''
  );
  const aiDescription = stripHtml(
    elements?.aiDescription?.variations?.[variationName]?.value || ''
  );
  const verified =
    elements?.verified?.variations?.[variationName]?.value === true ||
    elements?.verified?.variations?.[variationName]?.value === 'true';

  return { defaultDescription, aiDescription, verified };
}

// ── 4. WRITE AI DESCRIPTION TO VARIATION ──────────────────
async function writeAiDescription(variationName, aiDescription) {
  const res = await fetch(`${CF_URL}/${variationName}`, {
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
    console.error(`  [ERROR] Write failed for ${variationName}: ${res.status} ${body}`);
  }
  return res.ok;
}

// ── 5. CALL GROQ ───────────────────────────────────────────
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
          content:
            'Write a short premium retail product description in 2 sentences. No markdown. Plain text only.',
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

// ── 6. STRIP HTML ──────────────────────────────────────────
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ── 7. MAP catalog productId → CF variation name ──────────
// Some catalog IDs differ from CF variation names
function getCFVariationName(productId) {
  const map = {
    'get-complimentary-beverages': 'complimentary-beverages',
    't-shirt-women': 't-shirt',
  };
  return map[productId] || productId;
}

// ── MAIN ───────────────────────────────────────────────────
async function main() {
  console.log('=== AI Description Batch Job Started ===');

  const products = await fetchCatalog();
  console.log(`Found ${products.length} products`);

  // Read master CF once — avoid hammering AEM with 23 separate calls
  console.log('Reading master CF...');
  const masterCF = await readMasterCF();
  console.log('Master CF loaded.\n');

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

    const variationName = productId;
    console.log(`Processing: ${productId} → variation: ${variationName}`);

    const data = getVariationData(masterCF, variationName);

    if (!data) {
      console.warn(`  [SKIP] Variation not found in CF: ${variationName}`);
      failed++;
      continue;
    }

    // Skip if already has AI description
    if (data.aiDescription) {
      console.log(`  Already has aiDescription — skipping`);
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

    const written = await writeAiDescription(variationName, aiDescription);
    if (written) {
      console.log(`  Written: "${aiDescription.substring(0, 60)}..."`);
      generated++;
    } else {
      failed++;
    }
  }

  console.log('\n=== Batch Job Complete ===');
  console.log(` Generated: ${generated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(` Failed:    ${failed}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});