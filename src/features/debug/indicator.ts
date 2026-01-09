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
  isGiant?: boolean;
  // Multi 모드용 - 각 이미지의 상세 정보
  instances?: Array<{
    folder: string;
    index: number;
    size: number;
    isGiant?: boolean;
  }>;
  // Smart Position 디버그용
  densityMap?: number[][];
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
  densityGrid: 'speakify-debug-density-grid',
  densityCell: 'speakify-debug-density-cell',
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
      .map((inst) => {
        const giantTag = inst.isGiant ? ' 🔥' : '';
        return `[${inst.folder}] #${inst.index} / ${inst.size}%${giantTag}`;
      })
      .join(', ');
  }
  // Single 모드: 단일 이미지 정보
  const giantTag = info.isGiant ? ' 🔥' : '';
  return `[${info.folder}] #${info.index} / ${Math.round(info.size ?? 0)}%${giantTag}`;
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

/**
 * 밀도 값을 색상으로 변환 (녹색=낮음, 빨강=높음)
 * @param value 정규화된 밀도 (0~1)
 */
function densityToColor(value: number): string {
  // 0 = 녹색 (안전), 1 = 빨강 (텍스트)
  const r = Math.round(255 * value);
  const g = Math.round(255 * (1 - value));
  return `rgba(${r}, ${g}, 0, 0.5)`;
}

/**
 * 밀도 맵 시각화 그리드 생성
 * 각 셀은 밀도에 따라 색상으로 표시됨 (녹색=낮음, 빨강=높음)
 */
function createDensityGrid(densityMap: number[][]): HTMLDivElement {
  const grid = document.createElement('div');
  grid.className = DEBUG_CLASSES.densityGrid;
  Object.assign(grid.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: `repeat(${densityMap[0]?.length || 4}, 1fr)`,
    gridTemplateRows: `repeat(${densityMap.length}, 1fr)`,
    zIndex: '9998',
    pointerEvents: 'none',
  } as Partial<CSSStyleDeclaration>);

  // 밀도 정규화를 위한 최대/최소값
  let minDensity = Infinity;
  let maxDensity = 0;
  for (const row of densityMap) {
    for (const val of row) {
      minDensity = Math.min(minDensity, val);
      maxDensity = Math.max(maxDensity, val);
    }
  }
  const range = maxDensity - minDensity;

  // 각 셀 생성
  for (const row of densityMap) {
    for (const rawDensity of row) {
      const normalized = range > 0 ? (rawDensity - minDensity) / range : 0;

      const cell = document.createElement('div');
      cell.className = DEBUG_CLASSES.densityCell;
      Object.assign(cell.style, {
        background: densityToColor(normalized),
        border: '1px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#fff',
        textShadow: '0 0 2px #000',
      } as Partial<CSSStyleDeclaration>);
      cell.innerText = rawDensity.toFixed(0);
      grid.appendChild(cell);
    }
  }

  return grid;
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

  // Density Map Grid (smart 모드에서 밀도 맵이 있을 때)
  if (overlayPosition === 'smart' && info.densityMap && info.densityMap.length > 0) {
    parent.appendChild(createDensityGrid(info.densityMap));
  }

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
  const grids = container.querySelectorAll(`.${DEBUG_CLASSES.densityGrid}`);

  dots.forEach((el) => el.remove());
  labels.forEach((el) => el.remove());
  grids.forEach((el) => el.remove());
}
