/**
 * Handles UI updates and DOM element caching.
 */
import type { SpeakifySettings } from '@/lib/storage';

/**
 * DOM Elements cache
 */
export const elements = {
  enableExtension: document.getElementById('enableExtension') as HTMLInputElement,
  languageSelector: document.getElementById('languageSelector') as HTMLSelectElement,
  appearChance: document.getElementById('appearChance') as HTMLInputElement,
  appearChanceValue: document.getElementById('appearChanceValue') as HTMLSpanElement,
  flipChance: document.getElementById('flipChance') as HTMLInputElement,
  flipChanceValue: document.getElementById('flipChanceValue') as HTMLSpanElement,
  overlayPosition: document.getElementById('overlayPosition') as HTMLSelectElement,
  overlaySizeMin: document.getElementById('overlaySizeMin') as HTMLInputElement,
  overlaySizeMax: document.getElementById('overlaySizeMax') as HTMLInputElement,
  overlaySizeValue: document.getElementById('overlaySizeValue') as HTMLSpanElement,
  overlayOpacity: document.getElementById('overlayOpacity') as HTMLInputElement,
  overlayOpacityValue: document.getElementById('overlayOpacityValue') as HTMLSpanElement,
  debugMode: document.getElementById('debugMode') as HTMLInputElement,
};

/**
 * Update value display for a slider
 */
export function updateValueDisplay(
  input: HTMLInputElement,
  display: HTMLSpanElement,
  suffix: string = '%'
): void {
  display.textContent = `${input.value}${suffix}`;

  // Single Slider Track Fill
  // Dual slider inputs should be skipped as they use a shared track element
  if (!input.parentElement?.classList.contains('range-slider-dual')) {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value);
    const percentage = ((val - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(to right, #ff9f43 ${percentage}%, #e0e0e0 ${percentage}%)`;
  }
}

/**
 * Update size range display
 */
export function updateSizeRangeDisplay(): void {
  const minVal = parseInt(elements.overlaySizeMin.value, 10);
  const maxVal = parseInt(elements.overlaySizeMax.value, 10);
  elements.overlaySizeValue.textContent = `${minVal}% ~ ${maxVal}%`;

  // Dual Slider Track Fill (Update CSS Variables)
  const minLimit = parseFloat(elements.overlaySizeMin.min) || 25;
  const maxLimit = parseFloat(elements.overlaySizeMax.max) || 200;

  const rangeStart = ((minVal - minLimit) / (maxLimit - minLimit)) * 100;
  const rangeEnd = ((maxVal - minLimit) / (maxLimit - minLimit)) * 100;

  const container = elements.overlaySizeMin.parentElement;
  if (container) {
    container.style.setProperty('--start', `${rangeStart}%`);
    container.style.setProperty('--end', `${rangeEnd}%`);
  }
}

/**
 * Validate and correct size range (min <= max)
 */
export function validateSizeRange(): void {
  const minVal = parseInt(elements.overlaySizeMin.value, 10);
  const maxVal = parseInt(elements.overlaySizeMax.value, 10);

  // min이 max보다 크면 조정
  if (minVal > maxVal) {
    elements.overlaySizeMin.value = String(maxVal);
  }
}

/**
 * Update all UI elements with current settings
 */
export function updateUI(settings: SpeakifySettings): void {
  if (elements.enableExtension) {
    elements.enableExtension.checked = settings.extensionEnabled;
  }

  // Convert decimal to percentage for display
  if (elements.appearChance) {
    elements.appearChance.value = String(Math.round(settings.appearChance * 100));
    updateValueDisplay(elements.appearChance, elements.appearChanceValue);
  }

  if (elements.flipChance) {
    elements.flipChance.value = String(Math.round(settings.flipChance * 100));
    updateValueDisplay(elements.flipChance, elements.flipChanceValue);
  }

  if (elements.overlayPosition) {
    elements.overlayPosition.value = settings.overlayPosition;
  }

  // Size range
  if (elements.overlaySizeMin && elements.overlaySizeMax) {
    elements.overlaySizeMin.value = String(settings.overlaySizeMin);
    elements.overlaySizeMax.value = String(settings.overlaySizeMax);
    updateSizeRangeDisplay();
  }

  if (elements.overlayOpacity) {
    elements.overlayOpacity.value = String(Math.round(settings.overlayOpacity * 100));
    updateValueDisplay(elements.overlayOpacity, elements.overlayOpacityValue);
  }

  // Debug mode
  if (elements.debugMode) {
    elements.debugMode.checked = settings.debugMode;
  }
}
