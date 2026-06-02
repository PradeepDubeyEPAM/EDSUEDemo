# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AEM (Adobe Experience Manager) Edge Delivery Services** project using the Franklin architecture. It's a boilerplate for building performant websites with document-based authoring, combining AEM Cloud Service authoring with edge-optimized delivery. The project includes Adobe Adaptive Forms integration and commerce capabilities.

**Key technologies:**
- AEM Edge Delivery Services / Franklin (document-based architecture)
- Adobe Adaptive Forms (`@aemforms/af-core`, `@aemforms/af-formatters`)
- Vanilla JavaScript (no framework) with ES6 modules
- Mocha + Playwright for testing
- Rollup for bundling forms dependencies

## Development Commands

### Local Development
```bash
# Start local development server (requires @adobe/aem-cli installed globally)
aem up                           # Opens http://localhost:3000

# Install dependencies
npm install

# Build component model JSON files (required before running tests)
npm run build:json               # Builds all component JSON files
npm run build:json:models        # Builds component-models.json
npm run build:json:definitions   # Builds component-definition.json
npm run build:json:filters       # Builds component-filters.json
```

### Testing
```bash
# Run all tests (unit + e2e)
npm test

# Run specific test types
npm run test:unit                # Mocha unit tests only
npm run test:e2e                 # Playwright e2e tests only
npm run debug:e2e                # Debug Playwright tests in Chromium

# Coverage reports
npm run coverage:unit            # Unit test coverage (requires 85% lines, 88% functions)
npm run coverage:e2e             # E2E test coverage (requires 80% lines)
npm run coverage                 # Merge coverage reports
```

### Code Quality
```bash
# Linting
npm run lint                     # Lint JavaScript and CSS
npm run lint:js                  # ESLint for JS/JSON/MJS files
npm run lint:css                 # Stylelint for CSS files
npm run lint:fix                 # Auto-fix linting issues
```

### Update Dependencies
```bash
# Update Adobe Forms libraries
npm run update:core              # Update af-core runtime
npm run update:formula           # Update JSON formula engine
npm run update:formatters        # Update af-formatters
npm run update:functions         # Update custom functions
npm run update                   # Update all forms dependencies

npm run update:mappings          # Update component mappings
```

### Component Generation
```bash
# Create custom form component (interactive scaffolder)
npm run create:custom-component
```

## Architecture

### Core Structure

The project follows the **Franklin/AEM EDS block-based architecture**:

```
blocks/                     # Self-contained UI components (blocks)
  {block-name}/
    {block-name}.js        # Block logic
    {block-name}.css       # Block styles
    _*.json                # Component definition (for Universal Editor)

scripts/                    # Global utilities and page initialization
  aem.js                   # Core Franklin runtime (decorators, loaders)
  scripts.js               # Main entry point - decorateMain() orchestrates page load
  delayed.js               # Lazy-loaded scripts
  form-editor-support.js   # Universal Editor integration for forms

styles/                     # Global styles
  styles.css               # Base styles
  fonts.css                # Font definitions

models/                     # Component models for Universal Editor
  _component-*.json        # Build sources
  ../component-*.json      # Generated build outputs (root level)
```

### Block Loading Pattern

Blocks are automatically discovered and lazy-loaded:
1. Author creates content in AEM with block markup (e.g., `[[hero]]`)
2. `decorateBlocks()` in `scripts/aem.js` discovers blocks in the DOM
3. Block JS/CSS are loaded on-demand from `blocks/{block-name}/`
4. Each block's default export `decorate(block)` function is called
5. Block transforms its DOM and adds interactivity

### Forms Architecture

**Adobe Adaptive Forms** is the most complex subsystem:

```
blocks/form/
  form.js                  # Main form renderer - transforms document-based forms to AF model
  transform.js             # DocBasedFormToAF - converts Franklin form structure to AF JSON
  mappings.js              # Component decorator registry (maps field types to renderers)
  util.js                  # Field creation utilities (createFieldWrapper, setConstraints, etc.)
  submit.js                # Form submission logic
  constant.js              # Form constants (SUBMISSION_SERVICE, email patterns, etc.)
  
  components/              # Custom form field types
    wizard/                # Multi-step forms
    repeat/                # Repeatable panels
    accordion/             # Collapsible sections
    file/, password/, rating/, etc.
  
  rules/                   # Business rules engine
    index.js               # Rule engine initialization
    functionRegistration.js # Custom function registry
    RuleEngineWorker.js    # Web Worker for rule execution
    model/                 # Compiled AF runtime (afb-runtime.js, afb-events.js)
    formula/               # JSON formula parser
  
  integrations/
    recaptcha.js           # Google reCAPTCHA integration
```

