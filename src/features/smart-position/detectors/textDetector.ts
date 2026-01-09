/**
 * YouTube Speakify - Text Detector
 * 엣지 밀도 기반 텍스트 영역 감지
 *
 * 핵심 원리:
 * - 소벨 연산으로 엣지 맵 생성
 * - 적분 이미지로 그리드별 엣지 밀도 계산
 * - 임계값 초과 영역을 텍스트 영역으로 판별
 *
 * @module features/smart-position/detectors/textDetector
 */
import { applySobelOperator } from '../core/sobelEdge';
import { createIntegralImage, getAreaSum } from '../core/integralImage';

/**
 * 텍스트 영역 정보
 */
export interface TextRegion {
  /** X 좌표 (0-1 정규화) */
  x: number;
  /** Y 좌표 (0-1 정규화) */
  y: number;
  /** 너비 (0-1 정규화) */
  width: number;
  /** 높이 (0-1 정규화) */
  height: number;
  /** 엣지 밀도 점수 (높을수록 텍스트 가능성 높음) */
  density: number;
}

/**
 * 텍스트 감지 옵션
 */
export interface TextDetectorOptions {
  /** 그리드 분할 크기 (기본 4x4) */
  gridSize?: number;
  /** 텍스트 판별 임계값 (기본 50) */
  threshold?: number;
}

const DEFAULT_OPTIONS: Required<TextDetectorOptions> = {
  gridSize: 4,
  threshold: 50,
};

/**
 * 엣지 데이터에서 특정 영역의 밀도 계산
 *
 * @param edgeData - 엣지 맵 (Float32Array)
 * @param x1 - 시작 X
 * @param y1 - 시작 Y
 * @param x2 - 끝 X
 * @param y2 - 끝 Y
 * @param width - 이미지 너비
 * @param _height - 이미지 높이 (미사용, 인터페이스 일관성)
 * @returns 평균 엣지 밀도
 */
export function calculateEdgeDensity(
  edgeData: Float32Array,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  _height: number,
): number {
  // 적분 이미지 생성 (캐싱 필요 시 외부에서 처리)
  const integral = createIntegralImage(edgeData, width, Math.ceil(edgeData.length / width));
  const sum = getAreaSum(integral, x1, y1, x2, y2, width);
  const area = (x2 - x1 + 1) * (y2 - y1 + 1);

  return area > 0 ? sum / area : 0;
}

/**
 * 이미지에서 텍스트 영역 감지
 *
 * @param imageData - Canvas ImageData
 * @param options - 감지 옵션
 * @returns 텍스트 영역 배열 (밀도 높은 순으로 정렬)
 */
export function detectTextRegions(
  imageData: ImageData,
  options: TextDetectorOptions = {},
): TextRegion[] {
  const { gridSize, threshold } = { ...DEFAULT_OPTIONS, ...options };
  const { width, height } = imageData;

  // 1. 소벨 연산으로 엣지 맵 생성
  const edgeMap = applySobelOperator(imageData);

  // 2. 적분 이미지 생성 (O(N) 전처리)
  const integralImage = createIntegralImage(edgeMap, width, height);

  // 3. 그리드별 밀도 계산
  const cellWidth = Math.floor(width / gridSize);
  const cellHeight = Math.floor(height / gridSize);
  const regions: TextRegion[] = [];

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      // 그리드 셀 좌표 계산
      const x1 = gx * cellWidth;
      const y1 = gy * cellHeight;
      const x2 = Math.min((gx + 1) * cellWidth - 1, width - 1);
      const y2 = Math.min((gy + 1) * cellHeight - 1, height - 1);

      // O(1) 밀도 조회
      const sum = getAreaSum(integralImage, x1, y1, x2, y2, width);
      const area = (x2 - x1 + 1) * (y2 - y1 + 1);
      const density = area > 0 ? sum / area : 0;

      // 임계값 초과 시 텍스트 영역으로 판별
      if (density >= threshold) {
        regions.push({
          x: x1 / width,
          y: y1 / height,
          width: (x2 - x1 + 1) / width,
          height: (y2 - y1 + 1) / height,
          density,
        });
      }
    }
  }

  // 4. 밀도 높은 순으로 정렬
  return regions.sort((a, b) => b.density - a.density);
}

/**
 * 텍스트 영역 밀도 맵 생성 (디버그용)
 *
 * @param imageData - Canvas ImageData
 * @param gridSize - 그리드 크기
 * @returns 그리드별 밀도 배열 (gridSize * gridSize)
 */
export function getTextDensityMap(imageData: ImageData, gridSize: number = 4): number[][] {
  const { width, height } = imageData;
  const edgeMap = applySobelOperator(imageData);
  const integralImage = createIntegralImage(edgeMap, width, height);

  const cellWidth = Math.floor(width / gridSize);
  const cellHeight = Math.floor(height / gridSize);
  const densityMap: number[][] = [];

  for (let gy = 0; gy < gridSize; gy++) {
    const row: number[] = [];
    for (let gx = 0; gx < gridSize; gx++) {
      const x1 = gx * cellWidth;
      const y1 = gy * cellHeight;
      const x2 = Math.min((gx + 1) * cellWidth - 1, width - 1);
      const y2 = Math.min((gy + 1) * cellHeight - 1, height - 1);

      const sum = getAreaSum(integralImage, x1, y1, x2, y2, width);
      const area = (x2 - x1 + 1) * (y2 - y1 + 1);
      row.push(area > 0 ? sum / area : 0);
    }
    densityMap.push(row);
  }

  return densityMap;
}
