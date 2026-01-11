/**
 * YouTube Speakify - Multi Overlay Module
 * 다중 이미지 오버레이 적용 로직 (Random 모드 전용)
 *
 * @module features/overlay/multiOverlay
 */

import { generateNonOverlappingPositions } from '@/features/overlay/collision';
import {
  extractThumbnailUrl,
  applyColorSyncToImage,
  analyzeAndApplyColorSync,
  setupLazyColorSync,
} from '@/features/overlay/colorSyncHelper';
import type { ColorStats } from '@/features/color-analysis/lib/colorMath';
import type { OverlayInstance } from '@/types/index';
import { EXTENSION_NAME, GIANT_SPEAKI } from '@/shared/config/constants';

// ============================================================
// Types
// ============================================================

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
  rotationMin?: number; // 기울기 최소값 (0-180)
  rotationMax?: number; // 기울기 최대값 (0-180)
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

// ============================================================
// Internal Helpers
// ============================================================

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

  // Build transform with flip and rotation
  let transformStyle = 'translate(-50%, -50%)';
  if (instance.flip) {
    transformStyle += ' scaleX(-1)';
  }
  if (instance.rotation && instance.rotation !== 0) {
    transformStyle += ` rotate(${instance.rotation}deg)`;
  }

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

  // Determine container and injection method
  let container: HTMLElement;
  const isImgTag = thumbnailElement.tagName === 'IMG';

  if (isImgTag) {
    // If IMG, use parent as container
    container = thumbnailElement.parentElement!;
  } else {
    // If not IMG (e.g. DIV videowall), use itself as container
    container = thumbnailElement;
  }

  if (!container) return null;

  // Apply overflow hidden to container to clip overlay
  container.style.overflow = 'hidden';

  // Append overlay
  container.appendChild(overlayImage);

  // Progressive Enhancement: Apply color sync
  const colorSyncOptions = {
    strengthL: options.colorSyncStrengthL,
    strengthAB: options.colorSyncStrengthAB,
  };

  if (colorStats) {
    applyColorSyncToImage(overlayImage, instance.imageUrl, colorStats, colorSyncOptions);
  } else {
    // Fallback: Analyze thumbnail internally
    const thumbUrl = extractThumbnailUrl(thumbnailElement);
    if (thumbUrl) {
      analyzeAndApplyColorSync(overlayImage, thumbUrl, instance.imageUrl, colorSyncOptions);
    } else {
      // Lazy Color Sync: Wait for img.src to become available
      setupLazyColorSync(overlayImage, thumbnailElement, instance.imageUrl, colorSyncOptions);
    }
  }

  return overlayImage;
}

// ============================================================
// Main Export
// ============================================================

/**
 * 다중 이미지 오버레이 적용 (Random 모드 전용)
 * 각 이미지는 독립적인 크기, 위치, 반전 속성을 가짐
 * Progressive Enhancement: 원본 이미지를 먼저 표시하고, 색상 변환 완료 시 교체
 */
export function applyMultiOverlay(
  thumbnailElement: HTMLElement,
  imageAssets: ImageAsset[],
  options: MultiOverlayOptions,
  colorStats?: ColorStats,
): MultiOverlayResult {
  const {
    countMin,
    countMax,
    sizeMin,
    sizeMax,
    flipChance,
    opacity,
    rotationMin = 0,
    rotationMax = 0,
  } = options;

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

    // 랜덤 회전 각도 계산 (양방향: ±rotation)
    let rotation = 0;
    if (rotationMax > 0) {
      const rotationRange = rotationMax - rotationMin;
      const baseRotation = rotationMin + Math.random() * rotationRange;
      rotation = Math.random() < 0.5 ? baseRotation : -baseRotation;
    }

    // Giant Speaki 이스터에그: Big 폴더 이미지는 40% 크기, 3% 확률로 원본 크기
    if (asset.folder === 'big') {
      isGiant = Math.random() < GIANT_SPEAKI.CHANCE;
      if (!isGiant) {
        size = Math.floor(size * GIANT_SPEAKI.BIG_FOLDER_SIZE_RATIO);
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
      rotation,
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
