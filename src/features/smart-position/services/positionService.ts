/**
 * YouTube Speakify - Position Service
 * 비용함수 기반 최적 오버레이 위치 결정
 *
 * 핵심 원리:
 * - 텍스트 밀도 맵 기반 비용 계산
 * - 민감도(sensitivity)로 텍스트 회피 강도 조절
 * - 선호 위치(하단 중앙)와의 거리 고려
 *
 * @module features/smart-position/services/positionService
 */
import { getTextDensityMap } from '../detectors/textDetector';
import { getRandomPosition } from '@/features/overlay/position';
import { SMART_POSITION } from '@/shared/config/constants';

/**
 * 랜덤 fallback 위치 생성 (분석 실패 시 사용)
 * 기존 getRandomPosition 모듈 재사용
 */
function getRandomFallbackPosition(): SmartPositionResult {
  const { x, y } = getRandomPosition(20); // 기본 이미지 크기 20%
  return { x, y, confidence: 0 };
}

/**
 * 스마트 위치 계산 결과
 */
export interface SmartPositionResult {
  /** X 좌표 (0-100, %) */
  x: number;
  /** Y 좌표 (0-100, %) */
  y: number;
  /** 신뢰도 (0-1, 높을수록 확신) */
  confidence: number;
  /** 밀도 맵 (디버그용, 4x4 그리드) */
  densityMap?: number[][];
}

/**
 * 위치 계산 옵션
 */
export interface PositionOptions {
  /** 텍스트 회피 민감도 (0-1, 기본 0.7) */
  sensitivity?: number;
  /** 그리드 크기 (기본 4) */
  gridSize?: number;
  /** 선호 X 위치 (0-100, 기본 50 = 중앙) */
  preferredX?: number;
  /** 선호 Y 위치 (0-100, 기본 75 = 하단) */
  preferredY?: number;
}

/**
 * 비용 계산 파라미터
 */
export interface CostParams {
  /** 해당 위치의 텍스트 밀도 */
  textDensity: number;
  /** 선호 위치와의 거리 */
  distFromPreferred: number;
  /** 텍스트 회피 민감도 (0-1) */
  sensitivity: number;
}

const DEFAULT_OPTIONS: Required<PositionOptions> = {
  sensitivity: 0.7,
  gridSize: 4,
  preferredX: 50,
  preferredY: 75,
};

/**
 * 비용 함수 계산
 * Cost = sensitivity × TextDensity + (1 - sensitivity) × DistFromPreferred
 *
 * @param params - 비용 계산 파라미터
 * @returns 비용 값 (낮을수록 좋은 위치)
 */
export function calculateCost(params: CostParams): number {
  const { textDensity, distFromPreferred, sensitivity } = params;

  // 민감도에 따른 가중치 적용
  const textWeight = sensitivity;
  const positionWeight = 1 - sensitivity;

  return textWeight * textDensity + positionWeight * distFromPreferred;
}

/**
 * 두 점 사이의 유클리드 거리 계산
 */
function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * 밀도 맵의 최소/최대값 계산 (헬퍼)
 */
function getDensityRange(densityMap: number[][], gridSize: number): { min: number; max: number } {
  let max = 0;
  let min = Infinity;
  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const d = densityMap[gy]?.[gx] ?? 0;
      max = Math.max(max, d);
      min = Math.min(min, d);
    }
  }
  return { min, max };
}

/** 셀 후보 타입 */
interface CellCandidate {
  gx: number;
  gy: number;
  cost: number;
}

/** findTopNCells 파라미터 */
interface FindTopNCellsParams {
  densityMap: number[][];
  gridSize: number;
  sensitivity: number;
  preferredX: number;
  preferredY: number;
  minDensity: number;
  densityRange: number;
  n: number;
}

/**
 * 상위 N개 저비용 셀 찾기
 */
function findTopNCells(params: FindTopNCellsParams): CellCandidate[] {
  const { densityMap, gridSize, sensitivity, preferredX, preferredY, minDensity, densityRange, n } =
    params;
  const allCells: CellCandidate[] = [];

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const rawDensity = densityMap[gy]?.[gx] ?? 0;
      const normalizedDensity = densityRange > 0 ? (rawDensity - minDensity) / densityRange : 0;

      const cellX = ((gx + 0.5) / gridSize) * 100;
      const cellY = ((gy + 0.5) / gridSize) * 100;
      const rawDist = euclideanDistance(cellX, cellY, preferredX, preferredY);
      const normalizedDist = rawDist / 70;

      const cost = sensitivity * normalizedDensity + (1 - sensitivity) * normalizedDist;
      allCells.push({ gx, gy, cost });
    }
  }

  // 비용 오름차순 정렬 후 상위 N개 반환
  return allCells.toSorted((a, b) => a.cost - b.cost).slice(0, n);
}

/**
 * 비용 반비례 가중치로 셀 선택
 */
function selectCellByWeightedRandom(candidates: CellCandidate[]): CellCandidate {
  // 가중치 = 1 / (cost + epsilon)
  const weights = candidates.map((c) => 1 / (c.cost + SMART_POSITION.EPSILON));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let random = Math.random() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    random -= weights[i];
    if (random <= 0) return candidates[i];
  }
  return candidates.at(-1)!;
}

