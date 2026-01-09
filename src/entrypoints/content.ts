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
import {
  registerThumbnailsForViewport,
  cleanupViewportObserver,
} from '@/features/thumbnail/viewportObserver';
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
      // MutationObserver: 새 DOM 요소 감지
      // → IntersectionObserver에 등록
      // ========================================
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      const changedRoots = new Set<HTMLElement | Document>();

      const mutationObserver = new MutationObserver((mutations) => {
        // 변경된 요소 수집
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) changedRoots.add(node);
          });
        });

        // 디바운싱
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          try {
            if (changedRoots.size === 0) return;

            const roots = Array.from(changedRoots);
            changedRoots.clear();

            // 썸네일을 IntersectionObserver에 등록 (즉시 처리 X)
            await registerThumbnailsForViewport(settings, randomizer, roots);
            Logger.debug('Thumbnails registered (MutationObserver)', {
              count: roots.length,
            });
          } catch (error) {
            Logger.error('Registration Error', { error: String(error) });
          }
        }, PERFORMANCE.DEBOUNCE_MS);
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Initial run (페이지 로드 시 즉시 등록)
      try {
        await registerThumbnailsForViewport(settings, randomizer);
        Logger.info('✅ System Verified: IntersectionObserver mode active.');
      } catch (error) {
        Logger.error('Initial Registration Failed', { error: String(error) });
      }

      Logger.info(`Loaded! ${totalImageCount} images. Position: ${settings.overlayPosition}`);

      // Cleanup on page unload
      window.addEventListener('beforeunload', () => {
        mutationObserver.disconnect();
        cleanupViewportObserver();
        if (debounceTimer) clearTimeout(debounceTimer);
      });
    } catch (error) {
      Logger.error('Content script failed', { error: String(error) });
    }
  },
});
