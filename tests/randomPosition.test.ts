/**
 * RandomPosition Module Tests
 * 가중치 기반 랜덤 위치 생성 유틸리티 테스트
 */
import { describe, it, expect } from 'vitest';
import { getRandomPosition } from '@/features/overlay/position';

describe('RandomPosition', () => {
  describe('getRandomPosition', () => {
    it('should return position within valid range (0-100%)', () => {
      const result = getRandomPosition(50);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.x).toBeLessThanOrEqual(100);
      expect(result.y).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeLessThanOrEqual(100);
    });

    it('should not place image outside container bounds', () => {
      // 이미지 크기가 30%일 때, 최대 x/y는 70%를 넘지 않아야 함
      const imageSize = 30;
      for (let i = 0; i < 50; i++) {
        const result = getRandomPosition(imageSize);
        expect(result.x + imageSize).toBeLessThanOrEqual(100);
        expect(result.y + imageSize).toBeLessThanOrEqual(100);
      }
    });

    it('should prefer bottom area (y > 50% more frequently)', () => {
      let bottomCount = 0;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const result = getRandomPosition(20);
        if (result.y > 33) bottomCount++;
      }

      // 최소 40% 이상 하단에 배치 (가중치 적용 확인)
      expect(bottomCount).toBeGreaterThanOrEqual(iterations * 0.4);
    });

    it('should avoid bottom-left corner (timestamp area)', () => {
      // 좌하단 영역 (x < 15%, y > 85%) 회피 테스트
      for (let i = 0; i < 50; i++) {
        const result = getRandomPosition(20);
        const isInTimestampArea = result.x < 15 && result.y > 85;
        expect(isInTimestampArea).toBe(false);
      }
    });

    it('should produce varied positions across multiple calls', () => {
      const positions = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const result = getRandomPosition(20);
        positions.add(`${Math.round(result.x)}-${Math.round(result.y)}`);
      }

      // 최소 5개 이상의 다른 위치가 생성되어야 함
      expect(positions.size).toBeGreaterThanOrEqual(5);
    });
  });
});
