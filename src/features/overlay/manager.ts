/**
 * YouTube Speakify - Overlay Manager Module
 * Applies Speaki images over YouTube thumbnails.
 */

import { getRandomPosition } from '@/features/overlay/position';
import type { OverlayPosition, OverlayInstance } from '@/types/index';
import { EXTENSION_NAME } from '@/shared/config/constants';

/**
 * Options for applying an overlay
 */
export interface OverlayOptions {
  flip?: boolean;
  position?: OverlayPosition;
  size?: number;
  opacity?: number;
  /** 스마트 분석으로 계산된 위치 (% 단위) */
  smartPosition?: { x: number; y: number };
}

/**
 * Gets CSS styles based on position setting
 */
function getPositionStyles(
  position: OverlayPosition,
  size: number = 100,
  smartPosition?: { x: number; y: number },
): Record<string, string> {
  const base = {
    position: 'absolute',
    zIndex: '0',
    pointerEvents: 'none',
  };

  switch (position) {
    case 'smart': {
      // 스마트 분석 결과가 있으면 해당 위치 사용, 없으면 center fallback
      if (smartPosition) {
        return {
          ...base,
          top: `${smartPosition.y}%`,
          left: `${smartPosition.x}%`,
          bottom: 'auto',
          right: 'auto',
          transform: 'translate(-50%, -50%)',
        };
      }
      // Fallback to center (디버깅 용이)
      return {
        ...base,
        top: '50%',
        left: '50%',
        bottom: 'auto',
        right: 'auto',
        transform: 'translate(-50%, -50%)',
      };
    }
    case 'random': {
      // 가중치 기반 랜덤 위치 생성 (하단 선호, 좌하단 회피)
      const randomPos = getRandomPosition(size);
      return {
        ...base,
        top: `${randomPos.y}%`,
        left: `${randomPos.x}%`,
        bottom: 'auto',
        right: 'auto',
        transform: 'translate(-50%, -50%)',
      };
    }
    case 'center':
    default:
      return {
        ...base,
        top: '50%',
        left: '50%',
        bottom: 'auto',
        right: 'auto',
        transform: 'translate(-50%, -50%)',
      };
  }
}

/**
 * Applies an overlay image to a thumbnail element
 */

import { ColorAnalysisService } from '@/features/color-analysis/services/colorAnalysisService';
import type { ColorStats } from '@/features/color-analysis/lib/colorMath';

/**
 * Applies an overlay image to a thumbnail element
 * Uses Progressive Enhancement: shows original immediately, updates when transform completes
 */
export function applyOverlay(
  thumbnailElement: HTMLElement,
  overlayImageURL: string,
  options: OverlayOptions = {},
  colorStats?: ColorStats,
  strengthL?: number,
  strengthAB?: number,
): HTMLImageElement | null {
  if (!overlayImageURL) return null;

  const { flip = false, position = 'center', size = 100, opacity = 1, smartPosition } = options;

  // Create overlay element immediately with original image
  const overlayImage = document.createElement('img');
  overlayImage.id = EXTENSION_NAME;
  overlayImage.src = overlayImageURL; // Start with original

  // Get position-specific styles
  const posStyles = getPositionStyles(position, size, smartPosition);

  // Calculate size
  const sizeStyle = `${size}%`;

  // Build transform with flip if needed
  let transformStyle = posStyles.transform || '';
  if (flip) {
    transformStyle += ' scaleX(-1)';
  }

  // Apply all styles
  Object.assign(overlayImage.style, {
    position: posStyles.position,
    top: posStyles.top,
    left: posStyles.left,
    bottom: posStyles.bottom,
    right: posStyles.right,
    transform: transformStyle.trim(),
    width: sizeStyle,
    opacity: opacity.toString(),
    zIndex: posStyles.zIndex,
    pointerEvents: posStyles.pointerEvents,
    imageRendering: 'auto',
  });

  // 이미지 로드 후 maxWidth/maxHeight를 원본 크기로 제한
  overlayImage.onload = () => {
    overlayImage.style.maxWidth = `${overlayImage.naturalWidth}px`;
    overlayImage.style.maxHeight = `${overlayImage.naturalHeight}px`;
  };

  const parent = thumbnailElement.parentElement;
  if (parent) {
    parent.insertBefore(overlayImage, thumbnailElement.nextSibling);
  } else {
    return null;
  }

  // Progressive Enhancement: Apply color transformation in background
  if (colorStats) {
    // Don't await - let it run in background
    ColorAnalysisService.getInstance()
      .getTransformedBlobUrl(overlayImageURL, colorStats, strengthL, strengthAB)
      .then((transformedUrl) => {
        if (transformedUrl !== overlayImageURL) {
          Logger.info('[OverlayManager] Progressive update: applying color sync');
          overlayImage.src = transformedUrl;
        }
      })
      .catch((err) => {
        Logger.warn('[OverlayManager] Color transformation failed:', err);
        // Keep original - already set
      });
  }

  return overlayImage;
}

