/**
 * YouTube Speakify - Debug Indicator Module
 * 디버그 정보를 썸네일에 시각적으로 표시하는 모듈
 *
 * @module features/debug/indicator
 */

// ============================================================
// Types
// ============================================================

/**
 * 디버그 정보 타입 (단일/멀티 모드 통합)
 */
export interface DebugInfo {
  mode: 'single' | 'multi';
  // Single 모드용
  folder?: string;
  index?: number;
  size?: number;
  // Multi 모드용 - 각 이미지의 상세 정보
  instances?: Array<{
    folder: string;
    index: number;
    size: number;
  }>;
}

/**
 * 디버그 표시 옵션
 */
export interface DebugIndicatorOptions {
  thumbnail: HTMLElement;
  smartPosition?: { x: number; y: number };
  overlayPosition: string;
  info: DebugInfo;
}

// ============================================================
// Constants
// ============================================================

/** 디버그 요소 CSS 클래스 */
const DEBUG_CLASSES = {
  dot: 'speakify-debug-dot',
  info: 'speakify-debug-info',
} as const;

/** 디버그 Dot 스타일 */
const DEBUG_DOT_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  width: '12px',
  height: '12px',
  background: '#e74c3c',
  border: '2px solid #fff',
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: '0 0 8px rgba(231, 76, 60, 0.8)',
  zIndex: '9999',
  pointerEvents: 'none',
};

/** 디버그 Info Label 스타일 */
const DEBUG_INFO_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute',
  top: '4px',
  left: '4px',
  color: '#fff',
  padding: '2px 6px',
  fontSize: '11px',
  fontFamily: 'monospace',
  borderRadius: '4px',
  zIndex: '9999',
  pointerEvents: 'none',
  whiteSpace: 'normal',
  background: 'rgba(0, 0, 0, 0.7)',
  maxWidth: '90%',
  wordBreak: 'break-all',
  lineHeight: '1.2',
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * 디버그 정보를 통합된 포맷으로 생성
 * 포맷: [folder] #index / size%
 */
function formatDebugLabel(info: DebugInfo): string {
  if (info.mode === 'multi' && info.instances) {
    // Multi 모드: 각 이미지 정보를 콤마로 연결
    return info.instances
      .map((inst) => `[${inst.folder}] #${inst.index} / ${inst.size}%`)
      .join(', ');
  }
  // Single 모드: 단일 이미지 정보
  return `[${info.folder}] #${info.index} / ${Math.round(info.size ?? 0)}%`;
}

/**
 * 디버그 Dot 요소 생성
 */
function createDebugDot(position: { x: number; y: number }): HTMLDivElement {
  const dot = document.createElement('div');
  dot.className = DEBUG_CLASSES.dot;
  Object.assign(dot.style, DEBUG_DOT_STYLE, {
    left: `${position.x}%`,
    top: `${position.y}%`,
  });
  return dot;
}

/**
 * 디버그 Info Label 요소 생성
 */
function createDebugInfoLabel(labelText: string): HTMLDivElement {
  const label = document.createElement('div');
  label.className = DEBUG_CLASSES.info;
  Object.assign(label.style, DEBUG_INFO_STYLE);
  label.innerText = labelText;
  return label;
}

// ============================================================
// Main Export
// ============================================================

/**
 * 썸네일에 디버그 표시기를 추가
 * Single / Multi 모드 통합 지원 - 동일한 포맷 사용
 *
 * @param options 디버그 표시 옵션
 */
export function showDebugIndicator(options: DebugIndicatorOptions): void {
  const { thumbnail, smartPosition, overlayPosition, info } = options;

  const debugPos = smartPosition || (overlayPosition === 'smart' ? { x: 50, y: 50 } : null);

  const parent = thumbnail.parentElement;
  if (!parent) return;

  // Position Dot (smart 모드에서만)
  if (debugPos) {
    parent.appendChild(createDebugDot(debugPos));
  }

  // Info Label - 통합된 포맷 사용
  const labelText = formatDebugLabel(info);
  parent.appendChild(createDebugInfoLabel(labelText));
}

/**
 * 디버그 표시기 제거
 */
export function removeDebugIndicators(container: HTMLElement): void {
  const dots = container.querySelectorAll(`.${DEBUG_CLASSES.dot}`);
  const labels = container.querySelectorAll(`.${DEBUG_CLASSES.info}`);

  dots.forEach((el) => el.remove());
  labels.forEach((el) => el.remove());
}
