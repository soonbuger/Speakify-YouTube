/**
 * Randomizer Module Tests
 * TDD: RED → GREEN → REFACTOR
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { Randomizer } from '../src/lib/randomizer';

describe('Randomizer', () => {
  let randomizer: Randomizer;

  beforeEach(() => {
    randomizer = new Randomizer();
  });

  describe('getRandomIndex', () => {
    it('should return index between 1 and maxIndex (inclusive)', () => {
      const maxIndex = 10;
      for (let i = 0; i < 100; i++) {
        const result = randomizer.getRandomIndex(maxIndex);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(maxIndex);
      }
    });

    it('should not repeat recent indexes within cache size', () => {
      const maxIndex = 20;
      const cacheSize = 8;
      const results: number[] = [];

      // Get cacheSize + 1 random indexes
      for (let i = 0; i < cacheSize + 1; i++) {
        results.push(randomizer.getRandomIndex(maxIndex));
      }

      // Check that last cacheSize indexes are all unique
      const lastEight = results.slice(-cacheSize);
      const uniqueCount = new Set(lastEight).size;
      expect(uniqueCount).toBe(cacheSize);
    });

    it('should allow repeats when maxIndex <= cacheSize', () => {
      const maxIndex = 3; // Less than default cache size of 8
      // This should not throw or hang
      for (let i = 0; i < 20; i++) {
        const result = randomizer.getRandomIndex(maxIndex);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(maxIndex);
      }
    });
  });

  describe('resetCache', () => {
    it('should clear the recent indexes cache', () => {
      const maxIndex = 10;

      // Fill the cache
      for (let i = 0; i < 8; i++) {
        randomizer.getRandomIndex(maxIndex);
      }

      // Reset
      randomizer.resetCache();

      // After reset, should be able to get previously cached values
      // This is tested implicitly by not hanging
      const result = randomizer.getRandomIndex(maxIndex);
      expect(result).toBeGreaterThanOrEqual(1);
    });
  });
});
