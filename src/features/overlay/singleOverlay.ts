/**
 * YouTube Speakify - Single Overlay Module
 * 단일 이미지 오버레이 적용 로직
 *
 * @module features/overlay/singleOverlay
 */

import { getRandomPosition } from '@/features/overlay/position';
import { ColorAnalysisService } from '@/features/color-analysis/services/colorAnalysisService';
import type { ColorStats } from '@/features/color-analysis/lib/colorMath';
import type { OverlayPosition } from '@/types/index';
import { EXTENSION_NAME } from '@/shared/config/constants';
import { Logger } from '@/shared/lib/utils/logger';

// ============================================================
// Types
// ============================================================

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

// ============================================================
// Internal Helpers
// ============================================================

/**
 * Gets CSS styles based on position setting
 */
export function getPositionStyles(
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

// ============================================================
// Main Export
// ============================================================

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
          Logger.info('[SingleOverlay] Progressive update: applying color sync');
          overlayImage.src = transformedUrl;
        }
      })
      .catch((err) => {
        Logger.warn('[SingleOverlay] Color transformation failed:', err);
        // Keep original - already set
      });
  }

  return overlayImage;
}
