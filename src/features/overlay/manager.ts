/**
 * YouTube Speakify - Overlay Manager Module (Facade)
 * Applies Speaki images over YouTube thumbnails.
 *
 * @module features/overlay/manager
 *
 * 이 파일은 하위 모듈들을 re-export하는 facade입니다.
 * 기존 import 경로와의 호환성을 유지합니다.
 */

import { EXTENSION_NAME } from '@/shared/config/constants';

// ============================================================
// Re-exports from sub-modules
// ============================================================

// Single Overlay
export { applyOverlay, getPositionStyles } from './singleOverlay';
export type { OverlayOptions } from './singleOverlay';

// Multi Overlay
export { applyMultiOverlay } from './multiOverlay';
export type { MultiOverlayOptions, MultiOverlayResult, ImageAsset } from './multiOverlay';

// Color Sync Helper (필요 시 직접 import 가능)
export {
  extractThumbnailUrl,
  applyColorSyncToImage,
  analyzeAndApplyColorSync,
  setupLazyColorSync,
} from './colorSyncHelper';
export type { ColorSyncOptions } from './colorSyncHelper';

// ============================================================
// Utility Functions (이 파일에 유지)
// ============================================================

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
