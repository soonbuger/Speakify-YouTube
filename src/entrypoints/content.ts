/**
 * YouTube Speakify - Content Script
 * Main entry point for the extension.
 *
 * @module entrypoints/content
 */
import { findThumbnails, markAsProcessed } from '@/lib/thumbnailFinder';
import { applyOverlay } from '@/lib/overlayManager';
import { Randomizer } from '@/lib/randomizer';
import { assetManager, detectImageCount, getImageCount } from '@/lib/assetLoader';
import { loadAllSettings, watchSettings } from '@/lib/storage';
import { Logger } from '@/lib/logger';
import { analyzeImageForPlacement } from '@/lib/canvasAnalyzer';

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

      /**
       * 썸네일 img 요소의 src URL을 가져옴
       */
      function getThumbnailImageUrl(thumbnail: HTMLElement): string | null {
        // 직접 img 요소인 경우
        if (thumbnail instanceof HTMLImageElement && thumbnail.src) {
          return thumbnail.src;
        }
        // 자식 img 요소 찾기
        const imgChild = thumbnail.querySelector('img');
        if (imgChild && imgChild.src) {
          return imgChild.src;
        }
        return null;
      }

      /**
       * Applies overlay to all unprocessed thumbnails
       */
      async function applyOverlayToThumbnails(): Promise<void> {
        if (!settings.extensionEnabled) return;

        // 이미지 탐지가 완료되지 않았으면 건너뛰기
        const currentImageCount = getImageCount();
        if (currentImageCount === 0) return;

        const thumbnails = findThumbnails();

        for (const thumbnail of thumbnails) {
          // Determine if Speaki should appear
          if (Math.random() > settings.appearChance) continue;

          // 중복 처리 방지: 분석 전에 먼저 처리 완료 표시
          markAsProcessed(thumbnail);

          // Get random non-repeating image (모든 폴더에서 선택)
          const randomIndex = randomizer.getRandomIndex(currentImageCount);
          const imageAsset = assetManager.getRandomImage(randomIndex);

          // Determine if image should be flipped
          const shouldFlip = Math.random() < settings.flipChance;

          // 크기 범위 내에서 랜덤 값 생성
          const randomSize =
            settings.overlaySizeMin +
            Math.random() * (settings.overlaySizeMax - settings.overlaySizeMin);

          // 스마트 위치 분석 (smart 옵션일 때만)
          let smartPosition: { x: number; y: number } | undefined;
          if (settings.overlayPosition === 'smart') {
            const thumbnailUrl = getThumbnailImageUrl(thumbnail);
            if (thumbnailUrl) {
              try {
                // 500ms 타임아웃으로 분석 (빠른 스크롤 대응)
                const analysisPromise = analyzeImageForPlacement(thumbnailUrl);
                const timeoutPromise = new Promise<null>((resolve) =>
                  setTimeout(() => resolve(null), 500)
                );
                const analysis = await Promise.race([analysisPromise, timeoutPromise]);

                if (analysis) {
                  smartPosition = analysis.bestPosition;
                  Logger.debug('Smart position analyzed', {
                    url: thumbnailUrl.substring(0, 50),
                    position: smartPosition,
                  });

                } else {
                  Logger.debug('Smart analysis timeout, using center fallback');
                  smartPosition = { x: 50, y: 50 };
                }
              } catch (error) {
                Logger.warn('Smart analysis failed, using center fallback', {
                  error: error instanceof Error ? error.message : String(error),
                });
                smartPosition = { x: 50, y: 50 };
              }
            }
          }

          // 디버그 로그
          Logger.debug('Image selected', {
            folder: imageAsset.folder,
            index: imageAsset.index,
            size: Math.round(randomSize),
          });

          // Apply the overlay
          applyOverlay(thumbnail, imageAsset.url, {
            flip: shouldFlip,
            position: settings.overlayPosition,
            size: randomSize,
            opacity: settings.overlayOpacity,
            smartPosition,
          });

          // 디버그 모드: 분석 위치에 빨간 점 표시
          if (settings.debugMode) {
            // smartPosition이 없으면(random 등) 표시 안 함, smart 모드에서만 표시
            const debugPos = smartPosition || (settings.overlayPosition === 'smart' ? { x: 50, y: 50 } : null);
            
            if (debugPos) {
              const debugDot = document.createElement('div');
              debugDot.className = 'speakify-debug-dot';
              Object.assign(debugDot.style, {
                position: 'absolute',
                left: `${debugPos.x}%`,
                top: `${debugPos.y}%`,
                width: '12px',
                height: '12px',
                background: '#e74c3c',
                border: '2px solid #fff',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 8px rgba(231, 76, 60, 0.8)',
                zIndex: '9999',
                pointerEvents: 'none',
              });
              thumbnail.style.position = 'relative';
              thumbnail.appendChild(debugDot);
            }
          }
        }
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
