/**
 * Handles internationalization for the popup UI.
 */
export function applyI18n(): void {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const message = browser.i18n.getMessage(key);
      if (message) {
        el.textContent = message;
      }
    }
  });
}
