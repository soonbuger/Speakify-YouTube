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
import { PERFORMANCE } from '@/shared/config/constants';

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
      const changedRoots = new Set<HTMLElement | Document>();

      const observer = new MutationObserver((mutations) => {
        // 변경된 요소 수집 (Scoped detection)
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) changedRoots.add(node);
          });
        });

        // 디바운싱: 연속적인 DOM 변경을 하나로 묶음
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          try {
            if (changedRoots.size === 0) return;

            const roots = Array.from(changedRoots);
            changedRoots.clear(); // 처리 후 초기화

            await applyOverlayToThumbnails(settings, randomizer, roots);
            Logger.debug('Refactored Processor Executed Safely (Observer)', {
              count: roots.length,
            });
          } catch (error) {
            Logger.error('Processor Runtime Error', { error: String(error) });
          }
        }, PERFORMANCE.DEBOUNCE_MS);
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
