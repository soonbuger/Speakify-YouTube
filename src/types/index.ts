/**
 * YouTube Speakify - Type Definitions
 * 모든 타입을 단일 소스에서 관리
 */

// ==================== 언어 & 위치 ====================

/** 지원 언어 */
export type Language = 'en' | 'ko' | 'ja';

/** 오버레이 위치 옵션 */
export type OverlayPosition =
  | 'smart'
  | 'random'
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

// ==================== 설정 ====================

/**
 * 확장 프로그램 설정 인터페이스
 * Storage에 저장되는 설정값들
 */
export interface SpeakifySettings {
  language: Language;
  extensionEnabled: boolean;
  appearChance: number; // 0.0 ~ 1.0
  flipChance: number; // 0.0 ~ 1.0
  overlayPosition: OverlayPosition;
  overlaySizeMin: number; // % (10~150)
  overlaySizeMax: number; // % (10~150)
  overlayOpacity: number; // 0.0 ~ 1.0
  overlayCountMin: number; // 1~8 (Multi-Image 최소 개수)
  overlayCountMax: number; // 1~8 (Multi-Image 최대 개수)
  colorSync: boolean; // Smart Color Overlay 활성화 여부
  colorSyncStrengthL: number; // 밝기(조명) 강도 0.0 ~ 1.0
  colorSyncStrengthAB: number; // 색조(틴트) 강도 0.0 ~ 1.0
  rotationMin: number; // 기울기 최소값 (0~180)
  rotationMax: number; // 기울기 최대값 (0~180)
  debugMode: boolean;
}

/**
 * 기본 설정값
 */
export const DEFAULT_SETTINGS: SpeakifySettings = {
  language: 'en',
  extensionEnabled: true,
  appearChance: 1,
  flipChance: 0.5,
  overlayPosition: 'random',
  overlaySizeMin: 25,
  overlaySizeMax: 100,
  overlayOpacity: 1,
  overlayCountMin: 1,
  overlayCountMax: 1,
  colorSync: true,
  colorSyncStrengthL: 0.2, // 밝기(조명) 효과 강도
  colorSyncStrengthAB: 0.15, // 색조(틴트) 효과 강도
  rotationMin: 0, // 기울기 최소값 (기본: 0도 = 회전 없음)
  rotationMax: 0, // 기울기 최대값 (기본: 0도 = 회전 없음)
  debugMode: false,
};

// ==================== 오버레이 ====================

/**
 * 오버레이 렌더링 옵션
 */
export interface OverlayOptions {
  position: OverlayPosition | 'bottom-right' | 'bottom-left';
  size: number;
  opacity: number;
  flip: boolean;
  smartPosition?: { x: number; y: number };
}

/**
 * 썸네일 처리 상태
 */
export interface ThumbnailState {
  processed: boolean;
  sourceUrl: string;
  processing: boolean;
  overlayElement?: HTMLImageElement;
}

/**
 * 렌더러 인터페이스
 */
export interface RendererInterface {
  createOverlay(imageUrl: string, options: OverlayOptions): HTMLImageElement;
  removeOverlay(element: HTMLElement | null): void;
}

// ==================== Multi-Image Overlay ====================

/**
 * 개별 오버레이 인스턴스 타입
 * 각 이미지는 독립적인 속성(크기, 위치, 반전 등)을 가짐
 * 미래 확장: rotation, skew 등 지원 예정
 */
export interface OverlayInstance {
  imageUrl: string;
  folder: 'small' | 'big'; // 이미지 폴더 (디버그용)
  index: number; // 이미지 인덱스 (디버그용)
  size: number; // % (10~150)
  flip: boolean;
  position: { x: number; y: number }; // % (0~100)
  opacity?: number;
  isGiant?: boolean; // Giant Speaki 이스터에그 (3% 확률)
  // 미래 확장용 (Optional)
  rotation?: number; // degrees
  skew?: number; // degrees
}
