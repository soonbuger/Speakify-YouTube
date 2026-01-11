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
  /** 회전 각도 (degrees) */
  rotation?: number;
  /** 스마트 분석으로 계산된 위치 (% 단위) */
  smartPosition?: { x: number; y: number };
}

// ============================================================
// Internal Helpers
// ============================================================

/**
 * 3x3 그리드 영역 내에서 중앙 가중치를 적용한 랜덤 위치 생성
 * @param cellX 가로 셀 인덱스 (0, 1, 2)
 * @param cellY 세로 셀 인덱스 (0, 1, 2)
 * @returns 해당 영역 내의 랜덤 위치 (%)
 */
function getCornerPosition(cellX: number, cellY: number): { x: number; y: number } {
  const cellSize = 100 / 3; // 33.33%

  // 셀 영역의 시작점
  const startX = cellX * cellSize;
  const startY = cellY * cellSize;

  // 셀 중앙
  const centerX = startX + cellSize / 2;
  const centerY = startY + cellSize / 2;

  // 가우시안 분포로 중앙 가중치 적용 (stdDev = 셀크기/3)
  const stdDev = cellSize / 3;

  // Box-Muller 변환으로 가우시안 랜덤
  const u1 = Math.random();
  const u2 = Math.random();
  const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

  // 중앙 기준 가우시안 분포 + 경계 클램프
  const x = Math.max(startX + 5, Math.min(startX + cellSize - 5, centerX + z1 * stdDev));
  const y = Math.max(startY + 5, Math.min(startY + cellSize - 5, centerY + z2 * stdDev));

  return { x, y };
}

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
      // 스마트 분석 결과가 있으면 해당 위치 사용, 없으면 random fallback
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
      // Fallback to random position (분석 실패 시)
      const fallbackPos = getRandomPosition(size);
      return {
        ...base,
        top: `${fallbackPos.y}%`,
        left: `${fallbackPos.x}%`,
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
    // 4개 코너 위치: 해당 영역(33%) 내에서 중앙 가중치 랜덤
    case 'top-left': {
      const pos = getCornerPosition(0, 0); // 영역 1 (0~33%, 0~33%)
      return {
        ...base,
        top: `${pos.y}%`,
        left: `${pos.x}%`,
        bottom: 'auto',
        right: 'auto',
        transform: 'translate(-50%, -50%)',
      };
    }
    case 'top-right': {
      const pos = getCornerPosition(2, 0); // 영역 3 (66~100%, 0~33%)
      return {
        ...base,
        top: `${pos.y}%`,
        left: `${pos.x}%`,
        bottom: 'auto',
        right: 'auto',
        transform: 'translate(-50%, -50%)',
      };
    }
    case 'bottom-left': {
      const pos = getCornerPosition(0, 2); // 영역 7 (0~33%, 66~100%)
      return {
        ...base,
        top: `${pos.y}%`,
        left: `${pos.x}%`,
        bottom: 'auto',
        right: 'auto',
        transform: 'translate(-50%, -50%)',
      };
    }
    case 'bottom-right': {
      const pos = getCornerPosition(2, 2); // 영역 9 (66~100%, 66~100%)
      return {
        ...base,
        top: `${pos.y}%`,
        left: `${pos.x}%`,
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

  const {
    flip = false,
    position = 'center',
    size = 100,
    opacity = 1,
    rotation = 0,
    smartPosition,
  } = options;

  // Create overlay element immediately with original image
  const overlayImage = document.createElement('img');
  overlayImage.id = EXTENSION_NAME;
  overlayImage.src = overlayImageURL; // Start with original

  // Get position-specific styles
  const posStyles = getPositionStyles(position, size, smartPosition);

  // Calculate size
  const sizeStyle = `${size}%`;

  // Build transform with flip and rotation
  let transformStyle = posStyles.transform || '';
  if (flip) {
    transformStyle += ' scaleX(-1)';
  }
  if (rotation !== 0) {
    transformStyle += ` rotate(${rotation}deg)`;
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
  // This prevents overlay from sticking out of rounded corners
  container.style.overflow = 'hidden';

  // Append overlay (using appendChild to ensure it's on top of existing content)
  container.appendChild(overlayImage);

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
