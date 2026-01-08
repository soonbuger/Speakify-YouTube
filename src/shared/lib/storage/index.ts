/**
 * YouTube Speakify - Storage Module
 * Type-safe storage wrapper using browser.storage API directly.
 * (Compatible with WXT and testable with fake-browser)
 */

import { SpeakifySettings, DEFAULT_SETTINGS } from '@/types';
import browser from 'webextension-polyfill';

// 타입 재export (하위 호환성)
// 타입 재export (하위 호환성)
export type { SpeakifySettings, OverlayPosition, Language } from '@/types';
export { DEFAULT_SETTINGS } from '@/types';

/**
 * Load all settings from browser.storage.local
 */
export async function loadAllSettings(): Promise<SpeakifySettings> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await browser.storage.local.get(DEFAULT_SETTINGS as any);
  return result as unknown as SpeakifySettings;
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
  callback: (newSettings: Partial<SpeakifySettings>) => void,
): () => void {
  const listener = (
    changes: { [key: string]: browser.Storage.StorageChange },
    areaName: string,
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
