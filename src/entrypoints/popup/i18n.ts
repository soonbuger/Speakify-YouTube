/**
 * Handles internationalization for the popup UI.
 * Custom implementation to support dynamic language switching within the extension.
 */

// Cache for loaded messages
const messageCache: Record<string, Record<string, { message: string }>> = {};

/**
 * Load locale messages from public/_locales directory.
 */
async function loadMessages(lang: string): Promise<Record<string, { message: string }> | null> {
  if (messageCache[lang]) return messageCache[lang];

  try {
    // WXT copies public/_locales to dist/_locales
    const path = `/_locales/${lang}/messages.json`;
    const url = browser.runtime.getURL(path as any);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load messages for ${lang}`);
    
    const messages = await response.json();
    messageCache[lang] = messages;
    return messages;
  } catch (error) {
    console.warn(`[i18n] Failed to load language: ${lang}`, error);
    return null;
  }
}

/**
 * Apply translations to the UI based on the selected language.
 * Falls back to 'en' if loading fails.
 */
export async function applyI18n(lang: string = 'en'): Promise<void> {
  let messages = await loadMessages(lang);

  // Fallback to English if target language fails
  if (!messages && lang !== 'en') {
    messages = await loadMessages('en');
  }

  if (!messages) return;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && messages![key]) {
      el.textContent = messages![key].message;
    }
  });

  // Update HTML lang attribute for accessibility
  document.documentElement.lang = lang;
}

