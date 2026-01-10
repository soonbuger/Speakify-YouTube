/**
 * YouTube Speakify - Color Sync Helper Module
 * 색상 동기화 관련 헬퍼 함수
 *
 * @module features/overlay/colorSyncHelper
 */

import { ColorAnalysisService } from '@/features/color-analysis/services/colorAnalysisService';
import type { ColorStats } from '@/features/color-analysis/lib/colorMath';
import { Logger } from '@/shared/lib/utils/logger';

// ============================================================
// Types
// ============================================================

export interface ColorSyncOptions {
  strengthL?: number;
  strengthAB?: number;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * URL에서 썸네일 주소 추출
 */
export function extractThumbnailUrl(element: HTMLElement): string | null {
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
 * 색상 동기화 적용 (Progressive Enhancement)
 * 원본 이미지를 먼저 표시하고, 변환 완료 시 교체
 */
export async function applyColorSyncToImage(
  overlayImage: HTMLImageElement,
  imageUrl: string,
  colorStats: ColorStats,
  options: ColorSyncOptions = {},
): Promise<void> {
  try {
    const transformedUrl = await ColorAnalysisService.getInstance().getTransformedBlobUrl(
      imageUrl,
      colorStats,
      options.strengthL,
      options.strengthAB,
    );
    if (transformedUrl !== imageUrl) {
      overlayImage.src = transformedUrl;
    }
  } catch (error) {
    Logger.warn('[ColorSyncHelper] Color transformation failed:', error);
    // Keep original
  }
}

/**
 * 썸네일 분석 후 색상 동기화 적용
 */
export async function analyzeAndApplyColorSync(
  overlayImage: HTMLImageElement,
  thumbnailUrl: string,
  imageUrl: string,
  options: ColorSyncOptions = {},
): Promise<void> {
  try {
    const colorStats = await ColorAnalysisService.getInstance().analyzeThumbnail(thumbnailUrl);
    await applyColorSyncToImage(overlayImage, imageUrl, colorStats, options);
  } catch (error) {
    Logger.warn('[ColorSyncHelper] Thumbnail analysis failed:', error);
    // Keep original
  }
}

/**
 * Lazy Color Sync: img.src가 준비되면 색상 동기화 적용
 * MutationObserver를 사용하여 src 속성 변경 감지
 */
export function setupLazyColorSync(
  overlayImage: HTMLImageElement,
  thumbnailElement: HTMLElement,
  imageUrl: string,
  options: ColorSyncOptions = {},
): void {
  const imgChild =
    thumbnailElement instanceof HTMLImageElement
      ? thumbnailElement
      : thumbnailElement.querySelector('img');

  if (!imgChild) return;

  const observer = new MutationObserver(() => {
    if (imgChild.src) {
      observer.disconnect();
      analyzeAndApplyColorSync(overlayImage, imgChild.src, imageUrl, options);
    }
  });

  observer.observe(imgChild, { attributes: true, attributeFilter: ['src'] });

  // Timeout after 3 seconds to avoid memory leak
  setTimeout(() => observer.disconnect(), 3000);
}
