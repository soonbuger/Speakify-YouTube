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
 * Initialize popup settings and UI
 */
async function initSettings(): Promise<void> {
  const settings = await loadAllSettings();

  // 1. UI 상태 업데이트
  updateUI(settings);

  // 2. 언어 적용 (초기 로딩)
  await applyI18n(settings.language);
}

/**
 * Initialize popup
 */
async function init(): Promise<void> {
  // Load and display current settings
  await initSettings();

  // Add event listeners
  // 확장 프로그램 활성화 토글
  if (elements.enableExtension) {
    elements.enableExtension.addEventListener('change', handleSettingsChange);
  }

  // 언어 변경
  if (elements.languageSelector) {
    elements.languageSelector.addEventListener('change', async () => {
      const newLang = elements.languageSelector.value as 'en' | 'ko';
      await saveAllSettings({ language: newLang });
      await applyI18n(newLang); // 즉시 적용
      // Re-apply other settings to ensure UI reflects potential language-dependent changes
      const currentSettings = await loadAllSettings();
      updateUI(currentSettings);
    });
  }

  // 등장 확률
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
