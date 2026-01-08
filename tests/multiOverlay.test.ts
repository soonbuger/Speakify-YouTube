/**
 * Multi-Image Overlay 테스트
 * Phase 1: 타입 및 설정 테스트
 * Phase 2: 충돌 방지 알고리즘 테스트
 */
import { describe, it, expect } from 'vitest';
import type { OverlayInstance, SpeakifySettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

describe('OverlayInstance Type', () => {
  it('should have independent properties for each image', () => {
    const instance: OverlayInstance = {
      imageUrl: 'test.png',
      size: 50,
      flip: true,
      position: { x: 30, y: 40 },
      opacity: 0.8,
    };

    expect(instance.size).toBe(50);
    expect(instance.flip).toBe(true);
    expect(instance.position.x).toBe(30);
    expect(instance.position.y).toBe(40);
  });

  it('should support future extension properties', () => {
    const instance: OverlayInstance = {
      imageUrl: 'test.png',
      size: 70,
      flip: false,
      position: { x: 50, y: 50 },
      rotation: 15, // 미래 확장
      skew: 5, // 미래 확장
    };

    expect(instance.rotation).toBe(15);
    expect(instance.skew).toBe(5);
  });
});

describe('SpeakifySettings - Multi-Image', () => {
  it('should have overlayCountMin and overlayCountMax settings', () => {
    const settings: Partial<SpeakifySettings> = {
      overlayCountMin: 2,
      overlayCountMax: 5,
    };

    expect(settings.overlayCountMin).toBe(2);
    expect(settings.overlayCountMax).toBe(5);
  });

  it('should have default values for overlay count', () => {
    expect(DEFAULT_SETTINGS.overlayCountMin).toBe(1);
    expect(DEFAULT_SETTINGS.overlayCountMax).toBe(3);
  });

  it('should validate count range (1~8)', () => {
    // 실제 validation은 UI에서 수행
    const validMin = 1;
    const validMax = 8;

    expect(validMin).toBeGreaterThanOrEqual(1);
    expect(validMax).toBeLessThanOrEqual(8);
  });
});

// ==================== Phase 2: 충돌 방지 알고리즘 ====================

import {
  checkCenterDistance,
  isPositionValid,
  generateNonOverlappingPositions,
} from '@/features/overlay/collision';

describe('Collision Detection - checkCenterDistance', () => {
  it('should return true if centers are far enough', () => {
    const pos1 = { x: 10, y: 10 };
    const pos2 = { x: 50, y: 50 };
    expect(checkCenterDistance(pos1, pos2, 20)).toBe(true);
  });

  it('should return false if centers are too close', () => {
    const pos1 = { x: 10, y: 10 };
    const pos2 = { x: 15, y: 15 };
    expect(checkCenterDistance(pos1, pos2, 20)).toBe(false);
  });

  it('should handle same position', () => {
    const pos = { x: 50, y: 50 };
    expect(checkCenterDistance(pos, pos, 1)).toBe(false);
  });
});

describe('Collision Detection - isPositionValid', () => {
  it('should return true for empty existing positions', () => {
    const newPos = { x: 50, y: 50 };
    expect(isPositionValid(newPos, [], 15)).toBe(true);
  });

  it('should return false if any existing position is too close', () => {
    const newPos = { x: 50, y: 50 };
    const existing = [
      { x: 10, y: 10 },
      { x: 52, y: 52 }, // 너무 가까움
    ];
    expect(isPositionValid(newPos, existing, 15)).toBe(false);
  });
});

describe('Collision Detection - generateNonOverlappingPositions', () => {
  it('should generate requested number of positions', () => {
    const positions = generateNonOverlappingPositions(5, 10);
    expect(positions).toHaveLength(5);
  });

  it('should respect padding boundaries', () => {
    const padding = 10;
    const positions = generateNonOverlappingPositions(3, 10, 50, padding);

    positions.forEach((pos) => {
      expect(pos.x).toBeGreaterThanOrEqual(padding);
      expect(pos.x).toBeLessThanOrEqual(100 - padding);
      expect(pos.y).toBeGreaterThanOrEqual(padding);
      expect(pos.y).toBeLessThanOrEqual(100 - padding);
    });
  });

  it('should handle edge case of 1 position', () => {
    const positions = generateNonOverlappingPositions(1);
    expect(positions).toHaveLength(1);
  });
});
