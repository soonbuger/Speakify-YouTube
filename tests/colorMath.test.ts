import { describe, it, expect } from 'vitest';
import { rgbToLab, labToRgb, calculateStats } from '../src/features/color-analysis/lib/colorMath';

describe('colorMath', () => {
  describe('RGB <-> LAB Conversion', () => {
    // Reference values from online converters or standard formulas (D65)

    it('should convert pure black correctly', () => {
      const rgb = { r: 0, g: 0, b: 0 };
      const lab = rgbToLab(rgb);
      expect(lab.l).toBeCloseTo(0, 1);
      const back = labToRgb(lab);
      expect(back.r).toBe(0);
      expect(back.g).toBe(0);
      expect(back.b).toBe(0);
    });

    it('should convert pure white correctly', () => {
      const rgb = { r: 255, g: 255, b: 255 };
      const lab = rgbToLab(rgb);
      expect(lab.l).toBeCloseTo(100, 0.5); // L is 0-100
      const back = labToRgb(lab);
      expect(back.r).toBe(255);
      expect(back.g).toBe(255);
      expect(back.b).toBe(255);
    });

    it('should convert red correctly', () => {
      const rgb = { r: 255, g: 0, b: 0 };
      const lab = rgbToLab(rgb);
      // Roughly L=53, a=80, b=67
      expect(lab.l).toBeGreaterThan(50);
      const back = labToRgb(lab);
      expect(back.r).toBe(255);
      expect(back.g).toBe(0);
      expect(back.b).toBe(0);
    });
  });

  describe('Statistics Calculation (with Safe Rails)', () => {
    it('should calculate accurate mean and stdDev for simple block', () => {
      // Create a 2x2 pixel array: 2 White, 2 Black
      // R: [255, 255, 0, 0] -> Mean 127.5
      const pixels = new Uint8ClampedArray([
        255,
        255,
        255,
        255, // White
        255,
        255,
        255,
        255, // White
        0,
        0,
        0,
        255, // Black
        0,
        0,
        0,
        255, // Black
      ]);

      const stats = calculateStats(pixels);

      // L channel check
      // White L=100, Black L=0 -> Mean L=50
      expect(stats.mean.l).toBeCloseTo(50, 1);
      expect(stats.std.l).toBeGreaterThan(40); // High contrast
    });

    it('should IGNORE transparency (Alpha = 0)', () => {
      // 1 White Opaque, 1 Black Transparent
      // If transparent is ignored, stats should be purely White (Mean L=100, Std=0)
      const pixels = new Uint8ClampedArray([
        255,
        255,
        255,
        255, // White Opaque
        0,
        0,
        0,
        0, // Black Transparent (Should be ignored)
      ]);

      const stats = calculateStats(pixels);

      expect(stats.mean.l).toBeCloseTo(100, 1);
      expect(stats.std.l).toBeCloseTo(0, 1);
    });

    it('should handle zero deviation gracefully (Flat Color)', () => {
      // All White
      const pixels = new Uint8ClampedArray([255, 255, 255, 255, 255, 255, 255, 255]);

      const stats = calculateStats(pixels);
      expect(stats.std.l).toBe(0);
      expect(stats.std.a).toBe(0);
      expect(stats.std.b).toBe(0);
      // Ensure it doesn't return NaN or Infinity
    });
  });
});
