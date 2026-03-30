---

# Component Spec: heroBanner
Generated from: figma-tokens/heroBanner.json
Figma node: Hero-section

## Layout
direction: HORIZONTAL
columns: Left: text content (heading + body + CTA button, 656px) | Right: image placeholder (824px)

## SCSS Design Tokens
```scss
$heroBanner-bg:                #043873;  // 4/56/115 rgb
$heroBanner-min-height:        51.8125rem;  // 829px
$heroBanner-padding-v:         8.75rem;    // 140px top/bottom
$heroBanner-padding-h:         13.75rem;   // 220px left/right
$heroBanner-gap:               0rem;       // 0px
$heroBanner-heading-size:      4rem;       // 64px Bold
$heroBanner-heading-color:     #ffffff;
$heroBanner-body-size:         1.125rem;   // 18px Regular
$heroBanner-body-color:        #ffffff;
$heroBanner-body-line-height:  1.875rem;   // 30px
$heroBanner-content-gap:       1.5rem;     // 24px (between heading text and body text)
$heroBanner-section-gap:       3.75rem;    // 60px (between text-block and CTA button)
$heroBanner-cta-bg:            #4f9cf9;
$heroBanner-cta-color:         #ffffff;
$heroBanner-cta-padding:       1.25rem;    // 20px all sides
$heroBanner-cta-font-size:     1.125rem;   // 18px Medium
$heroBanner-cta-line-height:   1.4375rem;  // 23px
$heroBanner-cta-gap:           0.625rem;   // 10px (between label and arrow icon)
$heroBanner-cta-width:         13.6875rem; // 219px
$heroBanner-cta-height:        3.9375rem;  // 63px
$heroBanner-image-width:       51.5rem;    // 824px
$heroBanner-image-height:      34.3125rem; // 549px
$heroBanner-image-placeholder-bg: #c4defd; // r:196 g:222 b:253
$heroBanner-decor-color:       #ffe492;    // r:255 g:228 b:146 (decorative wave elements)
```

## Content Properties
Each property below becomes: AEM dialog field + Sling Model getter + React prop + data-* attribute in HTL

headingText:
  label:     Heading Text
  dialog:    textfield
  java:      String
  default:   'Get More Done with whitepace'
  required:  true

bodyText:
  label:     Body Description
  dialog:    richtext
  java:      String
  default:   'Project management software that enables your teams to collaborate, plan, analyze and manage everyday tasks'
  required:  false

ctaLabel:
  label:     CTA Button Label
  dialog:    textfield
  java:      String
  default:   'Try Whitepace free'
  required:  false

ctaUrl:
  label:     CTA Button URL
  dialog:    pathfield
  java:      String
  default:   ''
  required:  false

imageSrc:
  label:     Hero Image
  dialog:    pathfield
  java:      String
  default:   ''
  required:  false

## React Component Structure
// Describe the JSX DOM structure matching the Figma layout
// Use BEM class names: learningaisite-heroBanner__<element>

<section className="learningaisite-heroBanner">
  <div className="learningaisite-heroBanner__decor" aria-hidden="true" />
  <div className="learningaisite-heroBanner__content">
    <div className="learningaisite-heroBanner__text-block">
      <h1 className="learningaisite-heroBanner__heading">{headingText}</h1>
      <div
        className="learningaisite-heroBanner__body"
        dangerouslySetInnerHTML={{ __html: bodyText }}
      />
    </div>
    <a
      className="learningaisite-heroBanner__cta"
      href={ctaUrl}
    >
      {ctaLabel}
      <span className="learningaisite-heroBanner__cta-icon" aria-hidden="true" />
    </a>
  </div>
  <div className="learningaisite-heroBanner__media">
    <img
      className="learningaisite-heroBanner__image"
      src={imageSrc}
      alt=""
    />
  </div>
</section>

## Mobile Breakpoint Notes
// At max-width: 767px the following changes apply:
// - flex-direction: column (stack content above image)
// - Reduce heading font size by ~25%: ~3rem (from 4rem)
// - Reduce body font size: stays at 1.125rem but line-height tightens
// - Reduce padding-v by ~40%: ~5rem (from 8.75rem)
// - Reduce padding-h by ~40%: ~1.5rem (from 13.75rem)
// - Image width: 100% (from fixed 51.5rem)
// - Image height: auto or ~20rem
// - CTA button: full width or centered
// - decor wave element: hidden or reduced in opacity

---
