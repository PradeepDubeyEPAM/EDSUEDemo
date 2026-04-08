import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Parse fields from a UE page-based authored block.
 * AEM renders each field as a single-child row; the cell is identified by
 * data-aue-prop (text / aem-content / reference fields) or
 * data-richtext-prop (richtext fields).
 * @param {Element} block
 * @returns {Object} map of prop name → cell Element
 */
function parseFields(block) {
  const fields = {};
  const rows = [...block.children];
  const modelOrder = ['headingText', 'bodyText', 'ctaLabel', 'ctaUrl', 'imageSrc'];

  rows.forEach((row, index) => {
    // UE/authoring markup: prop attributes can appear anywhere inside the row.
    const attributedCell = row.querySelector('[data-aue-prop], [data-richtext-prop]');
    if (attributedCell) {
      const prop = attributedCell.getAttribute('data-aue-prop')
        || attributedCell.getAttribute('data-richtext-prop');
      if (prop) fields[prop] = attributedCell;
      return;
    }

    // Legacy key/value authored tables.
    const [keyCell, valueCell] = [...row.children];
    const key = keyCell?.textContent?.trim();
    if (key && valueCell && modelOrder.includes(key)) {
      fields[key] = valueCell;
      return;
    }

    // CDN publish fallback: row order follows model field order.
    const fallbackProp = modelOrder[index];
    const fallbackCell = row.firstElementChild || row;
    if (fallbackProp && fallbackCell && !fields[fallbackProp]) {
      fields[fallbackProp] = fallbackCell;
    }
  });
  return fields;
}

/**
 * Decorates the Hero Section block.
 *
 * Authored fields (from _hero-section.json model):
 *   headingText – plain text  → <h1>
 *   bodyText    – richtext    → <div> (inner HTML preserved)
 *   ctaLabel    – plain text  → CTA button label
 *   ctaUrl      – aem-content → renders as <a href="…"> in the block
 *   imageSrc    – reference   → renders as <picture> / <img> in the block
 *
 * DOM output (mirrors the Figma spec layout):
 *   .hero-section
 *   ├── .hero-section__decor          (decorative wave, aria-hidden)
 *   ├── .hero-section__content        (left column: text + CTA)
 *   │   ├── .hero-section__text-block
 *   │   │   ├── h1.hero-section__heading
 *   │   │   └── div.hero-section__body
 *   │   └── a.hero-section__cta
 *   │       ├── span (label)
 *   │       └── span.hero-section__cta-icon (arrow, aria-hidden)
 *   └── .hero-section__media          (right column: image)
 *       └── picture / img
 *
 * @param {Element} block The hero-section block element
 */
export default function decorate(block) {
  const fields = parseFields(block);

  // Clear authored rows – we rebuild the DOM from parsed field values
  block.innerHTML = '';

  // ── Decorative element ─────────────────────────────────────────────────
  const decor = document.createElement('div');
  decor.className = 'hero-section__decor';
  decor.setAttribute('aria-hidden', 'true');

  // ── Left: content column ───────────────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'hero-section__content';

  // Text block (heading + body stacked with 24 px gap)
  const textBlock = document.createElement('div');
  textBlock.className = 'hero-section__text-block';

  // Heading
  const heading = document.createElement('h1');
  heading.className = 'hero-section__heading';
  if (fields.headingText) {
    heading.textContent = fields.headingText.textContent.trim();
    moveInstrumentation(fields.headingText, heading);
  }
  textBlock.append(heading);

  // Body (richtext – preserve HTML)
  const body = document.createElement('div');
  body.className = 'hero-section__body';
  if (fields.bodyText) {
    body.innerHTML = fields.bodyText.innerHTML;
    moveInstrumentation(fields.bodyText, body);
  }
  textBlock.append(body);
  content.append(textBlock);

  // CTA button (aem-content renders as <a href="…"> inside valEl)
  const ctaHref = fields.ctaUrl?.querySelector('a')?.href
    || fields.ctaUrl?.textContent?.trim()
    || '#';
  const ctaText = fields.ctaLabel?.textContent.trim() || '';

  const cta = document.createElement('a');
  cta.className = 'hero-section__cta';
  cta.href = ctaHref;

  const ctaLabelSpan = document.createElement('span');
  ctaLabelSpan.textContent = ctaText;

  const ctaIcon = document.createElement('span');
  ctaIcon.className = 'hero-section__cta-icon';
  ctaIcon.setAttribute('aria-hidden', 'true');

  cta.append(ctaLabelSpan, ctaIcon);
  if (fields.ctaUrl) moveInstrumentation(fields.ctaUrl, cta);
  content.append(cta);

  // ── Right: media column ────────────────────────────────────────────────
  const media = document.createElement('div');
  media.className = 'hero-section__media';

  if (fields.imageSrc) {
    const picture = fields.imageSrc.querySelector('picture');
    const existingImg = fields.imageSrc.querySelector('img');
    const linkedImageUrl = fields.imageSrc.querySelector('a')?.href
      || fields.imageSrc.textContent.trim();

    if (picture) {
      // Already an optimized picture element from AEM
      const img = picture.querySelector('img');
      if (img) img.className = 'hero-section__image';
      moveInstrumentation(fields.imageSrc, picture);
      media.append(picture);
    } else if (existingImg) {
      // Plain img – wrap in an optimized picture (824 px wide)
      const optimized = createOptimizedPicture(
        existingImg.src,
        existingImg.alt || '',
        false,
        [{ width: '824' }],
      );
      const optimizedImg = optimized.querySelector('img');
      if (optimizedImg) optimizedImg.className = 'hero-section__image';
      moveInstrumentation(fields.imageSrc, optimized);
      media.append(optimized);
    } else if (linkedImageUrl) {
      // CDN publish may render reference fields as plain link text.
      const optimized = createOptimizedPicture(
        linkedImageUrl,
        fields.headingText?.textContent?.trim() || '',
        false,
        [{ width: '824' }],
      );
      const optimizedImg = optimized.querySelector('img');
      if (optimizedImg) optimizedImg.className = 'hero-section__image';
      moveInstrumentation(fields.imageSrc, optimized);
      media.append(optimized);
    }
  }

  block.append(decor, content, media);
}
