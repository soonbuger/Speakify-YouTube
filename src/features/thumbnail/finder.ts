/**
 * YouTube Speakify - 썸네일 파인더 모듈
 * YouTube 썸네일 요소를 찾아 필터링
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
  '.yt-lockup-view-model__content-image img',
  // 검색 결과 썸네일
  'ytd-thumbnail yt-image img.ytCoreImageHost',
  'yt-image.ytd-thumbnail img',
  // Shorts 썸네일 - 홈페이지
  'ytd-rich-item-renderer ytd-shortsLockupViewModel img',
  'ytd-rich-item-renderer a img.yt-core-image',
  'ytd-reel-shelf-renderer img',
  'ytd-reel-item-renderer img',
  // Shorts 썸네일 - 사이드바 (영상 페이지)
  'a.shortsLockupViewModelHostEndpoint img',
  'ytm-shorts-lockup-view-model img',
  'ytm-shorts-lockup-view-model-v2 img',
  'yt-thumbnail-view-model img',
  // 일반 ytCoreImageHost (Shorts 포함)
  'img.ytCoreImageHost',
  // 영상 끝나기 직전 추천 영상 썸네일
  // 채널 아이콘(원형) 등은 제외하고 비디오/재생목록만 타겟팅 (은근 채널 아이콘은 제외 안되니 유의)
  '.ytp-ce-video .ytp-ce-covering-image',
  '.ytp-ce-playlist .ytp-ce-covering-image',
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
 * @param root Root element to search within (default: document)
 */
export function findThumbnails(root: Document | HTMLElement = document): HTMLElement[] {
  // Set을 사용하여 중복 제거
  const uniqueImages = new Set<HTMLElement>();

  // Collect images from all selectors
  for (const selector of IMAGE_SELECTORS) {
    root.querySelectorAll<HTMLElement>(selector).forEach((img) => {
      // Shorts Player 내부의 이미지(포스터 등)는 제외
      // Shorts 피드는 자동 재생되므로 썸네일 오버레이가 불필요하며 방해됨
      if (img.closest('ytd-reel-video-renderer')) {
        return;
      }
      uniqueImages.add(img);
    });
  }

  // Add special cases (video wall, cued thumbnails)
  root.querySelectorAll<HTMLElement>('.ytp-videowall-still-image').forEach((img) => {
    uniqueImages.add(img);
  });
  root.querySelectorAll<HTMLElement>('.ytp-modern-videowall-still-image').forEach((img) => {
    uniqueImages.add(img);
  });
  root.querySelectorAll<HTMLElement>('div.ytp-cued-thumbnail-overlay-image').forEach((img) => {
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

    // Shorts 썸네일인지 확인 (aspect ratio 검사 건너뛰기)
    // 채널 아이콘 제외 (yt-avatar, yt-img-shadow#avatar 등)
    const isChannelIcon =
      parent.closest('#avatar') !== null ||
      parent.closest('yt-avatar') !== null ||
      parent.closest('#author-thumbnail') !== null ||
      parent.closest('a[href*="/channel/"]')?.querySelector('img') === image ||
      parent.closest('a[href*="/@"]')?.querySelector('img') === image;

    if (isChannelIcon) return false;

    const isShortsThumb =
      parent.closest('ytd-reel-item-renderer') !== null ||
      parent.closest('ytd-reel-shelf-renderer') !== null ||
      parent.closest('ytm-shorts-lockup-view-model') !== null ||
      parent.closest('ytm-shorts-lockup-view-model-v2') !== null ||
      parent.closest('.shortsLockupViewModelHostEndpoint') !== null ||
      parent.closest('[is-shorts]') !== null;

    // Shorts는 aspect ratio가 세로형이어야 함 (사이드바 침범 방지)
    if (isShortsThumb) {
      const img = image as HTMLImageElement;
      // 0일 수 있는 값 방어
      const w = img.naturalWidth || img.width || img.getBoundingClientRect().width;
      const h = img.naturalHeight || img.height || img.getBoundingClientRect().height;

      // 이미지가 아직 로드되지 않았으면 일단 통과 (나중에 처리됨)
      // 그전꺼: h === 0 이면 false → Shorts 컨테이너 확인 시에는 통과
      if (h === 0) return true;

      const ratio = w / h;

      // 0.8 미만이면 세로형 (9:16 = 0.5625)
      // 일부 정사각형에 가까운 Shorts도 있을 수 있으나, 보통 0.8 미만
      // 세로형(9:16) 또는 정사각형에 가까운 경우 Shorts로 처리 (어차피 처리해야하는 건 비슷해서 상관 X)
      if (ratio < 1.2) return true;

      // Shorts 컨테이너 내부지만 비율이 넓으면(1.2 이상) 오버레이 대상 아님 (사이드바 배경 등)
      return false;
    }

    // Videowall 썸네일은 aspect ratio 검사 건너뛰기 (div with background-image)
    const isVideowall =
      image.classList.contains('ytp-videowall-still-image') ||
      image.classList.contains('ytp-modern-videowall-still-image') ||
      image.classList.contains('ytp-cued-thumbnail-overlay-image');

    if (isVideowall) {
      // background-image가 있는지 확인
      return !!image.style.backgroundImage;
    }

    // Filter by aspect ratio (일반 영상 썸네일만)
    const img = image as HTMLImageElement;

    // Shorts 썸네일은 CSS 레이아웃 특성상 offsetWidth/offsetHeight가 0일 수 있음
    const width = img.naturalWidth || img.width || img.getBoundingClientRect().width;
    const height = img.naturalHeight || img.height || img.getBoundingClientRect().height;

    if (height === 0) return false;

    const aspectRatio = width / height;
    return TARGET_ASPECT_RATIOS.some(
      (target) => Math.abs(aspectRatio - target) < ASPECT_RATIO_TOLERANCE,
    );
  });
}
