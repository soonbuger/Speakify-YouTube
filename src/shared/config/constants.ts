/**
 * YouTube Speakify - 공유 상수
 * 확장 프로그램 전역에서 사용되는 상수들을 정의합니다.
 */

/** 확장 프로그램 이름 (로그 및 마커 식별용) */
export const EXTENSION_NAME = 'YouTube Speakify';

/**
 * 이미지 에셋 경로
 * - small: 128x128 일관된 크기 이미지
 * - big: 크기가 다양한 큰 이미지
 */
export const IMAGE_PATHS = {
  small: '/images/',
  big: '/images/bigSpeaki/',
} as const;

/** 이미지 폴더 타입 */
export type ImageFolder = keyof typeof IMAGE_PATHS;

/** 썸네일 가로세로 비율 설정 */
export const THUMBNAIL_CONFIG = {
  /** 허용되는 가로세로 비율 목록 (일반 + Shorts) */
  TARGET_ASPECT_RATIOS: [16 / 9, 4 / 3, 9 / 16],
  /** 비율 오차 허용 범위 */
  ASPECT_RATIO_TOLERANCE: 0.02,
} as const;

/** 성능 관련 설정 (디바운싱, 쓰로틀링) */
export const PERFORMANCE = {
  /** MutationObserver 디바운스 시간 (ms) */
  DEBOUNCE_MS: 300,
} as const;

/** 캐시 크기 설정 */
export const CACHE = {
  /** 썸네일 색상 분석 캐시 크기 */
  THUMBNAIL_SIZE: 50,
  /** Blob URL 캐시 크기 */
  BLOB_URL_SIZE: 20,
} as const;

/** Giant Speaki 이스터에그 설정 */
export const GIANT_SPEAKI = {
  /** Giant Speaki 등장 확률 (3%) */
  CHANCE: 0.03,
  /** Big 폴더 이미지의 기본 크기 비율 (40%) */
  BIG_FOLDER_SIZE_RATIO: 0.4,
} as const;

/** 스마트 포지션 설정 */
export const SMART_POSITION = {
  /** 후보 영역 개수 */
  CANDIDATE_COUNT: 4,
  /** 중앙 편향 정도 (0=균등, 1=강한 가우시안) */
  CENTER_BIAS: 0.4,
  /** 0으로 나누기 방지용 작은 값 */
  EPSILON: 0.001,
} as const;
