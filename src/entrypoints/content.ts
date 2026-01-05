/**
 * YouTube Speakify - Content Script
 * Main entry point for the extension.
 *
 * @module entrypoints/content
 */
import { findThumbnails, markAsProcessed } from '@/lib/thumbnailFinder';
import { applyOverlay } from '@/lib/overlayManager';
import { Randomizer } from '@/lib/randomizer';
import { getImageURL, detectImageCount, getImageCount } from '@/lib/assetLoader';
import { loadAllSettings, watchSettings } from '@/lib/storage';
import { Logger } from '@/lib/logger';

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

      // Detect available images
      Logger.info('Detecting images...');
      await detectImageCount();

      const imageCount = getImageCount();
      if (imageCount === 0) {
        Logger.warn('No images found in public/images/ folder!');
        return;
      }

      // Initialize randomizer
      const randomizer = new Randomizer();

      /**
       * Applies overlay to all unprocessed thumbnails
       */
      function applyOverlayToThumbnails(): void {
        if (!settings.extensionEnabled) return;

        const thumbnails = findThumbnails();

        thumbnails.forEach((thumbnail) => {
          // Determine if Speaki should appear
          if (Math.random() > settings.appearChance) return;

          // Get random non-repeating image
          const imageIndex = randomizer.getRandomIndex(imageCount);
          const imageURL = getImageURL(imageIndex);

          // Determine if image should be flipped
          const shouldFlip = Math.random() < settings.flipChance;

          // 크기 범위 내에서 랜덤 값 생성
          const randomSize =
            settings.overlaySizeMin +
            Math.random() * (settings.overlaySizeMax - settings.overlaySizeMin);

          // 디버그 로그
          Logger.debug('Size calculation', {
            min: settings.overlaySizeMin,
            max: settings.overlaySizeMax,
            randomSize: Math.round(randomSize),
          });

          // Apply the overlay
          const overlay = applyOverlay(thumbnail, imageURL, {
            flip: shouldFlip,
            position: settings.overlayPosition,
            size: randomSize,
            opacity: settings.overlayOpacity,
          });

          // 처리 완료 표시 (중복 방지)
          if (overlay) {
            markAsProcessed(thumbnail);
          }
        });
      }

      // ========================================
      // MutationObserver: DOM 변경 감지 (성능 최적화)
      // setInterval(100ms) 대신 변경 시에만 실행
      // ========================================
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;

      const observer = new MutationObserver(() => {
        // 디바운싱: 연속적인 DOM 변경을 하나로 묶음
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          applyOverlayToThumbnails();
        }, 50); // 50ms 디바운스
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Initial run (페이지 로드 시 즉시 실행)
      applyOverlayToThumbnails();

      Logger.info(`Loaded! ${imageCount} images. Position: ${settings.overlayPosition}`);

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
