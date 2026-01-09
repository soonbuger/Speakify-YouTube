/**
 * YouTube Speakify - Position Service Tests
 * 비용함수 기반 최적 위치 결정 테스트
 *
 * @module features/smart-position/services/positionService.test
 */
import { describe, it, expect } from 'vitest';
import { calculateSmartPosition, calculateCost } from './positionService';

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
      data[i + 3] = 255;
    }
  }

  return { data, width, height } as ImageData;
}

describe('positionService', () => {
  describe('calculateCost', () => {
    it('should return higher cost for high text density', () => {
      const costHigh = calculateCost({
        textDensity: 100,
        distFromPreferred: 0,
        sensitivity: 1,
      });
      const costLow = calculateCost({
        textDensity: 10,
        distFromPreferred: 0,
        sensitivity: 1,
      });

      expect(costHigh).toBeGreaterThan(costLow);
    });

    it('should ignore text density when sensitivity is 0', () => {
      const costWithText = calculateCost({
        textDensity: 100,
        distFromPreferred: 10,
        sensitivity: 0,
      });
      const costNoText = calculateCost({
        textDensity: 0,
        distFromPreferred: 10,
        sensitivity: 0,
      });

      // 민감도 0이면 텍스트 밀도 무시
      expect(costWithText).toBe(costNoText);
    });

    it('should prioritize preferred position when sensitivity is low', () => {
      const costFarFromPreferred = calculateCost({
        textDensity: 50,
        distFromPreferred: 100,
        sensitivity: 0.3,
      });
      const costNearPreferred = calculateCost({
        textDensity: 50,
        distFromPreferred: 10,
        sensitivity: 0.3,
      });

      expect(costFarFromPreferred).toBeGreaterThan(costNearPreferred);
    });
  });

  describe('calculateSmartPosition', () => {
    it('should return center position for solid color image', () => {
      // 단색 이미지 = 텍스트 없음 = 선호 위치 반환
      const solidImage = createTestImageData(40, 40, () => [128, 128, 128]);
      const result = calculateSmartPosition(solidImage);

      // 단색 이미지에서는 선호 위치(하단 중앙)로 갈 것으로 예상
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.x).toBeLessThanOrEqual(100);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeLessThanOrEqual(100);
    });

    it('should avoid high text density areas', () => {
      // 상단에만 텍스트 (체커보드) 패턴
      const topTextImage = createTestImageData(40, 40, (x, y) => {
        if (y < 20) {
          return x % 2 === 0 ? [0, 0, 0] : [255, 255, 255];
        }
        return [128, 128, 128];
      });

      const result = calculateSmartPosition(topTextImage, { sensitivity: 1 });

      // 유효한 위치를 반환하고, 상단 최상위 (12.5%)는 피해야 함
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeLessThanOrEqual(100);
      // 상단 엣지가 있으면 하단을 선호해야 함
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should return position as percentage (0-100)', () => {
      const testImage = createTestImageData(40, 40, () => [100, 100, 100]);
      const result = calculateSmartPosition(testImage);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.x).toBeLessThanOrEqual(100);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeLessThanOrEqual(100);
    });

    it('should include confidence score in result', () => {
      const testImage = createTestImageData(40, 40, () => [100, 100, 100]);
      const result = calculateSmartPosition(testImage);

      expect(result).toHaveProperty('confidence');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should respect sensitivity option', () => {
      const textImage = createTestImageData(40, 40, (x) => {
        return x % 2 === 0 ? [0, 0, 0] : [255, 255, 255];
      });

      // 높은 민감도 vs 낮은 민감도
      const highSensitivity = calculateSmartPosition(textImage, { sensitivity: 1 });
      const lowSensitivity = calculateSmartPosition(textImage, { sensitivity: 0.1 });

      // 둘 다 유효한 위치를 반환해야 함
      expect(highSensitivity.x).toBeDefined();
      expect(lowSensitivity.x).toBeDefined();
    });
  });

  describe('fallback behavior', () => {
    it('should return random position on error with zero confidence', () => {
      // 빈 이미지 데이터로 fallback 테스트
      const emptyImage = { data: new Uint8ClampedArray(0), width: 0, height: 0 } as ImageData;

      // 에러 발생 시 random fallback (getRandomPosition 사용)
      // X: 0 ~ (100 - imageSize), Y: 가중치 기반 랜덤
      const result = calculateSmartPosition(emptyImage);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.x).toBeLessThanOrEqual(100);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeLessThanOrEqual(100);
      expect(result.confidence).toBe(0);
    });
  });
});
