/**
 * YouTube Speakify - Integral Image (Summed-Area Table)
 * 적분 이미지를 이용한 고속 영역 합 계산
 *
 * 핵심 원리:
 * - 전처리: O(N) 시간에 적분 이미지 생성
 * - 조회: O(1) 시간에 임의 직사각형 영역의 합 계산
 *
 * @module features/smart-position/core/integralImage
 */

/**
 * 적분 이미지 생성
 * 각 위치 (x, y)에 원점 (0, 0)부터 해당 위치까지의 누적합 저장
 *
 * 공식: I(x,y) = i(x,y) + I(x-1,y) + I(x,y-1) - I(x-1,y-1)
 *
 * @param data - 픽셀 데이터 (Float32Array, width * height)
 * @param width - 이미지 너비
 * @param height - 이미지 높이
 * @returns 적분 이미지 (Uint32Array)
 */
export function createIntegralImage(
  data: Float32Array,
  width: number,
  height: number,
): Uint32Array {
  const integral = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const current = Math.round(data[idx]);

      // 왼쪽 값 (x-1, y)
      const left = x > 0 ? integral[idx - 1] : 0;

      // 위쪽 값 (x, y-1)
      const top = y > 0 ? integral[idx - width] : 0;

      // 대각선 값 (x-1, y-1) - 중복 제거용
      const topLeft = x > 0 && y > 0 ? integral[idx - width - 1] : 0;

      // 적분 이미지 공식 적용
      integral[idx] = current + left + top - topLeft;
    }
  }

  return integral;
}

/**
 * 적분 이미지를 이용한 영역 합 조회 (O(1) 시간 복잡도)
 *
 * 공식: Sum(D) = I(x2,y2) - I(x2,y1-1) - I(x1-1,y2) + I(x1-1,y1-1)
 *
 * @param integral - 적분 이미지 (Uint32Array)
 * @param x1 - 시작 X 좌표 (0-indexed, inclusive)
 * @param y1 - 시작 Y 좌표 (0-indexed, inclusive)
 * @param x2 - 끝 X 좌표 (0-indexed, inclusive)
 * @param y2 - 끝 Y 좌표 (0-indexed, inclusive)
 * @param width - 이미지 너비
 * @returns 영역 내 픽셀 값의 합
 */
export function getAreaSum(
  integral: Uint32Array,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
): number {
  // 우측 하단 값
  const bottomRight = integral[y2 * width + x2];

  // 상단 제외 값 (y1-1 행까지)
  const topExclude = y1 > 0 ? integral[(y1 - 1) * width + x2] : 0;

  // 좌측 제외 값 (x1-1 열까지)
  const leftExclude = x1 > 0 ? integral[y2 * width + (x1 - 1)] : 0;

  // 좌상단 중복 복원 값
  const topLeftRestore = x1 > 0 && y1 > 0 ? integral[(y1 - 1) * width + (x1 - 1)] : 0;

  return bottomRight - topExclude - leftExclude + topLeftRestore;
}

/**
 * 영역의 평균 밀도 계산
 *
 * @param integral - 적분 이미지
 * @param x1 - 시작 X
 * @param y1 - 시작 Y
 * @param x2 - 끝 X
 * @param y2 - 끝 Y
 * @param width - 이미지 너비
 * @returns 영역 평균값
 */
export function getAreaAverage(
  integral: Uint32Array,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
): number {
  const sum = getAreaSum(integral, x1, y1, x2, y2, width);
  const area = (x2 - x1 + 1) * (y2 - y1 + 1);
  return sum / area;
}
