/**
 * YouTube Speakify - Popup Main Script
 * Handles settings UI and user interactions.
 *
 * @module entrypoints/popup/main
 */
import { loadAllSettings, saveAllSettings, type SpeakifySettings } from '@/lib/storage';
import { applyI18n } from './i18n';
import {
  elements,
  updateUI,
  updateValueDisplay,
  updateSizeRangeDisplay,
  validateSizeRange,
} from './ui';

/**
 * Save settings when UI changes
 */
async function handleSettingsChange(): Promise<void> {
  const settings: SpeakifySettings = {
    extensionEnabled: elements.enableExtension.checked,
    appearChance: parseInt(elements.appearChance.value, 10) / 100,
    flipChance: parseInt(elements.flipChance.value, 10) / 100,
    overlayPosition: elements.overlayPosition.value as SpeakifySettings['overlayPosition'],
    overlaySizeMin: parseInt(elements.overlaySizeMin.value, 10),
    overlaySizeMax: parseInt(elements.overlaySizeMax.value, 10),
    overlayOpacity: parseInt(elements.overlayOpacity.value, 10) / 100,
    debugMode: elements.debugMode.checked,
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
  if (elements.enableExtension) {
    elements.enableExtension.addEventListener('change', handleSettingsChange);
  }

  if (elements.appearChance) {
    elements.appearChance.addEventListener('input', () => {
      updateValueDisplay(elements.appearChance, elements.appearChanceValue);
      handleSettingsChange();
    });
  }

  if (elements.flipChance) {
    elements.flipChance.addEventListener('input', () => {
      updateValueDisplay(elements.flipChance, elements.flipChanceValue);
      handleSettingsChange();
    });
  }

  if (elements.overlayPosition) {
    elements.overlayPosition.addEventListener('change', handleSettingsChange);
  }

  // Size range sliders
  if (elements.overlaySizeMin) {
    elements.overlaySizeMin.addEventListener('input', () => {
      validateSizeRange();
      updateSizeRangeDisplay();
      handleSettingsChange();
    });
  }

  if (elements.overlaySizeMax) {
    elements.overlaySizeMax.addEventListener('input', () => {
      validateSizeRange();
      updateSizeRangeDisplay();
      handleSettingsChange();
    });
  }

  if (elements.overlayOpacity) {
    elements.overlayOpacity.addEventListener('input', () => {
      updateValueDisplay(elements.overlayOpacity, elements.overlayOpacityValue);
      handleSettingsChange();
    });
  }

  // Debug mode toggle
  if (elements.debugMode) {
    elements.debugMode.addEventListener('change', handleSettingsChange);
  }
}

// Run initialization
init();

