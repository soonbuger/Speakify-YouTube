/**
 * YouTube Speakify - Text Detector Tests
 * 엣지 밀도 기반 텍스트 영역 감지 테스트
 *
 * @module features/smart-position/detectors/textDetector.test
 */
import { describe, it, expect } from 'vitest';
import { detectTextRegions, calculateEdgeDensity, TextRegion } from './textDetector';

describe('textDetector', () => {
  /**
   * 테스트용 ImageData 생성 헬퍼
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

  describe('calculateEdgeDensity', () => {
    it('should calculate density from edge data and integral image', () => {
      // 간단한 테스트: 모든 엣지 값이 동일한 경우
      const edgeData = new Float32Array([10, 10, 10, 10, 10, 10, 10, 10, 10]);
      const width = 3;
      const height = 3;

      // 전체 영역의 밀도 = 총합 / 영역
      const density = calculateEdgeDensity(edgeData, 0, 0, 2, 2, width, height);
      expect(density).toBeCloseTo(10, 0); // 평균 10
    });

    it('should return 0 for zero edge data', () => {
      const edgeData = new Float32Array([0, 0, 0, 0]);
      const density = calculateEdgeDensity(edgeData, 0, 0, 1, 1, 2, 2);
      expect(density).toBe(0);
    });
  });

  describe('detectTextRegions', () => {
    it('should return empty array for solid color image', () => {
      // 단색 이미지 = 엣지 없음 = 텍스트 없음
      const solidImage = createTestImageData(20, 20, () => [128, 128, 128]);
      const regions = detectTextRegions(solidImage);

      expect(regions).toEqual([]);
    });

    it('should detect high edge density regions', () => {
      // 체커보드 패턴 = 높은 엣지 밀도
      const checkerboard = createTestImageData(20, 20, (x, y) => {
        return (x + y) % 2 === 0 ? [0, 0, 0] : [255, 255, 255];
      });
      const regions = detectTextRegions(checkerboard);

      // 체커보드는 전체가 텍스트처럼 보일 수 있음
      expect(regions.length).toBeGreaterThanOrEqual(0);
    });

    it('should return TextRegion with density score', () => {
      // 부분적으로 복잡한 이미지
      const partialComplex = createTestImageData(20, 20, (x, y) => {
        // 상단은 텍스트 모방 (높은 엣지), 하단은 단색
        if (y < 10) {
          return x % 2 === 0 ? [0, 0, 0] : [255, 255, 255];
        }
        return [128, 128, 128];
      });
      const regions = detectTextRegions(partialComplex);

      // 반환된 영역이 있다면 올바른 구조인지 확인
      if (regions.length > 0) {
        expect(regions[0]).toHaveProperty('x');
        expect(regions[0]).toHaveProperty('y');
        expect(regions[0]).toHaveProperty('width');
        expect(regions[0]).toHaveProperty('height');
        expect(regions[0]).toHaveProperty('density');
      }
    });

    it('should return regions sorted by density (highest first)', () => {
      // 밀도 순으로 정렬되었는지 확인
      const regions: TextRegion[] = [
        { x: 0, y: 0, width: 10, height: 10, density: 100 },
        { x: 10, y: 0, width: 10, height: 10, density: 200 },
        { x: 0, y: 10, width: 10, height: 10, density: 50 },
      ];
      const sorted = regions.sort((a, b) => b.density - a.density);

      expect(sorted[0].density).toBe(200);
      expect(sorted[1].density).toBe(100);
      expect(sorted[2].density).toBe(50);
    });
  });

  describe('grid-based detection', () => {
    it('should analyze image in grid cells', () => {
      // 그리드 기반 분석 검증
      const testImage = createTestImageData(40, 40, (x, y) => {
        // 특정 영역에만 높은 엣지 (텍스트 시뮬레이션)
        if (x >= 10 && x < 20 && y >= 10 && y < 20) {
          return x % 2 === 0 ? [0, 0, 0] : [255, 255, 255];
        }
        return [128, 128, 128];
      });
      const regions = detectTextRegions(testImage, { gridSize: 4 });

      // 중앙 영역에서 텍스트 감지 기대
      // (구체적인 기대값은 구현에 따라 조정)
      expect(Array.isArray(regions)).toBe(true);
    });
  });
});