/**
 * Checks if an element has already been processed
 */
export function isAlreadyProcessed(element: HTMLElement): boolean {
  const parent = element.parentElement;
  if (!parent) return false;

  return Array.from(parent.children).some((child) => child.id?.includes(EXTENSION_NAME));
}

/**
 * Get the extension marker ID
 */
export function getExtensionName(): string {
  return EXTENSION_NAME;
}

// ==================== Multi-Image Overlay ====================

import { generateNonOverlappingPositions } from '@/features/overlay/collision';
import { Logger } from '@/shared/lib/utils/logger';

/**
 * Multi-Image Overlay 옵션
 */
export interface MultiOverlayOptions {
  countMin: number;
  countMax: number;
  sizeMin: number;
  sizeMax: number;
  flipChance: number;
  opacity: number;
  colorSyncStrengthL?: number; // 밝기(조명) 강도 (0-1)
  colorSyncStrengthAB?: number; // 색조(틴트) 강도 (0-1)
}

/**
 * Multi Overlay 결과 타입 (디버그 정보 포함)
 */
export interface MultiOverlayResult {
  images: HTMLImageElement[];
  instances: OverlayInstance[];
}

/**
 * 이미지 에셋 타입 (디버그 정보 포함)
 */
export interface ImageAsset {
  folder: 'small' | 'big';
  index: number;
  url: string;
}

/**
 * 다중 이미지 오버레이 적용 (Random 모드 전용)
 * 각 이미지는 독립적인 크기, 위치, 반전 속성을 가짐
 * Progressive Enhancement: 원본 이미지를 먼저 표시하고, 색상 변환 완료 시 교체
 * colorStats가 없으면 내부에서 분석 시도
 */
/**
 * Helper: Extracts thumbnail URL from element
 */
