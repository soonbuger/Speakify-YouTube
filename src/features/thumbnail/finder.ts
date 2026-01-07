/**
 * YouTube Speakify - Thumbnail Finder Module
 * Finds and filters YouTube thumbnail elements.
 *
 * @module lib/thumbnailFinder
 */
import { THUMBNAIL_CONFIG, EXTENSION_NAME } from '@/shared/config/constants';

// CSS Selectors for YouTube thumbnails (multi-version support)
const IMAGE_SELECTORS = [
  // 일반 영상 썸네일 (홈, 구독)
  'ytd-thumbnail a > yt-image > img.yt-core-image',
  'img.style-scope.yt-img-shadow[width="86"]',
  '.yt-thumbnail-view-model__image img',
  // 검색 결과 썸네일
  'ytd-thumbnail yt-image img.ytCoreImageHost',
  'yt-image.ytd-thumbnail img',
  // Shorts 썸네일
  'a.shortsLockupViewModelHostEndpoint img',
  'ytm-shorts-lockup-view-model img.ytCoreImageHost',
  'ytm-shorts-lockup-view-model-v2 img',
  'yt-thumbnail-view-model img.ytCoreImageHost',
];

// Destructure config for readability
const { TARGET_ASPECT_RATIOS, ASPECT_RATIO_TOLERANCE } = THUMBNAIL_CONFIG;

// 이미 처리된 요소를 추적하는 WeakSet (메모리 효율적)
const processedElements = new WeakSet<HTMLElement>();

/**
 * 요소가 이미 처리되었는지 확인
 * WeakSet + DOM 마커 둘 다 체크
 */
/**
 * 요소가 이미 처리되었는지 확인
 * WeakSet + Dataset + DOM 마커 체크
 */
function isAlreadyProcessed(element: HTMLElement): boolean {
  // WeakSet 체크 (빠름)
  if (processedElements.has(element)) return true;

  // Dataset 체크 (비동기 처리 중 중복 방지)
  if (element.dataset.speakifyProcessed === 'true') return true;

  // DOM 마커 체크 (새로고침이나 동적 로드 시)
  const parent = element.parentElement;
  if (!parent) return false;

  // 부모 및 부모의 부모까지 확인 (Shorts 구조 대응)
  const hasMarker = (container: HTMLElement): boolean => {
    return Array.from(container.children).some((child) => child.id?.includes(EXTENSION_NAME));
  };

  if (hasMarker(parent)) return true;
  if (parent.parentElement && hasMarker(parent.parentElement)) return true;

  return false;
}

/**
 * 요소를 처리됨으로 표시
 */
export function markAsProcessed(element: HTMLElement): void {
  processedElements.add(element);
  element.dataset.speakifyProcessed = 'true';
}

/**
 * Finds all unprocessed YouTube thumbnails
 */
export function findThumbnails(): HTMLElement[] {
  // Set을 사용하여 중복 제거
  const uniqueImages = new Set<HTMLElement>();

  // Collect images from all selectors
  for (const selector of IMAGE_SELECTORS) {
    document.querySelectorAll<HTMLElement>(selector).forEach((img) => {
      uniqueImages.add(img);
    });
  }

  // Add special cases (video wall, cued thumbnails)
  document.querySelectorAll<HTMLElement>('.ytp-videowall-still-image').forEach((img) => {
    uniqueImages.add(img);
  });
  document.querySelectorAll<HTMLElement>('div.ytp-cued-thumbnail-overlay-image').forEach((img) => {
    uniqueImages.add(img);
  });

  // Convert to array and filter
  return Array.from(uniqueImages).filter((image) => {
    const parent = image.parentElement;
    if (!parent) return false;

    // 이미 처리된 요소 제외
    if (isAlreadyProcessed(image)) return false;

    // Exclude video previews and chapters
    const isVideoPreview =
      parent.closest('#video-preview') !== null ||
      Array.from(parent.classList).some((cls) => cls.includes('ytAnimated'));
    const isChapter = parent.closest('#endpoint') !== null;

    if (isVideoPreview || isChapter) return false;

    // Filter by aspect ratio (supports both regular and Shorts thumbnails)
    const img = image as HTMLImageElement;

    // Shorts 썸네일은 CSS 레이아웃 특성상 offsetWidth/offsetHeight가 0일 수 있음
    const width = img.naturalWidth || img.width || img.getBoundingClientRect().width;
    const height = img.naturalHeight || img.height || img.getBoundingClientRect().height;

    if (height === 0) return false;

    const aspectRatio = width / height;
    return TARGET_ASPECT_RATIOS.some(
      (target) => Math.abs(aspectRatio - target) < ASPECT_RATIO_TOLERANCE
    );
  });
}