**Forms Flow:**
1. Author creates form in AEM as structured table markup
2. `DocBasedFormToAF` transforms it to Adaptive Forms JSON model
3. AF Core runtime (`@aemforms/af-core`) processes the model
4. `componentDecorator` from `mappings.js` renders each field
5. Rules engine evaluates business logic (show/hide, calculations, validation)
6. Form submits to endpoint defined in `constant.js` (SUBMISSION_SERVICE)

### Component Models System

For **Universal Editor** integration:
- `models/_component-*.json` define component schemas
- `npm run build:json` merges them into root-level JSON files
- Component definitions include field definitions, default values, allowed components

### Commerce Integration

The project includes Adobe Commerce integration:

```
scripts/
  api-mesh-config.js       # Loads API Mesh configuration
  product.js               # Product data utilities
  auth.js                  # Adobe IMS authentication

blocks/
  product/                 # Product display block
  product-list/            # Product listing block
  product-detail/          # Product detail page block
  api-mesh-data/           # Generic API Mesh data fetcher
```

### Script Loading Order

1. `scripts.js` - `decorateMain(main)` decorates page structure
2. Blocks load on-demand as page sections are visible
3. `delayed.js` loads after LCP (Largest Contentful Paint)
4. Forms lazy-load AF runtime only when form blocks are present

## Testing

### Unit Tests
- Located in `test/` directory
- Setup: `test/unit/setup-env.js` mocks browser APIs (jsdom)
- Focus: Block logic, form transformations, utility functions
- Coverage exclusions: `blocks/form/rules/model/`, `blocks/form/rules/formula/` (vendor code)

### E2E Tests
- Playwright tests run in Chromium by default
- Tests full page rendering and block interactions
- Auto-installs Chromium on `npm install` (postinstall hook)

### Running Single Tests
```bash
# Run specific test file
npx mocha test/path/to/test.test.js

# Run specific Playwright test
npx playwright test path/to/test.spec.js

# Run with grep pattern
npx mocha --grep "test name pattern"
```

## Important Patterns

### Block Decoration
Every block exports a default `decorate` function:
```javascript
export default function decorate(block) {
  // Transform block DOM
  // Add event listeners
  // Lazy-load dependencies
}
```

### Field Wrapper Pattern (Forms)
Forms use `createFieldWrapper()` to create consistent field structure:
```javascript
const withFieldWrapper = (element) => (fd) => {
  const wrapper = createFieldWrapper(fd);
  wrapper.append(element(fd));
  return wrapper;
};
```

### Lazy Loading
Use dynamic imports for heavy dependencies:
```javascript
const { default: heavyLib } = await import('./heavy-lib.js');
```

### Rule Engine
Forms business rules run in a Web Worker (`RuleEngineWorker.js`) to avoid blocking the main thread.

## Configuration Files

- `helix-query.yaml` - Defines query indices for site search
- `helix-sitemap.yaml` - Sitemap generation config
- `component-*.json` (root) - Generated component models (don't edit directly)
- `playwright.config.js` - E2E test configuration
- `.eslintrc` + `stylelint.config.*` - Code style rules

## Prerequisites

- Node.js 18.3.x or newer
- AEM Cloud Service release 2024.8 or newer (>= `17465`)
- `@adobe/aem-cli` installed globally: `npm install -g @adobe/aem-cli`
- AEM Code Sync GitHub App configured for the repository

## Documentation

- [AEM Edge Delivery Documentation](https://www.aem.live/docs/)
- [Universal Editor Authoring](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring)
- [Block Development](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/create-block)
- [Content Modelling](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/content-modeling)

## Working with Forms

When modifying forms:
1. Always run `npm run build:json` before testing (regenerates component models)
2. Test field components in isolation first
3. Rules changes require understanding the AF Core event model
4. Form submission endpoint is configurable in `constant.js`
5. Custom functions must be registered in `rules/functionRegistration.js`

## Git Workflow

The repository uses Husky for pre-commit hooks:
- Linting runs automatically on commit
- Ensure tests pass before pushing

Current branch: `feature/token`
Main branch: `main`
