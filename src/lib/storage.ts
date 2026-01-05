/**
 * YouTube Speakify - Storage Module
 * Type-safe storage wrapper using browser.storage API directly.
 * (Compatible with WXT and testable with fake-browser)
 */

/**
 * Overlay position options
 */
export type OverlayPosition = 'center' | 'random' | 'smart';
export type Language = 'en' | 'ko';

/**
 * Extension settings interface
 */
export interface SpeakifySettings {
  language: Language;
  extensionEnabled: boolean;
  appearChance: number;
  flipChance: number;
  overlayPosition: OverlayPosition;
  overlaySizeMin: number; // 최소 크기 (%)
  overlaySizeMax: number; // 최대 크기 (%)
  overlayOpacity: number;
  debugMode: boolean; // 디버그 모드
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: SpeakifySettings = {
  language: 'en',
  extensionEnabled: true,
  appearChance: 1.0,
  flipChance: 0.5,
  overlayPosition: 'random',
  overlaySizeMin: 25,
  overlaySizeMax: 100,
  overlayOpacity: 1.0,
  debugMode: false,
};

/**
 * Load all settings from browser.storage.local
 */
export async function loadAllSettings(): Promise<SpeakifySettings> {
  const result = await browser.storage.local.get(DEFAULT_SETTINGS);
  return result as SpeakifySettings;
}

/**
 * Save all settings to browser.storage.local
 */
export async function saveAllSettings(settings: Partial<SpeakifySettings>): Promise<void> {
  await browser.storage.local.set(settings);
}

/**
 * Watch for settings changes
 */
export function watchSettings(
  callback: (newSettings: Partial<SpeakifySettings>) => void
): () => void {
  const listener = (
    changes: { [key: string]: browser.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName !== 'local') return;

    const newSettings: Partial<SpeakifySettings> = {};
    for (const [key, change] of Object.entries(changes)) {
      if (key in DEFAULT_SETTINGS) {
        (newSettings as Record<string, unknown>)[key] = change.newValue;
      }
    }

    if (Object.keys(newSettings).length > 0) {
      callback(newSettings);
    }
  };

  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