/**
 * Box-Muller 변환을 이용한 가우시안 랜덤
 */
function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * 중앙 편향 랜덤 위치 (가우시안 + 균등 혼합)
 * @param safeMin 안전 최소값 (%)
 * @param safeMax 안전 최대값 (%)
 */
function getCenterBiasedPosition(safeMin: number, safeMax: number): number {
  const center = (safeMin + safeMax) / 2;
  const range = safeMax - safeMin;
  const stdDev = range / 3;

  // 균등 분포
  const uniform = safeMin + Math.random() * range;

  // 가우시안 분포 (클램프)
  let gaussian = gaussianRandom(center, stdDev);
  gaussian = Math.max(safeMin, Math.min(safeMax, gaussian));

  // 혼합 (centerBias=0.4 → 40% 가우시안 + 60% 균등)
  return uniform * (1 - SMART_POSITION.CENTER_BIAS) + gaussian * SMART_POSITION.CENTER_BIAS;
}

/**
 * 스마트 위치 계산
 *
 * @param imageData - Canvas ImageData
 * @param options - 계산 옵션
 * @returns 최적 위치 결과
 */
export function calculateSmartPosition(
  imageData: ImageData,
  options: PositionOptions = {},
  overlaySize: number = 30,
): SmartPositionResult {
  const { sensitivity, gridSize, preferredX, preferredY } = { ...DEFAULT_OPTIONS, ...options };

  // 유효성 검사: 빈 이미지 처리
  if (
    !imageData.data ||
    imageData.data.length === 0 ||
    imageData.width === 0 ||
    imageData.height === 0
  ) {
    return getRandomFallbackPosition();
  }

  try {
    // 1. 텍스트 밀도 맵 생성
    const densityMap = getTextDensityMap(imageData, gridSize);

    // 2. 밀도 범위 계산
    const { min: minDensity, max: maxDensity } = getDensityRange(densityMap, gridSize);
    const densityRange = maxDensity - minDensity;

    // 3. 상위 N개 후보 셀 찾기
    const topCells = findTopNCells({
      densityMap,
      gridSize,
      sensitivity,
      preferredX,
      preferredY,
      minDensity,
      densityRange,
      n: SMART_POSITION.CANDIDATE_COUNT,
    });

    // 4. 비용 반비례 가중치로 셀 선택
    const selectedCell = selectCellByWeightedRandom(topCells);

    // 5. 안전 마진 계산 (스피키 크기의 절반)
    const safeMargin = overlaySize / 2;
    const safeMin = safeMargin;
    const safeMax = 100 - safeMargin;

    // 6. 셀 범위 계산
    const cellMinX = (selectedCell.gx / gridSize) * 100;
    const cellMaxX = ((selectedCell.gx + 1) / gridSize) * 100;
    const cellMinY = (selectedCell.gy / gridSize) * 100;
    const cellMaxY = ((selectedCell.gy + 1) / gridSize) * 100;

    // 7. 셀 범위와 안전 범위의 교집합
    const effectiveMinX = Math.max(cellMinX, safeMin);
    const effectiveMaxX = Math.min(cellMaxX, safeMax);
    const effectiveMinY = Math.max(cellMinY, safeMin);
    const effectiveMaxY = Math.min(cellMaxY, safeMax);

    // 8. 중앙 편향 랜덤 위치
    const x = getCenterBiasedPosition(effectiveMinX, effectiveMaxX);
    const y = getCenterBiasedPosition(effectiveMinY, effectiveMaxY);

    // 9. 신뢰도 계산
    const selectedDensity = densityMap[selectedCell.gy]?.[selectedCell.gx] ?? 0;
    const normalizedSelected = densityRange > 0 ? (selectedDensity - minDensity) / densityRange : 0;
    const confidence = 1 - normalizedSelected;

    return { x, y, confidence: Math.max(0, Math.min(1, confidence)), densityMap };
  } catch {
    return getRandomFallbackPosition();
  }
}

/**
 * 비동기 스마트 위치 계산 (이미지 URL에서)
 * Phase 4에서 processor.ts와 연동 시 사용
 *
 * @param imageUrl - 썸네일 이미지 URL
 * @param options - 계산 옵션
 * @returns 최적 위치 결과
 */
export async function analyzeForSmartPosition(
  imageUrl: string,
  options: PositionOptions = {},
): Promise<SmartPositionResult> {
  try {
    // 이미지 로드
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return getRandomFallbackPosition();
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        // 다운샘플링 (128px)
        const maxSize = 128;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const width = Math.floor(img.width * scale);
        const height = Math.floor(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(blobUrl);
          resolve(getRandomFallbackPosition());
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        URL.revokeObjectURL(blobUrl);
        resolve(calculateSmartPosition(imageData, options));
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        resolve(getRandomFallbackPosition());
      };

      img.src = blobUrl;
    });
  } catch {
    return getRandomFallbackPosition();
  }
}
