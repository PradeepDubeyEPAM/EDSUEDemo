import { toCamelCase } from './aem.js';

/**
 * Gets placeholders object.
 * @param {string} [prefix] Location of placeholders
 * @returns {object} Window placeholders object
 */
// eslint-disable-next-line import/prefer-default-export
export function fetchPlaceholders(prefix = 'default') {
  window.placeholders = window.placeholders || {};
  const resolvedLocale = document.documentElement.getAttribute('data-lang');
  if (!window.placeholders[prefix]) {
    window.placeholders[prefix] = new Promise((resolve) => {
      fetch(`${prefix === 'default' ? '' : prefix}/placeholders.json`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          return {};
        }).then((json) => {
          const placeholders = {};
          json.data
            .filter((placeholder) => placeholder.Key)
            .forEach((placeholder) => {
              const localizedText = placeholder[resolvedLocale] || placeholder.en;
              placeholders[toCamelCase(placeholder.Key)] = localizedText;
            });
          window.placeholders[prefix] = placeholders;
          resolve(window.placeholders[prefix]);
        }).catch(() => {
          // error loading placeholders
          window.placeholders[prefix] = {};
          resolve(window.placeholders[prefix]);
        });
    });
  }
  return window.placeholders[`${prefix}`];
}
