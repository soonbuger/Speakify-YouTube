/**
 * Storage Module Tests
 * Uses WXT fake-browser for storage mocking
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import {
  loadAllSettings,
  saveAllSettings,
  DEFAULT_SETTINGS,
  type SpeakifySettings,
} from '@/shared/lib/storage';

// Mock browser global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).browser = fakeBrowser;

describe('Storage', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  describe('loadAllSettings', () => {
    it('should return default settings when storage is empty', async () => {
      const settings = await loadAllSettings();
      expect(settings.extensionEnabled).toBe(DEFAULT_SETTINGS.extensionEnabled);
      expect(settings.appearChance).toBe(DEFAULT_SETTINGS.appearChance);
    });

    it('should return saved settings', async () => {
      await fakeBrowser.storage.local.set({
        extensionEnabled: false,
        appearChance: 0.5,
      });

      const settings = await loadAllSettings();
      expect(settings.extensionEnabled).toBe(false);
      expect(settings.appearChance).toBe(0.5);
    });
  });

  describe('saveAllSettings', () => {
    it('should save settings to storage', async () => {
      const newSettings: Partial<SpeakifySettings> = {
        extensionEnabled: false,
        overlayPosition: 'random',
      };

      await saveAllSettings(newSettings);

      const result = await fakeBrowser.storage.local.get(['extensionEnabled', 'overlayPosition']);
      expect(result.extensionEnabled).toBe(false);
      expect(result.overlayPosition).toBe('random');
    });
  });
});
