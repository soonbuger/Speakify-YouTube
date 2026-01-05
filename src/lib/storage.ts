/**
 * YouTube Speakify - Storage Module
 * Type-safe storage wrapper using browser.storage API directly.
 * (Compatible with WXT and testable with fake-browser)
 */

/**
 * Overlay position options
 */
export type OverlayPosition = 'center' | 'bottom-right' | 'bottom-left' | 'random';

/**
 * Extension settings interface
 */
export interface SpeakifySettings {
  extensionEnabled: boolean;
  appearChance: number;
  flipChance: number;
  overlayPosition: OverlayPosition;
  overlaySizeMin: number; // 최소 크기 (%)
  overlaySizeMax: number; // 최대 크기 (%)
  overlayOpacity: number;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: SpeakifySettings = {
  extensionEnabled: true,
  appearChance: 1.0,
  flipChance: 0.25,
  overlayPosition: 'center',
  overlaySizeMin: 20,
  overlaySizeMax: 100,
  overlayOpacity: 1.0,
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
