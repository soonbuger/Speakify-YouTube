/**
 * YouTube Speakify - Sobel Edge Detector Tests
 * 소벨 연산자 기반 엣지 검출 테스트
 *
 * @module features/smart-position/core/sobelEdge.test
 */
import { describe, it, expect } from 'vitest';
import { applySobelOperator, calculateGradientMagnitude, toGrayscale } from './sobelEdge';

/**
 * 테스트용 ImageData 생성 헬퍼 (외부 스코프)
 */
function createTestImageData(
  width: number,
  height: number,
  pixelFn: (x: number, y: number) => [number, number, number],
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255; // Alpha
    }
  }

  return { data, width, height } as ImageData;
}

describe('sobelEdge', () => {
  describe('toGrayscale', () => {
    it('should convert RGB to grayscale using ITU-R BT.601 weights', () => {
      // 흰색 (255, 255, 255) → 255
      expect(toGrayscale(255, 255, 255)).toBeCloseTo(255, 0);

      // 검정색 (0, 0, 0) → 0
      expect(toGrayscale(0, 0, 0)).toBe(0);

      // 빨강색 (255, 0, 0) → 0.299 * 255 ≈ 76.245
      expect(toGrayscale(255, 0, 0)).toBeCloseTo(76.245, 0);

      // 초록색 (0, 255, 0) → 0.587 * 255 ≈ 149.685
      expect(toGrayscale(0, 255, 0)).toBeCloseTo(149.685, 0);

      // 파랑색 (0, 0, 255) → 0.114 * 255 ≈ 29.07
      expect(toGrayscale(0, 0, 255)).toBeCloseTo(29.07, 0);
    });
  });

  describe('calculateGradientMagnitude', () => {
    it('should return Manhattan distance approximation', () => {
      // |3| + |4| = 7 (맨해튼 거리)
      expect(calculateGradientMagnitude(3, 4)).toBe(7);

      // |-5| + |2| = 7
      expect(calculateGradientMagnitude(-5, 2)).toBe(7);

      // |0| + |0| = 0
      expect(calculateGradientMagnitude(0, 0)).toBe(0);
    });
  });

  describe('applySobelOperator', () => {
    it('should return low edge values for solid color image', () => {
      // 단색 이미지 (모든 픽셀이 회색)
      const solidGray = createTestImageData(5, 5, () => [128, 128, 128]);
      const result = applySobelOperator(solidGray);

      // 모든 값이 0 또는 매우 낮아야 함
      const maxValue = Math.max(...result);
      expect(maxValue).toBe(0);
    });

    it('should detect vertical edges (high Gx)', () => {
      // 수직 엣지: 왼쪽은 검정, 오른쪽은 흰색
      const verticalEdge = createTestImageData(5, 5, (x) => {
        return x < 2 ? [0, 0, 0] : [255, 255, 255];
      });
      const result = applySobelOperator(verticalEdge);

      // 중앙 열 (x=2) 근처에서 높은 값 예상
      // 5x5 이미지에서 중앙 픽셀 (2,2) 확인
      const centerIdx = 2 * 5 + 2; // y=2, x=2
      expect(result[centerIdx]).toBeGreaterThan(0);
    });

    it('should detect horizontal edges (high Gy)', () => {
      // 수평 엣지: 상단은 검정, 하단은 흰색
      const horizontalEdge = createTestImageData(5, 5, (_, y) => {
        return y < 2 ? [0, 0, 0] : [255, 255, 255];
      });
      const result = applySobelOperator(horizontalEdge);

      // 중앙 행 (y=2) 근처에서 높은 값 예상
      const centerIdx = 2 * 5 + 2;
      expect(result[centerIdx]).toBeGreaterThan(0);
    });

    it('should return Float32Array with correct size', () => {
      const testImage = createTestImageData(10, 8, () => [100, 100, 100]);
      const result = applySobelOperator(testImage);

      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(10 * 8);
    });
  });
});
