/**
 * YouTube Speakify - Overlay Manager Module
 * Applies Speaki images over YouTube thumbnails.
 */

import { getRandomPosition } from '@/features/overlay/position';
import type { OverlayPosition } from '@/types/index';
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
  smartPosition?: { x: number; y: number }
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
  options: OverlayOptions = {}
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
