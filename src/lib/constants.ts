/**
 * YouTube Speakify - 공유 상수
 * 확장 프로그램 전역에서 사용되는 상수들을 정의합니다.
 */

/** 확장 프로그램 이름 (로그 및 마커 식별용) */
export const EXTENSION_NAME = 'YouTube Speakify';

/** 이미지 에셋 경로 */
export const IMAGES_PATH = '/images/';

/** 썸네일 가로세로 비율 설정 */
export const THUMBNAIL_CONFIG = {
  /** 허용되는 가로세로 비율 목록 (일반 + Shorts) */
  TARGET_ASPECT_RATIOS: [16 / 9, 4 / 3, 9 / 16],
  /** 비율 오차 허용 범위 */
  ASPECT_RATIO_TOLERANCE: 0.02,
} as const;
