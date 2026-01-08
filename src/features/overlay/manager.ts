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
        transform: '',
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
export function applyOverlay(
  thumbnailElement: HTMLElement,
  overlayImageURL: string,
  options: OverlayOptions = {},
): HTMLImageElement | null {
  if (!overlayImageURL) return null;

  const { flip = false, position = 'center', size = 100, opacity = 1, smartPosition } = options;

  const overlayImage = document.createElement('img');
  overlayImage.id = EXTENSION_NAME;
  overlayImage.src = overlayImageURL;

  // Get position-specific styles
  const posStyles = getPositionStyles(position, size, smartPosition);

  // Calculate size (center와 random 모두 전체 크기 사용)
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
    // 이미지 품질 최적화
    imageRendering: 'auto',
  });

  // 이미지 로드 후 maxWidth/maxHeight를 원본 크기로 제한 (화질 저하 방지)
  overlayImage.onload = () => {
    overlayImage.style.maxWidth = `${overlayImage.naturalWidth}px`;
    overlayImage.style.maxHeight = `${overlayImage.naturalHeight}px`;
  };

  const parent = thumbnailElement.parentElement;
  if (parent) {
    parent.insertBefore(overlayImage, thumbnailElement.nextSibling);
    return overlayImage;
  }

  return null;
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
 *
 * @param thumbnailElement 썸네일 요소
 * @param imageAssets 사용 가능한 이미지 에셋 배열 (folder/index 포함)
 * @param options 멀티 오버레이 옵션
 * @returns 생성된 이미지 요소 배열과 인스턴스 메타데이터
 */
export function applyMultiOverlay(
  thumbnailElement: HTMLElement,
  imageAssets: ImageAsset[],
  options: MultiOverlayOptions,
): MultiOverlayResult {
  const { countMin, countMax, sizeMin, sizeMax, flipChance, opacity } = options;

  // 1. 랜덤 이미지 개수 결정 (min ~ max)
  const imageCount = Math.floor(Math.random() * (countMax - countMin + 1)) + countMin;

  // 2. 겹치지 않는 위치들 생성
  const positions = generateNonOverlappingPositions(imageCount, 15, 50, 10);

  // 3. 각 이미지에 대해 독립적인 인스턴스 생성
  const instances: OverlayInstance[] = positions.map((pos) => {
    // 랜덤 이미지 에셋 선택
    const asset = imageAssets[Math.floor(Math.random() * imageAssets.length)];

    // 독립적인 크기 (sizeMin ~ sizeMax)
    const size = Math.floor(Math.random() * (sizeMax - sizeMin + 1)) + sizeMin;

    // 독립적인 반전 여부
    const flip = Math.random() < flipChance;

    return {
      imageUrl: asset.url,
      folder: asset.folder,
      index: asset.index,
      size,
      flip,
      position: pos,
      opacity,
    };
  });

  // 4. 각 인스턴스를 DOM에 적용
  const createdImages: HTMLImageElement[] = [];

  instances.forEach((instance, index) => {
    const overlayImage = document.createElement('img');
    overlayImage.id = `${EXTENSION_NAME}-multi-${index}`;
    overlayImage.src = instance.imageUrl;

    // 스타일 적용
    let transformStyle = '';
    if (instance.flip) {
      transformStyle = 'scaleX(-1)';
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

    // 이미지 품질 최적화
    overlayImage.onload = () => {
      overlayImage.style.maxWidth = `${overlayImage.naturalWidth}px`;
      overlayImage.style.maxHeight = `${overlayImage.naturalHeight}px`;
    };

    const parent = thumbnailElement.parentElement;
    if (parent) {
      parent.insertBefore(overlayImage, thumbnailElement.nextSibling);
      createdImages.push(overlayImage);
    }
  });

  return { images: createdImages, instances };
}
