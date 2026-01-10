import { findThumbnails, markAsProcessed } from '@/features/thumbnail/finder';
import { applyOverlay, applyMultiOverlay } from '@/features/overlay/manager';
import { assetManager, getImageCount } from '@/shared/lib/assets/loader';
import { Logger } from '@/shared/lib/utils/logger';
import { analyzeForSmartPosition } from '@/features/smart-position/services/positionService';
import { showDebugIndicator } from '@/features/debug/indicator';
import { getRandomPosition } from '@/features/overlay/position';
import { GIANT_SPEAKI } from '@/shared/config/constants';
import type { SpeakifySettings } from '@/types/index';
import type { Randomizer } from '@/shared/lib/utils/randomizer';
import { ColorAnalysisService } from '@/features/color-analysis/services/colorAnalysisService';
import type { ColorStats } from '@/features/color-analysis/lib/colorMath';

/**
 * 썸네일 img 요소의 src URL을 가져옴 (동기)
 * img.src 또는 background-image CSS 속성 지원
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
  // background-image CSS 속성 (videowall 지원)
  const bgImage = thumbnail.style.backgroundImage;
  if (bgImage) {
    const regex = /url\(["']?([^"')]+)["']?\)/;
    const match = regex.exec(bgImage);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * 썸네일 img 요소의 src URL을 가져옴 (비동기 - lazy loading 대응)
 * YouTube의 lazy loading으로 인해 img.src가 아직 설정되지 않은 경우를 처리
 */
export async function getThumbnailImageUrlAsync(
  thumbnail: HTMLElement,
  maxWait: number = 1500,
): Promise<string | null> {
  // 먼저 동기적으로 시도
  const immediateUrl = getThumbnailImageUrl(thumbnail);
  if (immediateUrl) return immediateUrl;

  // img 요소 찾기 (본인이 img이거나 자식 img)
  const imgChild =
    thumbnail instanceof HTMLImageElement ? thumbnail : thumbnail.querySelector('img');

  // img가 없으면 background-image 폴링 시도 (videowall 등)
  if (!imgChild) {
    return new Promise((resolve) => {
      let elapsed = 0;
      const interval = 100;

      const check = () => {
        const url = getThumbnailImageUrl(thumbnail);
        if (url) {
          resolve(url);
          return;
        }
        elapsed += interval;
        if (elapsed >= maxWait) {
          resolve(null);
          return;
        }
        setTimeout(check, interval);
      };

      check();
    });
  }

  return new Promise((resolve) => {
    // 이미 src가 있으면 즉시 반환
    if (imgChild.src) {
      resolve(imgChild.src);
      return;
    }

    // MutationObserver로 src 변경 감지
    const observer = new MutationObserver(() => {
      if (imgChild.src) {
        observer.disconnect();
        resolve(imgChild.src);
      }
    });

    observer.observe(imgChild, { attributes: true, attributeFilter: ['src'] });

    // 타임아웃
    setTimeout(() => {
      observer.disconnect();
      resolve(imgChild.src || null);
    }, maxWait);
  });
}

/**
 * Applies overlay to all unprocessed thumbnails
 *
 * @param settings - Current settings
 * @param randomizer - Randomizer instance
 */
/**
 * Processes a single thumbnail element
 * @public - Export되어 ViewportObserver에서 사용
 */
export async function processSingleThumbnail(
  thumbnail: HTMLElement,
  settings: SpeakifySettings,
  randomizer: Randomizer,
  currentImageCount: number,
): Promise<void> {
  // Determine if Speaki should appear
  if (Math.random() > settings.appearChance) {
    // Only mark permanently if appearChance check fails
    // This allows re-checking on page navigation if new nodes appear
    // (though in current logic, marked nodes are ignored)
    markAsProcessed(thumbnail);
    return;
  }

  // Multi-Image Overlay (Random Mode)
  if (settings.overlayPosition === 'random') {
    await applyMultiOverlayMode(thumbnail, settings);
    return;
  }

  // Single Image Overlay (Center, Smart Mode)
  await applySingleOverlayMode(thumbnail, settings, randomizer, currentImageCount);
}

/**
 * Performs color analysis on the thumbnail image
 */
async function performColorAnalysis(
  thumbnail: HTMLElement,
  settings: SpeakifySettings,
  mode: 'random' | 'single',
): Promise<ColorStats | undefined> {
  // Use colorSync setting (default true)
  if (!settings.colorSync) return undefined;

  const thumbUrl = await getThumbnailImageUrlAsync(thumbnail);
  if (!thumbUrl) return undefined;

  try {
    return await ColorAnalysisService.getInstance().analyzeThumbnail(thumbUrl);
  } catch (e) {
    Logger.warn(`Color analysis failed for ${mode} mode`, e);
    return undefined;
  }
}

/**
 * Handles Multi-Image Overlay (Random Mode)
 */
