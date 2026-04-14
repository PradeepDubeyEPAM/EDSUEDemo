// This file was written by Claude Code.
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
  const modelOrder = ['headingText', 'bodyText', 'ctaLabel', 'ctaUrl', 'mediaSrc'];

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
 * Decorates the Feature Section block.
 *
 * Authored fields (from _feature-section.json model):
 *   headingText – plain text  → <h2>
 *   bodyText    – richtext    → <div> (inner HTML preserved)
 *   ctaLabel    – plain text  → CTA button label
 *   ctaUrl      – aem-content → renders as <a href="…"> in the block
 *   mediaSrc    – reference   → renders as <picture> / <img> in the block
 *
 * Variants (activated via the "Layout" classes field in Universal Editor,
 *   or by appending the class name in document-based authoring):
 *   (default)   – text left / image right, filled CTA, topographic decor
 *   image-left  – image left / text right, outlined CTA, no decor
 *
 * DOM output:
 *   .feature-section[.image-left]
 *   ├── .feature-section__decor          (default only, aria-hidden)
 *   ├── .feature-section__content        (text column)
 *   │   ├── .feature-section__text-block
 *   │   │   ├── h2.feature-section__heading
 *   │   │   └── div.feature-section__body
 *   │   └── a.feature-section__cta[.feature-section__cta--secondary]
 *   │       ├── span (label)
 *   │       └── span.feature-section__cta-icon (aria-hidden)
 *   └── .feature-section__media          (image column)
 *       └── picture / img
 *
 * @param {Element} block The feature-section block element
 */
export default function decorate(block) {
  const isImageLeft = block.classList.contains('image-left');
  const fields = parseFields(block);

  // Clear authored rows – rebuild DOM from parsed field values
  block.innerHTML = '';

  // ── Decorative topographic pattern (default variant only) ───────────────
  if (!isImageLeft) {
    const decor = document.createElement('div');
    decor.className = 'feature-section__decor';
    decor.setAttribute('aria-hidden', 'true');
    block.append(decor);
  }

  // ── Text column ─────────────────────────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'feature-section__content';

  const textBlock = document.createElement('div');
  textBlock.className = 'feature-section__text-block';

  // Heading (h2 — semantic hierarchy below page h1)
  const heading = document.createElement('h2');
  heading.className = 'feature-section__heading';
  if (fields.headingText) {
    heading.textContent = fields.headingText.textContent.trim();
    moveInstrumentation(fields.headingText, heading);
  }
  textBlock.append(heading);

  // Body (richtext – preserve HTML)
  const body = document.createElement('div');
  body.className = 'feature-section__body';
  if (fields.bodyText) {
    body.innerHTML = fields.bodyText.innerHTML;
    moveInstrumentation(fields.bodyText, body);
  }
  textBlock.append(body);
  content.append(textBlock);

  // CTA button – primary (filled) for default, secondary (outlined) for image-left
  const ctaHref = fields.ctaUrl?.querySelector('a')?.href
    || fields.ctaUrl?.textContent?.trim()
    || '#';
  const ctaText = fields.ctaLabel?.textContent.trim() || '';

  const cta = document.createElement('a');
  cta.className = isImageLeft
    ? 'feature-section__cta feature-section__cta--secondary'
    : 'feature-section__cta';
  cta.href = ctaHref;

  const ctaLabelSpan = document.createElement('span');
  ctaLabelSpan.textContent = ctaText;

  const ctaIcon = document.createElement('span');
  ctaIcon.className = 'feature-section__cta-icon';
  ctaIcon.setAttribute('aria-hidden', 'true');

  cta.append(ctaLabelSpan, ctaIcon);
  if (fields.ctaUrl) moveInstrumentation(fields.ctaUrl, cta);
  content.append(cta);

  // ── Media column ────────────────────────────────────────────────────────
  const media = document.createElement('div');
  media.className = 'feature-section__media';

  if (fields.mediaSrc) {
    const picture = fields.mediaSrc.querySelector('picture');
    const existingImg = fields.mediaSrc.querySelector('img');
    const linkedImageUrl = fields.mediaSrc.querySelector('a')?.href
      || fields.mediaSrc.textContent.trim();

    if (picture) {
      // Already an optimized picture element from AEM
      const img = picture.querySelector('img');
      if (img) img.className = 'feature-section__image';
      moveInstrumentation(fields.mediaSrc, picture);
      media.append(picture);
    } else if (existingImg) {
      // Plain img – wrap in an optimized picture (540px wide)
      const optimized = createOptimizedPicture(
        existingImg.src,
        existingImg.alt || '',
        false,
        [{ width: '540' }],
      );
      const optimizedImg = optimized.querySelector('img');
      if (optimizedImg) optimizedImg.className = 'feature-section__image';
      moveInstrumentation(fields.mediaSrc, optimized);
      media.append(optimized);
    } else if (linkedImageUrl) {
      // CDN publish may render reference fields as plain link text
      const optimized = createOptimizedPicture(
        linkedImageUrl,
        fields.headingText?.textContent?.trim() || '',
        false,
        [{ width: '540' }],
      );
      const optimizedImg = optimized.querySelector('img');
      if (optimizedImg) optimizedImg.className = 'feature-section__image';
      moveInstrumentation(fields.mediaSrc, optimized);
      media.append(optimized);
    }
  }

  // image-left: media column first in DOM; default: content first
  if (isImageLeft) {
    block.append(media, content);
  } else {
    block.append(content, media);
  }
}
