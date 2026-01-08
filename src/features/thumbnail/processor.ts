import { findThumbnails, markAsProcessed } from '@/features/thumbnail/finder';
import { applyOverlay, applyMultiOverlay } from '@/features/overlay/manager';
import { assetManager, getImageCount } from '@/shared/lib/assets/loader';
import { Logger } from '@/shared/lib/utils/logger';
import { analyzeImageForPlacement } from '@/features/thumbnail/analyzer';
import { showDebugIndicator } from '@/features/debug/indicator';
import type { SpeakifySettings } from '@/types/index';
import type { Randomizer } from '@/shared/lib/utils/randomizer';

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
  if (imgChild?.src) {
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
/**
 * Processes a single thumbnail element
 */
async function processSingleThumbnail(
  thumbnail: HTMLElement,
  settings: SpeakifySettings,
  randomizer: Randomizer,
  currentImageCount: number,
): Promise<void> {
  // 중복 처리 방지: 발견 즉시 처리 완료 표시
  markAsProcessed(thumbnail);

  // Determine if Speaki should appear
  if (Math.random() > settings.appearChance) return;

  // ==================== Multi-Image Overlay (Random 모드 전용) ====================
  if (settings.overlayPosition === 'random') {
    const allImageAssets = assetManager.getAllImageAssets();
    if (allImageAssets.length === 0) return;

    const result = applyMultiOverlay(thumbnail, allImageAssets, {
      countMin: settings.overlayCountMin,
      countMax: settings.overlayCountMax,
      sizeMin: settings.overlaySizeMin,
      sizeMax: settings.overlaySizeMax,
      flipChance: settings.flipChance,
      opacity: settings.overlayOpacity,
    });

    // 디버그 모드: 통합 디버그 함수 사용 (단일 모드와 동일한 포맷)
    if (settings.debugMode) {
      Logger.debug('Multi-overlay applied', { count: result.images.length });
      showDebugIndicator({
        thumbnail,
        overlayPosition: 'random',
        info: {
          mode: 'multi',
          instances: result.instances,
        },
      });
    }
    return;
  }

  // ==================== Single Image Overlay (Center, Smart 모드) ====================
  const randomIndex = randomizer.getRandomIndex(currentImageCount);
  const imageAsset = assetManager.getRandomImage(randomIndex);

  // Determine if image should be flipped
  const shouldFlip = Math.random() < settings.flipChance;

  // 크기 범위 내에서 랜덤 값 생성
  let randomSize =
    settings.overlaySizeMin + Math.random() * (settings.overlaySizeMax - settings.overlaySizeMin);

  // big 폴더 이미지는 너무 크므로 0.4배 축소 (단, 3% 확률로 거대 Speaki 등장)
  if (imageAsset.folder === 'big') {
    const isGiant = Math.random() < 0.03;
    if (isGiant) {
      Logger.debug('Giant Speaki appeared! (3% chance)');
    } else {
      randomSize *= 0.4;
    }
  }

  // 스마트 위치 분석
  let smartPosition: { x: number; y: number } | undefined;
  if (settings.overlayPosition === 'smart') {
    smartPosition = await getSmartPosition(thumbnail);
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

  // 디버그 모드: 분석 위치 표시
  if (settings.debugMode) {
    showDebugIndicator({
      thumbnail,
      smartPosition,
      overlayPosition: settings.overlayPosition,
      info: {
        mode: 'single',
        folder: imageAsset.folder,
        index: imageAsset.index,
        size: randomSize,
      },
    });
  }
}

/**
 * Calculates smart position for the overlay
 */
async function getSmartPosition(
  thumbnail: HTMLElement,
): Promise<{ x: number; y: number } | undefined> {
  const thumbnailUrl = getThumbnailImageUrl(thumbnail);
  if (!thumbnailUrl) return undefined;

  try {
    const analysisPromise = analyzeImageForPlacement(thumbnailUrl);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 500));
    const analysis = await Promise.race([analysisPromise, timeoutPromise]);

    if (analysis) {
      Logger.debug('Smart position analyzed', {
        url: thumbnailUrl.substring(0, 50),
        position: analysis.bestPosition,
      });
      return analysis.bestPosition;
    }

    Logger.debug('Smart analysis timeout, using center fallback');
    return { x: 50, y: 50 };
  } catch (error) {
    Logger.warn('Smart analysis failed, using center fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { x: 50, y: 50 };
  }
}

export async function applyOverlayToThumbnails(
  settings: SpeakifySettings,
  randomizer: Randomizer,
  roots: (Document | HTMLElement)[] = [document],
): Promise<void> {
  if (!settings.extensionEnabled) return;

  const currentImageCount = getImageCount();
  if (currentImageCount === 0) return;

  // Flatten found thumbnails from all roots (Set으로 중복 제거)
  const thumbnailSet = new Set<HTMLElement>();
  roots.forEach((root) => {
    findThumbnails(root).forEach((thumb) => thumbnailSet.add(thumb));
  });

  const thumbnails = Array.from(thumbnailSet);

  await Promise.all(
    thumbnails.map((thumbnail) =>
      processSingleThumbnail(thumbnail, settings, randomizer, currentImageCount),
    ),
  );
}