async function applyMultiOverlayMode(
  thumbnail: HTMLElement,
  settings: SpeakifySettings,
): Promise<void> {
  const allImageAssets = assetManager.getAllImageAssets();
  if (allImageAssets.length === 0) {
    markAsProcessed(thumbnail);
    return;
  }

  const colorStats = await performColorAnalysis(thumbnail, settings, 'random');

  const result = applyMultiOverlay(
    thumbnail,
    allImageAssets,
    {
      countMin: settings.overlayCountMin,
      countMax: settings.overlayCountMax,
      sizeMin: settings.overlaySizeMin,
      sizeMax: settings.overlaySizeMax,
      flipChance: settings.flipChance,
      opacity: settings.overlayOpacity,
      colorSyncStrengthL: settings.colorSyncStrengthL,
      colorSyncStrengthAB: settings.colorSyncStrengthAB,
      rotationMin: settings.rotationMin,
      rotationMax: settings.rotationMax,
    },
    colorStats,
  );

  // Mark as processed AFTER successful overlay creation
  if (result.images.length > 0) {
    markAsProcessed(thumbnail);
  }

  // Debug mode indicator
  if (settings.debugMode) {
    Logger.debug('Multi-overlay applied', {
      count: result.images.length,
      colorSync: !!colorStats,
    });
    showDebugIndicator({
      thumbnail,
      overlayPosition: 'random',
      info: {
        mode: 'multi',
        instances: result.instances,
      },
    });
  }
}

/**
 * Handles Single Image Overlay (Center, Smart Mode)
 */
async function applySingleOverlayMode(
  thumbnail: HTMLElement,
  settings: SpeakifySettings,
  randomizer: Randomizer,
  currentImageCount: number,
): Promise<void> {
  const randomIndex = randomizer.getRandomIndex(currentImageCount);
  const imageAsset = assetManager.getRandomImage(randomIndex);
  const shouldFlip = Math.random() < settings.flipChance;

  // 랜덤 회전 각도 계산 (양방향: ±rotation)
  let randomRotation = 0;
  if (settings.rotationMax > 0) {
    const rotationRange = settings.rotationMax - settings.rotationMin;
    const baseRotation = settings.rotationMin + Math.random() * rotationRange;
    randomRotation = Math.random() < 0.5 ? baseRotation : -baseRotation;
  }

  let randomSize =
    settings.overlaySizeMin + Math.random() * (settings.overlaySizeMax - settings.overlaySizeMin);

  // Giant Speaki logic (Big folder images)
  if (imageAsset.folder === 'big') {
    const isGiant = Math.random() < GIANT_SPEAKI.CHANCE;
    if (isGiant) {
      Logger.debug('Giant Speaki appeared! (3% chance)');
    } else {
      randomSize *= GIANT_SPEAKI.BIG_FOLDER_SIZE_RATIO;
    }
  }

  // Smart Position Analysis (새 알고리즘 적용)
  let smartPosition: { x: number; y: number; densityMap?: number[][] } | undefined;
  if (settings.overlayPosition === 'smart') {
    smartPosition = await getSmartPosition(thumbnail);
  }

  const colorStats = await performColorAnalysis(thumbnail, settings, 'single');

  Logger.debug('Image selected', {
    folder: imageAsset.folder,
    index: imageAsset.index,
    size: Math.round(randomSize),
    rotation: randomRotation,
    colorSync: !!colorStats,
  });

  applyOverlay(
    thumbnail,
    imageAsset.url,
    {
      flip: shouldFlip,
      position: settings.overlayPosition,
      size: randomSize,
      opacity: settings.overlayOpacity,
      rotation: randomRotation,
      smartPosition,
    },
    colorStats,
    settings.colorSyncStrengthL,
    settings.colorSyncStrengthAB,
  );

  // Mark as processed AFTER successful overlay
  markAsProcessed(thumbnail);

  // Debug mode indicator
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
        rotation: randomRotation,
        densityMap: smartPosition?.densityMap,
      },
    });
  }
}

/**
 * Calculates smart position for the overlay using new v2 algorithm
 * 텍스트 감지 기반 스마트 위치 계산
 */
async function getSmartPosition(
  thumbnail: HTMLElement,
): Promise<{ x: number; y: number; densityMap?: number[][] } | undefined> {
  // 비동기로 URL 가져오기 (lazy loading 대응 - 3초 대기)
  const thumbnailUrl = await getThumbnailImageUrlAsync(thumbnail, 3000);

  if (!thumbnailUrl) {
    Logger.debug('Smart position: No thumbnail URL available');
    return undefined;
  }

  try {
    const startTime = performance.now();
    // sensitivity는 내부적으로 고정 (0.7)
    const analysisPromise = analyzeForSmartPosition(thumbnailUrl);
    // 타임아웃을 2초로 증가 (동시 요청 시 병목 대응)
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000));
    const analysis = await Promise.race([analysisPromise, timeoutPromise]);

    const elapsed = performance.now() - startTime;

    if (analysis && analysis.confidence > 0) {
      Logger.debug('Smart position v2 analyzed', {
        url: thumbnailUrl.substring(0, 50),
        position: { x: analysis.x, y: analysis.y },
        confidence: analysis.confidence.toFixed(2),
        elapsed: `${elapsed.toFixed(0)}ms`,
      });
      return { x: analysis.x, y: analysis.y, densityMap: analysis.densityMap };
    }

    Logger.warn('Smart analysis timeout or low confidence', {
      url: thumbnailUrl.substring(0, 50),
      elapsed: `${elapsed.toFixed(0)}ms`,
    });
    const fallback = getRandomPosition(20);
    return { x: fallback.x, y: fallback.y };
  } catch (error) {
    Logger.warn('Smart analysis failed, using random fallback', {
      error: error instanceof Error ? error.message : String(error),
    });
    const fallback = getRandomPosition(20);
    return { x: fallback.x, y: fallback.y };
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
