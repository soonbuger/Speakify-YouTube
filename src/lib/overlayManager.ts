/**
 * YouTube Speakify - Overlay Manager Module
 * Applies Speaki images over YouTube thumbnails.
 */
import type { OverlayPosition } from './storage';
import { EXTENSION_NAME } from './constants';

/**
 * Options for applying an overlay
 */
export interface OverlayOptions {
  flip?: boolean;
  position?: OverlayPosition;
  size?: number;
  opacity?: number;
}

/**
 * Gets CSS styles based on position setting
 */
function getPositionStyles(position: OverlayPosition): Record<string, string> {
  const base = {
    position: 'absolute',
    zIndex: '0',
    pointerEvents: 'none',
  };

  switch (position) {
    case 'bottom-right':
      return {
        ...base,
        bottom: '8px',
        right: '8px',
        top: 'auto',
        left: 'auto',
        transform: '',
      };
    case 'bottom-left':
      return {
        ...base,
        bottom: '8px',
        left: '8px',
        top: 'auto',
        right: 'auto',
        transform: '',
      };
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

  const { flip = false, position = 'center', size = 100, opacity = 1 } = options;

  const overlayImage = document.createElement('img');
  overlayImage.id = EXTENSION_NAME;
  overlayImage.src = overlayImageURL;

  // Get position-specific styles
  const posStyles = getPositionStyles(position);

  // Calculate size based on position
  const sizeStyle = position === 'center' ? `${size}%` : `${Math.max(20, size * 0.5)}%`;

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
    maxWidth: '256px', // 최대 크기 제한 (원본 2배까지만 확대)
    opacity: opacity.toString(),
    zIndex: posStyles.zIndex,
    pointerEvents: posStyles.pointerEvents,
    // 이미지 품질 최적화
    imageRendering: 'auto',
  });

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

  return Array.from(parent.children).some((child) => child.id && child.id.includes(EXTENSION_NAME));
}

/**
 * Get the extension marker ID
 */
export function getExtensionName(): string {
  return EXTENSION_NAME;
}
