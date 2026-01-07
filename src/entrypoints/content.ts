/**
 * YouTube Speakify - Content Script
 * Main entry point for the extension.
 *
 * @module entrypoints/content
 */
import { detectImageCount, getImageCount } from '@/shared/lib/assets/loader';
import { loadAllSettings, watchSettings } from '@/shared/lib/storage';
import { Logger } from '@/shared/lib/utils/logger';
import { Randomizer } from '@/shared/lib/utils/randomizer';
import { applyOverlayToThumbnails } from '@/features/thumbnail/processor';

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  runAt: 'document_idle',

  async main() {
    try {
      // Load settings
      let settings = await loadAllSettings();

      if (!settings.extensionEnabled) {
        Logger.info('Extension is disabled.');
        return;
      }

      // Watch for settings changes (실시간 반영)
      watchSettings((newSettings) => {
        settings = { ...settings, ...newSettings };
        Logger.debug('Settings updated', newSettings);
      });

      // Detect available images (모든 폴더)
      Logger.info('Detecting images...');
      await detectImageCount();

      const totalImageCount = getImageCount();
      if (totalImageCount === 0) {
        Logger.warn('No images found!');
        return;
      }

      // Initialize randomizer
      const randomizer = new Randomizer();

      // ========================================
      // MutationObserver: DOM 변경 감지 (성능 최적화)
      // setInterval(100ms) 대신 변경 시에만 실행
      // ========================================
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const observer = new MutationObserver(() => {
        // 디바운싱: 연속적인 DOM 변경을 하나로 묶음
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          try {
            await applyOverlayToThumbnails(settings, randomizer);
            Logger.debug('Refactored Processor Executed Safely (Observer)');
          } catch (error) {
            Logger.error('Processor Runtime Error', { error: String(error) });
          }
        }, 50); // 50ms 디바운스
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Initial run (페이지 로드 시 즉시 실행)
      try {
        await applyOverlayToThumbnails(settings, randomizer);
        Logger.info('✅ System Verified: Refactored logic is running active.');
      } catch (error) {
        Logger.error('Initial Processor Failed', { error: String(error) });
      }

      Logger.info(`Loaded! ${totalImageCount} images. Position: ${settings.overlayPosition}`);

      // Cleanup on page unload
      window.addEventListener('beforeunload', () => {
        observer.disconnect();
        if (debounceTimer) clearTimeout(debounceTimer);
      });
    } catch (error) {
      Logger.error('Initialization failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
});
