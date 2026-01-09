/**
 * YouTube Speakify - Integral Image Tests
 * 적분 이미지(Summed-Area Table) 테스트
 *
 * @module features/smart-position/core/integralImage.test
 */
import { describe, it, expect } from 'vitest';
import { createIntegralImage, getAreaSum } from './integralImage';

describe('integralImage', () => {
  describe('createIntegralImage', () => {
    it('should create integral image from 3x3 data', () => {
      // 3x3 테스트 데이터
      // [1, 2, 3]
      // [4, 5, 6]
      // [7, 8, 9]
      const data = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const width = 3;
      const height = 3;

      const integral = createIntegralImage(data, width, height);

      // 적분 이미지 결과:
      // [1,  3,  6]    (누적합)
      // [5, 12, 21]
      // [12, 27, 45]
      expect(integral[0]).toBe(1); // (0,0)
      expect(integral[1]).toBe(3); // (1,0): 1+2
      expect(integral[2]).toBe(6); // (2,0): 1+2+3
      expect(integral[3]).toBe(5); // (0,1): 1+4
      expect(integral[4]).toBe(12); // (1,1): 1+2+4+5
      expect(integral[5]).toBe(21); // (2,1): 1+2+3+4+5+6
      expect(integral[6]).toBe(12); // (0,2): 1+4+7
      expect(integral[7]).toBe(27); // (1,2): 1+2+4+5+7+8
      expect(integral[8]).toBe(45); // (2,2): 전체 합
    });

    it('should return Uint32Array', () => {
      const data = new Float32Array([1, 2, 3, 4]);
      const integral = createIntegralImage(data, 2, 2);

      expect(integral).toBeInstanceOf(Uint32Array);
      expect(integral.length).toBe(4);
    });

    it('should handle single pixel', () => {
      const data = new Float32Array([42]);
      const integral = createIntegralImage(data, 1, 1);

      expect(integral[0]).toBe(42);
    });
  });

  describe('getAreaSum', () => {
    // 3x3 적분 이미지 (위에서 계산된 값)
    // [1,  3,  6]
    // [5, 12, 21]
    // [12, 27, 45]
    const integral = new Uint32Array([1, 3, 6, 5, 12, 21, 12, 27, 45]);
    const width = 3;

    it('should calculate sum for entire image', () => {
      // 전체 영역 (0,0) ~ (2,2) = 45
      const sum = getAreaSum(integral, 0, 0, 2, 2, width);
      expect(sum).toBe(45);
    });

    it('should calculate sum for top-left corner', () => {
      // (0,0) ~ (0,0) = 1
      const sum = getAreaSum(integral, 0, 0, 0, 0, width);
      expect(sum).toBe(1);
    });

    it('should calculate sum for 2x2 sub-region', () => {
      // (0,0) ~ (1,1) = 1+2+4+5 = 12
      const sum = getAreaSum(integral, 0, 0, 1, 1, width);
      expect(sum).toBe(12);
    });

    it('should calculate sum for bottom-right 2x2', () => {
      // (1,1) ~ (2,2) = 5+6+8+9 = 28
      const sum = getAreaSum(integral, 1, 1, 2, 2, width);
      expect(sum).toBe(28);
    });

    it('should calculate sum for single cell in middle', () => {
      // (1,1) ~ (1,1) = 5
      const sum = getAreaSum(integral, 1, 1, 1, 1, width);
      expect(sum).toBe(5);
    });

    it('should calculate sum for first row', () => {
      // (0,0) ~ (2,0) = 1+2+3 = 6
      const sum = getAreaSum(integral, 0, 0, 2, 0, width);
      expect(sum).toBe(6);
    });

    it('should calculate sum for first column', () => {
      // (0,0) ~ (0,2) = 1+4+7 = 12
      const sum = getAreaSum(integral, 0, 0, 0, 2, width);
      expect(sum).toBe(12);
    });
  });
});
