/**
 * canvasAnalyzer Module Tests
 * 썸네일 이미지 분석 알고리즘 단위 테스트
 * '스마트' 모드에서 썸네일 이미지 분석 알고리즘
 */
import { describe, it, expect } from 'vitest';
import {
  calculateBrightness,
  calculateComplexity,
  findBestPosition,
  analyzeGrid,
  type GridCell,
} from '@/features/thumbnail/analyzer';

describe('canvasAnalyzer', () => {
  // ========================================
  // Test 1.1: calculateBrightness
  // ========================================
  describe('calculateBrightness', () => {
    it('should return 0 for black (0, 0, 0)', () => {
      expect(calculateBrightness(0, 0, 0)).toBe(0);
    });

    it('should return 255 for white (255, 255, 255)', () => {
      expect(calculateBrightness(255, 255, 255)).toBe(255);
    });

    it('should calculate brightness using ITU-R BT.601 standard', () => {
      // Red only: 0.299 * 255 = 76.245
      const redBrightness = calculateBrightness(255, 0, 0);
      expect(redBrightness).toBeCloseTo(76.245, 1);

      // Green only: 0.587 * 255 = 149.685
      const greenBrightness = calculateBrightness(0, 255, 0);
      expect(greenBrightness).toBeCloseTo(149.685, 1);

      // Blue only: 0.114 * 255 = 29.07
      const blueBrightness = calculateBrightness(0, 0, 255);
      expect(blueBrightness).toBeCloseTo(29.07, 1);
    });

    it('should handle gray correctly (128, 128, 128)', () => {
      // 0.299*128 + 0.587*128 + 0.114*128 = 128
      expect(calculateBrightness(128, 128, 128)).toBeCloseTo(128, 0);
    });
  });

  // ========================================
  // Test 1.2: calculateComplexity
  // ========================================
  describe('calculateComplexity', () => {
    it('should return 0 for empty array', () => {
      expect(calculateComplexity([])).toBe(0);
    });

    it('should return 0 for uniform values (no variance)', () => {
      // 모두 같은 값 → 분산 = 0
      expect(calculateComplexity([100, 100, 100, 100])).toBe(0);
    });

    it('should return positive value for varied values', () => {
      // 다양한 값 → 분산 > 0
      const complexity = calculateComplexity([0, 100, 200, 255]);
      expect(complexity).toBeGreaterThan(0);
    });

    it('should calculate variance correctly', () => {
      // [0, 10] → 평균 = 5, 분산 = ((0-5)^2 + (10-5)^2) / 2 = 25
      expect(calculateComplexity([0, 10])).toBe(25);
    });

    it('should return higher complexity for more varied data', () => {
      const lowVariance = calculateComplexity([50, 50, 51, 51]);
      const highVariance = calculateComplexity([0, 100, 200, 255]);
      expect(highVariance).toBeGreaterThan(lowVariance);
    });
  });

  // ========================================
  // Test 1.3: findBestPosition
  // ========================================
  describe('findBestPosition', () => {
    it('should find the cell with lowest complexity', () => {
      const grid: GridCell[] = [
        { x: 0, y: 0, complexity: 100 },
        { x: 1, y: 0, complexity: 50 },
        { x: 0, y: 1, complexity: 10 }, // 최소 복잡도
        { x: 1, y: 1, complexity: 200 },
      ];

      const result = findBestPosition(grid, 2);

      // (0, 1) 셀의 중앙 위치 = (25%, 75%)
      expect(result.x).toBeCloseTo(25, 0);
      expect(result.y).toBeCloseTo(75, 0);
    });

    it('should return bottom cell when all have same complexity due to position bias', () => {
      const grid: GridCell[] = [
        { x: 0, y: 0, complexity: 50 },
        { x: 1, y: 0, complexity: 50 },
        { x: 0, y: 1, complexity: 50 },
        { x: 1, y: 1, complexity: 50 },
      ];

      const result = findBestPosition(grid, 2);

      // (0, 0)은 상단이라 점수가 높음 (나쁨). (0, 1) 또는 (1, 1)이 선택됨 (하단)
      // (1, 1)이 선택된 경우 = 75%, 75%
      expect(result.y).toBeCloseTo(75, 0);
    });

    it('should calculate percentage position correctly for 4x4 grid', () => {
      const grid: GridCell[] = [];
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          // (2, 2) 셀만 복잡도 0으로 설정
          grid.push({ x, y, complexity: x === 2 && y === 2 ? 0 : 100 });
        }
      }

      const result = findBestPosition(grid, 4);

      // (2, 2) 셀 중앙 = (62.5%, 62.5%)
      expect(result.x).toBeCloseTo(62.5, 0);
      expect(result.y).toBeCloseTo(62.5, 0);
    });
  });

  // ========================================
  // analyzeGrid (보조 테스트)
  // ========================================
  describe('analyzeGrid', () => {
    it('should create correct number of grid cells', () => {
      // 간단한 ImageData 모킹
      const width = 8;
      const height = 8;
      const data = new Uint8ClampedArray(width * height * 4);

      // 모든 픽셀을 회색으로 설정
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128; // R
        data[i + 1] = 128; // G
        data[i + 2] = 128; // B
        data[i + 3] = 255; // A
      }

      const imageData = { width, height, data } as ImageData;
      const grid = analyzeGrid(imageData, 4);

      // 4x4 = 16 셀
      expect(grid).toHaveLength(16);
    });

    it('should identify uniform areas as low complexity', () => {
      const width = 8;
      const height = 8;
      const data = new Uint8ClampedArray(width * height * 4);

      // 모든 픽셀을 동일 색상으로
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 100;
        data[i + 1] = 100;
        data[i + 2] = 100;
        data[i + 3] = 255;
      }

      const imageData = { width, height, data } as ImageData;
      const grid = analyzeGrid(imageData, 4);

      // 모든 셀의 복잡도가 0이어야 함 (균일한 색상)
      grid.forEach((cell) => {
        expect(cell.complexity).toBe(0);
      });
    });
  });
});
