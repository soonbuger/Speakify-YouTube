/**
 * YouTube Speakify - Type Definitions
 * 모든 타입을 단일 소스에서 관리
 */

// ==================== 언어 & 위치 ====================

/** 지원 언어 */
export type Language = 'en' | 'ko';

/** 오버레이 위치 옵션 */
export type OverlayPosition = 'center' | 'random' | 'smart';

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
  debugMode: boolean;
}

/**
 * 기본 설정값
 */
export const DEFAULT_SETTINGS: SpeakifySettings = {
  language: 'en',
  extensionEnabled: true,
  appearChance: 1.0,
  flipChance: 0.5,
  overlayPosition: 'random',
  overlaySizeMin: 25,
  overlaySizeMax: 100,
  overlayOpacity: 1.0,
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
