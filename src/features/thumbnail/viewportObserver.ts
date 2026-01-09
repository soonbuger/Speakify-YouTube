/**
 * YouTube Speakify - Viewport Observer Module
 * IntersectionObserver를 사용하여 뷰포트에 있는 썸네일만 처리
 *
 * @module features/thumbnail/viewportObserver
 */
import { Logger } from '@/shared/lib/utils/logger';
import { SpeakifySettings } from '@/types';
import { Randomizer } from '@/shared/lib/utils/randomizer';
import { findThumbnails } from './finder';
import { getImageCount } from '@/shared/lib/assets/loader';
import { processSingleThumbnail } from './processor';

// 뷰포트 감지용 IntersectionObserver
let viewportObserver: IntersectionObserver | null = null;

// 대기 중인 썸네일 처리 함수 맵
const pendingThumbnails = new WeakMap<
  HTMLElement,
  {
    settings: SpeakifySettings;
    randomizer: Randomizer;
    currentImageCount: number;
  }
>();

/**
 * IntersectionObserver 콜백
 */
function onIntersection(entries: IntersectionObserverEntry[]): void {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const thumbnail = entry.target as HTMLElement;
      const pending = pendingThumbnails.get(thumbnail);

      if (pending) {
        // 뷰포트에 들어옴 - 관찰 중지 및 처리 시작
        viewportObserver?.unobserve(thumbnail);
        pendingThumbnails.delete(thumbnail);

        // 기존 processor 로직 재사용
        processSingleThumbnail(
          thumbnail,
          pending.settings,
          pending.randomizer,
          pending.currentImageCount,
        ).catch((error) => {
          Logger.error('Viewport processing failed', { error: String(error) });
        });
      }
    }
  });
}

/**
 * IntersectionObserver 초기화
 */
function ensureObserver(): IntersectionObserver {
  viewportObserver ??= new IntersectionObserver(onIntersection, {
    // 뷰포트보다 200px 미리 감지 (프리로딩)
    rootMargin: '200px',
    threshold: 0,
  });
  return viewportObserver;
}

/**
 * 썸네일을 뷰포트 관찰 대상에 등록
 */
function registerThumbnailForViewport(
  thumbnail: HTMLElement,
  settings: SpeakifySettings,
  randomizer: Randomizer,
  currentImageCount: number,
): void {
  const observer = ensureObserver();

  // 이미 등록되었으면 스킵
  if (pendingThumbnails.has(thumbnail)) return;

  // 대기열에 추가
  pendingThumbnails.set(thumbnail, {
    settings,
    randomizer,
    currentImageCount,
  });

  // 관찰 시작
  observer.observe(thumbnail);
}

/**
 * 발견된 모든 썸네일을 뷰포트 관찰에 등록
 */
export async function registerThumbnailsForViewport(
  settings: SpeakifySettings,
  randomizer: Randomizer,
  roots: (Document | HTMLElement)[] = [document],
): Promise<void> {
  if (!settings.extensionEnabled) return;

  const currentImageCount = getImageCount();
  if (currentImageCount === 0) return;

  // 모든 root에서 썸네일 찾기
  const thumbnailSet = new Set<HTMLElement>();
  roots.forEach((root) => {
    findThumbnails(root).forEach((thumb) => thumbnailSet.add(thumb));
  });

  // 각 썸네일을 뷰포트 관찰에 등록
  thumbnailSet.forEach((thumbnail) => {
    registerThumbnailForViewport(thumbnail, settings, randomizer, currentImageCount);
  });

  if (thumbnailSet.size > 0) {
    Logger.debug('Thumbnails registered for viewport observation', {
      count: thumbnailSet.size,
    });
  }
}

/**
 * Observer 정리
 */
export function cleanupViewportObserver(): void {
  if (viewportObserver) {
    viewportObserver.disconnect();
    viewportObserver = null;
  }
}
