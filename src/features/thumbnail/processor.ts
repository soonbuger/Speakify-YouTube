import { findThumbnails, markAsProcessed } from '@/lib/thumbnailFinder';
import { applyOverlay } from '@/lib/overlayManager';
import { assetManager, getImageCount } from '@/lib/assetLoader';
import { Logger } from '@/lib/logger';
import { analyzeImageForPlacement } from '@/lib/canvasAnalyzer';
import type { SpeakifySettings } from '@/types/index';
import type { Randomizer } from '@/lib/randomizer';

/**
 * 썸네일 img 요소의 src URL을 가져옴
 */
export function getThumbnailImageUrl(thumbnail: HTMLElement): string | null {
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
 * 
 * @param settings - Current settings
 * @param randomizer - Randomizer instance
 */
export async function applyOverlayToThumbnails(
  settings: SpeakifySettings,
  randomizer: Randomizer
): Promise<void> {
  if (!settings.extensionEnabled) return;

  // 이미지 탐지가 완료되지 않았으면 건너뛰기
  const currentImageCount = getImageCount();
  if (currentImageCount === 0) return;

  const thumbnails = findThumbnails();

  // 병렬 처리를 위해 Promise.all 사용 (비동기 작업 중 다른 썸네일 처리가 지연되지 않도록 함)
  await Promise.all(
    thumbnails.map(async (thumbnail) => {
      // 중복 처리 방지: 발견 즉시 처리 완료 표시 (확률 탈락해도 다시 처리하지 않음)
      markAsProcessed(thumbnail);

      // Determine if Speaki should appear
      if (Math.random() > settings.appearChance) return;

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
        const debugPos =
          smartPosition || (settings.overlayPosition === 'smart' ? { x: 50, y: 50 } : null);

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
    })
  );
}
