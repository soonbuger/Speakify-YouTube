/**
 * YouTube Speakify - Popup Main Script
 * Handles settings UI and user interactions.
 *
 * @module entrypoints/popup/main
 */
import { loadAllSettings, saveAllSettings, type SpeakifySettings } from '@/lib/storage';

/**
 * DOM Elements cache
 */
const elements = {
  enableExtension: document.getElementById('enableExtension') as HTMLInputElement,
  appearChance: document.getElementById('appearChance') as HTMLInputElement,
  appearChanceValue: document.getElementById('appearChanceValue') as HTMLSpanElement,
  flipChance: document.getElementById('flipChance') as HTMLInputElement,
  flipChanceValue: document.getElementById('flipChanceValue') as HTMLSpanElement,
  overlayPosition: document.getElementById('overlayPosition') as HTMLSelectElement,
  overlaySize: document.getElementById('overlaySize') as HTMLInputElement,
  overlaySizeValue: document.getElementById('overlaySizeValue') as HTMLSpanElement,
  overlayOpacity: document.getElementById('overlayOpacity') as HTMLInputElement,
  overlayOpacityValue: document.getElementById('overlayOpacityValue') as HTMLSpanElement,
};

/**
 * Apply i18n translations to all elements with data-i18n attribute
 */
function applyI18n(): void {
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

/**
 * Update value display for a slider
 */
function updateValueDisplay(input: HTMLInputElement, display: HTMLSpanElement, suffix = '%'): void {
  display.textContent = `${input.value}${suffix}`;
}

/**
 * Update all UI elements with current settings
 */
function updateUI(settings: SpeakifySettings): void {
  elements.enableExtension.checked = settings.extensionEnabled;

  // Convert decimal to percentage for display
  elements.appearChance.value = String(Math.round(settings.appearChance * 100));
  updateValueDisplay(elements.appearChance, elements.appearChanceValue);

  elements.flipChance.value = String(Math.round(settings.flipChance * 100));
  updateValueDisplay(elements.flipChance, elements.flipChanceValue);

  elements.overlayPosition.value = settings.overlayPosition;

  elements.overlaySize.value = String(settings.overlaySize);
  updateValueDisplay(elements.overlaySize, elements.overlaySizeValue);

  elements.overlayOpacity.value = String(Math.round(settings.overlayOpacity * 100));
  updateValueDisplay(elements.overlayOpacity, elements.overlayOpacityValue);
}

/**
 * Save settings when UI changes
 */
async function handleSettingsChange(): Promise<void> {
  const settings: SpeakifySettings = {
    extensionEnabled: elements.enableExtension.checked,
    appearChance: parseInt(elements.appearChance.value, 10) / 100,
    flipChance: parseInt(elements.flipChance.value, 10) / 100,
    overlayPosition: elements.overlayPosition.value as SpeakifySettings['overlayPosition'],
    overlaySize: parseInt(elements.overlaySize.value, 10),
    overlayOpacity: parseInt(elements.overlayOpacity.value, 10) / 100,
  };

  await saveAllSettings(settings);
}

/**
 * Initialize popup
 */
async function init(): Promise<void> {
  // Apply i18n
  applyI18n();

  // Load and display current settings
  const settings = await loadAllSettings();
  updateUI(settings);

  // Add event listeners
  elements.enableExtension.addEventListener('change', handleSettingsChange);

  elements.appearChance.addEventListener('input', () => {
    updateValueDisplay(elements.appearChance, elements.appearChanceValue);
    handleSettingsChange();
  });

  elements.flipChance.addEventListener('input', () => {
    updateValueDisplay(elements.flipChance, elements.flipChanceValue);
    handleSettingsChange();
  });

  elements.overlayPosition.addEventListener('change', handleSettingsChange);

  elements.overlaySize.addEventListener('input', () => {
    updateValueDisplay(elements.overlaySize, elements.overlaySizeValue);
    handleSettingsChange();
  });

  elements.overlayOpacity.addEventListener('input', () => {
    updateValueDisplay(elements.overlayOpacity, elements.overlayOpacityValue);
    handleSettingsChange();
  });
}

// Run initialization
init();
