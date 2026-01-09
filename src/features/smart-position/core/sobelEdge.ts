/**
 * YouTube Speakify - Sobel Edge Detector
 * 소벨 연산자를 이용한 엣지 검출
 *
 * 핵심 원리:
 * - 3x3 소벨 커널로 수평/수직 방향 기울기 계산
 * - 맨해튼 거리 근사로 성능 최적화 (sqrt 연산 회피)
 *
 * @module features/smart-position/core/sobelEdge
 */

/**
 * RGB를 그레이스케일로 변환 (ITU-R BT.601 가중치)
 *
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns 밝기 값 (0-255)
 */
export function toGrayscale(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * 기울기 크기 계산 (맨해튼 거리 근사)
 * sqrt(Gx² + Gy²) 대신 |Gx| + |Gy| 사용하여 성능 최적화
 *
 * @param gx - 수평 방향 기울기
 * @param gy - 수직 방향 기울기
 * @returns 기울기 크기
 */
export function calculateGradientMagnitude(gx: number, gy: number): number {
  return Math.abs(gx) + Math.abs(gy);
}

/**
 * 소벨 연산자를 적용하여 엣지 맵 생성
 *
 * 소벨 커널:
 * Gx = [-1  0  1]    Gy = [-1 -2 -1]
 *      [-2  0  2]         [ 0  0  0]
 *      [-1  0  1]         [ 1  2  1]
 *
 * @param imageData - Canvas ImageData 객체
 * @returns 엣지 강도 배열 (Float32Array, width * height)
 */
export function applySobelOperator(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const result = new Float32Array(width * height);

  // 1. RGB → 그레이스케일 변환
  const grayscale = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayscale[i] = toGrayscale(data[idx], data[idx + 1], data[idx + 2]);
  }

  // 2. 소벨 연산 적용 (경계 제외)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      // 3x3 영역의 픽셀 인덱스
      const tl = (y - 1) * width + (x - 1); // Top-Left
      const t = (y - 1) * width + x; // Top
      const tr = (y - 1) * width + (x + 1); // Top-Right
      const l = y * width + (x - 1); // Left
      const r = y * width + (x + 1); // Right
      const bl = (y + 1) * width + (x - 1); // Bottom-Left
      const b = (y + 1) * width + x; // Bottom
      const br = (y + 1) * width + (x + 1); // Bottom-Right

      // Gx = 수평 방향 기울기 (수직 엣지 감지)
      // [-1  0  1]
      // [-2  0  2]
      // [-1  0  1]
      const gx =
        -grayscale[tl] +
        grayscale[tr] +
        -2 * grayscale[l] +
        2 * grayscale[r] +
        -grayscale[bl] +
        grayscale[br];

      // Gy = 수직 방향 기울기 (수평 엣지 감지)
      // [-1 -2 -1]
      // [ 0  0  0]
      // [ 1  2  1]
      const gy =
        -grayscale[tl] +
        -2 * grayscale[t] +
        -grayscale[tr] +
        grayscale[bl] +
        2 * grayscale[b] +
        grayscale[br];

      // 맨해튼 거리로 기울기 크기 계산
      const idx = y * width + x;
      result[idx] = calculateGradientMagnitude(gx, gy);
    }
  }

  return result;
}
