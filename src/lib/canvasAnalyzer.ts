/**
 * YouTube Speakify - Canvas Analyzer Module
 * 썸네일 이미지를 분석하여 "빈 공간" (시각적 복잡도가 낮은 영역)을 찾습니다.
 *
 * @module lib/canvasAnalyzer
 */
import { Logger } from './logger';

/**
 * 그리드 셀 정보
 */
export interface GridCell {
  x: number; // 셀 X 위치 (0 ~ gridSize-1)
  y: number; // 셀 Y 위치 (0 ~ gridSize-1)
  complexity: number; // 복잡도 (0 = 단순, 높을수록 복잡)
}

/**
 * 분석 결과
 */
export interface AnalysisResult {
  bestPosition: { x: number; y: number }; // 최적 위치 (%)
  grid: GridCell[]; // 전체 그리드 분석 결과
}

/**
 * 픽셀 밝기(그레이스케일) 계산
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns 밝기 값 (0-255)
 */
export function calculateBrightness(r: number, g: number, b: number): number {
  // ITU-R BT.601 표준 가중치
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * 픽셀 배열의 복잡도(분산) 계산
 * 분산이 높을수록 시각적으로 복잡한 영역
 * @param brightnessValues 밝기 값 배열
 * @returns 복잡도 (분산 값)
 */
export function calculateComplexity(brightnessValues: number[]): number {
  if (brightnessValues.length === 0) return 0;

  // 평균 계산
  const mean = brightnessValues.reduce((sum, val) => sum + val, 0) / brightnessValues.length;

  // 분산 계산
  const variance =
    brightnessValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    brightnessValues.length;

  return variance;
}

/**
 * 이미지 URL을 Canvas에 로드하고 ImageData 반환
 * Chrome 확장 host_permissions를 활용하여 CORS 우회
 * @param imageUrl 이미지 URL
 * @returns ImageData 또는 null (로드 실패 시)
 */
export async function loadImageToCanvas(imageUrl: string): Promise<ImageData | null> {
  try {
    // fetch를 사용하여 이미지 데이터를 Blob으로 가져옴 (CORS 우회)
    const response = await fetch(imageUrl);
    if (!response.ok) {
      Logger.warn('Smart: Fetch failed', { status: response.status, url: imageUrl });
      return null;
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        // 성능 최적화: 썸플링 (최대 100x100으로 축소)
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const width = Math.floor(img.width * scale);
        const height = Math.floor(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(blobUrl);
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        // Blob URL 해제
        URL.revokeObjectURL(blobUrl);
        resolve(imageData);
      };

      img.onerror = () => {
        Logger.warn('Smart: Image load failed', { url: imageUrl });
        URL.revokeObjectURL(blobUrl);
        resolve(null);
      };

      img.src = blobUrl;
    });
  } catch (error) {
    Logger.error('Smart: loadImageToCanvas error', { error });
    return null;
  }
}

/**
 * ImageData를 그리드로 분할하고 각 셀의 복잡도 계산
 * @param imageData Canvas ImageData
 * @param gridSize 그리드 크기 (기본 4x4)
 * @returns GridCell 배열
 */
export function analyzeGrid(imageData: ImageData, gridSize: number = 4): GridCell[] {
  const { width, height, data } = imageData;
  const cellWidth = Math.floor(width / gridSize);
  const cellHeight = Math.floor(height / gridSize);
  const grid: GridCell[] = [];

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const brightnessValues: number[] = [];

      // 해당 셀의 모든 픽셀 밝기 수집
      for (let py = 0; py < cellHeight; py++) {
        for (let px = 0; px < cellWidth; px++) {
          const x = gx * cellWidth + px;
          const y = gy * cellHeight + py;
          const i = (y * width + x) * 4;

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          brightnessValues.push(calculateBrightness(r, g, b));
        }
      }

      const complexity = calculateComplexity(brightnessValues);
      grid.push({ x: gx, y: gy, complexity });
    }
  }

  return grid;
}

/**
 * 최적의 오버레이 위치 찾기 (가장 복잡도가 낮은 영역)
 * @param grid 분석된 그리드
 * @param gridSize 그리드 크기
 * @returns 최적 위치 (% 단위)
 */
/**
 * 위치에 따른 가중치(Bias) 계산
 * 하단 선호, 중앙 선호
 */
function getPositionBias(cell: GridCell, gridSize: number): number {
  // 1. Y축 바이어스: 하단일수록 낮은 점수 (선호)
  // 상단(y=0)은 높은 페널티, 하단(y=gridSize-1)은 0
  const yPenalty = (gridSize - 1 - cell.y) * 50;

  // 2. X축 바이어스: 중앙일수록 낮은 점수 (선호)
  // 가장자리(x=0, x=gridSize-1)는 페널티 부여
  // 4x4 기준: 0, 3은 페널티 1.5 * 10 = 15, 1, 2는 0.5 * 10 = 5
  const center = (gridSize - 1) / 2;
  const xDist = Math.abs(cell.x - center);
  const xPenalty = xDist * 10;

  return yPenalty + xPenalty;
}

/**
 * 최적의 오버레이 위치 찾기 (가장 복잡도가 낮은 영역)
 * 위치 가중치(하단 선호) 적용
 * @param grid 분석된 그리드
 * @param gridSize 그리드 크기
 * @returns 최적 위치 (% 단위)
 */
export function findBestPosition(grid: GridCell[], gridSize: number = 4): { x: number; y: number } {
  // 복잡도 + 위치 가중치 점수로 정렬 (낮은 것 = 최적)
  const sorted = [...grid].sort((a, b) => {
    const scoreA = a.complexity + getPositionBias(a, gridSize);
    const scoreB = b.complexity + getPositionBias(b, gridSize);
    return scoreA - scoreB;
  });

  // 가장 점수가 낮은 셀 선택
  const bestCell = sorted[0];

  // 셀 중앙 위치를 % 단위로 변환
  const cellWidthPercent = 100 / gridSize;
  const cellHeightPercent = 100 / gridSize;

  const x = bestCell.x * cellWidthPercent + cellWidthPercent / 2;
  const y = bestCell.y * cellHeightPercent + cellHeightPercent / 2;

  return { x, y };
}

/**
 * 이미지 URL에서 최적의 오버레이 위치 찾기 (통합 함수)
 * @param imageUrl 썸네일 이미지 URL
 * @param gridSize 그리드 크기 (기본 4)
 * @returns 최적 위치 (% 단위) 또는 null
 */
export async function analyzeImageForPlacement(
  imageUrl: string,
  gridSize: number = 4
): Promise<AnalysisResult | null> {
  const imageData = await loadImageToCanvas(imageUrl);
  if (!imageData) return null;

  const grid = analyzeGrid(imageData, gridSize);
  const bestPosition = findBestPosition(grid, gridSize);

  return { bestPosition, grid };
}