function extractThumbnailUrl(element: HTMLElement): string | null {
  if (element instanceof HTMLImageElement && element.src) {
    return element.src;
  }
  const imgChild = element.querySelector('img');
  if (imgChild?.src) {
    return imgChild.src;
  }
  // background-image CSS property (videowall support)
  const bgImage = element.style.backgroundImage;
  if (bgImage) {
    const match = /url\(["']?([^"')]+)["']?\)/.exec(bgImage);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Helper: Creates and appends a single overlay image instance
 */
function createSingleMultiOverlayImage(
  thumbnailElement: HTMLElement,
  instance: OverlayInstance,
  index: number,
  options: MultiOverlayOptions,
  colorStats?: ColorStats,
): HTMLImageElement | null {
  const overlayImage = document.createElement('img');
  overlayImage.id = `${EXTENSION_NAME}-multi-${index}`;
  overlayImage.src = instance.imageUrl; // Start with original

  const transformStyle = instance.flip
    ? 'translate(-50%, -50%) scaleX(-1)'
    : 'translate(-50%, -50%)';

  Object.assign(overlayImage.style, {
    position: 'absolute',
    top: `${instance.position.y}%`,
    left: `${instance.position.x}%`,
    width: `${instance.size}%`,
    opacity: (instance.opacity ?? 1).toString(),
    transform: transformStyle,
    zIndex: '0',
    pointerEvents: 'none',
    imageRendering: 'auto',
  });

  overlayImage.onload = () => {
    overlayImage.style.maxWidth = `${overlayImage.naturalWidth}px`;
    overlayImage.style.maxHeight = `${overlayImage.naturalHeight}px`;
  };

  const parent = thumbnailElement.parentElement;
  if (!parent) return null;

  parent.insertBefore(overlayImage, thumbnailElement.nextSibling);

  // Progressive Enhancement: Apply color transformation in background
  const applyColorSync = async (stats: ColorStats) => {
    try {
      const transformedUrl = await ColorAnalysisService.getInstance().getTransformedBlobUrl(
        instance.imageUrl,
        stats,
        options.colorSyncStrengthL,
        options.colorSyncStrengthAB,
      );
      if (transformedUrl !== instance.imageUrl) {
        overlayImage.src = transformedUrl;
      }
    } catch (error) {
      Logger.warn('[OverlayManager] Color transformation failed:', error);
      // Keep original
    }
  };

  // Analyze thumbnail and apply Color Sync
  const analyzeAndApply = (url: string) => {
    ColorAnalysisService.getInstance()
      .analyzeThumbnail(url)
      .then(applyColorSync)
      .catch((error) => {
        Logger.warn('[OverlayManager] Thumbnail analysis failed:', error);
        /* Keep original */
      });
  };

  if (colorStats) {
    applyColorSync(colorStats);
  } else {
    // Fallback: Analyze thumbnail internally
    const thumbUrl = extractThumbnailUrl(thumbnailElement);
    if (thumbUrl) {
      analyzeAndApply(thumbUrl);
    } else {
      // Lazy Color Sync: Wait for img.src to become available
      const imgChild =
        thumbnailElement instanceof HTMLImageElement
          ? thumbnailElement
          : thumbnailElement.querySelector('img');

      if (imgChild) {
        const observer = new MutationObserver(() => {
          if (imgChild.src) {
            observer.disconnect();
            analyzeAndApply(imgChild.src);
          }
        });
        observer.observe(imgChild, { attributes: true, attributeFilter: ['src'] });

        // Timeout after 3 seconds to avoid memory leak
        setTimeout(() => observer.disconnect(), 3000);
      }
    }
  }

  return overlayImage;
}

export function applyMultiOverlay(
  thumbnailElement: HTMLElement,
  imageAssets: ImageAsset[],
  options: MultiOverlayOptions,
  colorStats?: ColorStats,
): MultiOverlayResult {
  const { countMin, countMax, sizeMin, sizeMax, flipChance, opacity } = options;

  // 1. 랜덤 이미지 개수 결정 (min ~ max)
  const imageCount = Math.floor(Math.random() * (countMax - countMin + 1)) + countMin;

  // 2. 겹치지 않는 위치들 생성
  const positions = generateNonOverlappingPositions(imageCount, 15, 50, 10);

  // 3. 각 이미지에 대해 독립적인 인스턴스 생성
  const instances: OverlayInstance[] = positions.map((pos) => {
    const asset = imageAssets[Math.floor(Math.random() * imageAssets.length)];
    let size = Math.floor(Math.random() * (sizeMax - sizeMin + 1)) + sizeMin;
    const flip = Math.random() < flipChance;
    let isGiant = false;

    // Giant Speaki 이스터에그: Big 폴더 이미지는 40% 크기, 3% 확률로 원본 크기
    if (asset.folder === 'big') {
      isGiant = Math.random() < 0.03;
      if (!isGiant) {
        size = Math.floor(size * 0.4);
      }
    }

    return {
      imageUrl: asset.url,
      folder: asset.folder,
      index: asset.index,
      size,
      flip,
      position: pos,
      opacity,
      isGiant,
    };
  });

  // 4. 각 인스턴스를 DOM에 적용 (Progressive Enhancement)
  const createdImages: HTMLImageElement[] = [];

  instances.forEach((instance, index) => {
    const img = createSingleMultiOverlayImage(
      thumbnailElement,
      instance,
      index,
      options,
      colorStats,
    );
    if (img) {
      createdImages.push(img);
    }
  });

  return { images: createdImages, instances };
}
