/**
 * YouTube Speakify - Randomizer Module
 * Provides non-repeating random image selection using FIFO cache.
 *
 * @module lib/randomizer
 */

/**
 * Randomizer class for non-repeating random selection
 */
export class Randomizer {
  private readonly cacheSize: number;
  private recentIndexes: number[] = [];

  /**
   * Creates a new Randomizer instance
   * @param cacheSize - Number of recent indexes to track (default: 8)
   */
  constructor(cacheSize = 8) {
    this.cacheSize = cacheSize;
  }

  /**
   * Gets a random index that hasn't been used recently
   * @param maxIndex - Maximum index value (inclusive, 1-based)
   * @returns Random non-repeating index between 1 and maxIndex
   */
  getRandomIndex(maxIndex: number): number {
    // If fewer images than cache size, allow repeats
    if (maxIndex <= this.cacheSize) {
      return Math.floor(Math.random() * maxIndex) + 1;
    }

    let randomIndex = -1;

    // Keep picking until we find a non-repeated index
    while (this.recentIndexes.includes(randomIndex) || randomIndex < 1) {
      randomIndex = Math.floor(Math.random() * maxIndex) + 1;
    }

    // Update cache (FIFO)
    if (this.recentIndexes.length >= this.cacheSize) {
      this.recentIndexes.shift();
    }
    this.recentIndexes.push(randomIndex);

    return randomIndex;
  }

  /**
   * Clears the recent indexes cache
   */
  resetCache(): void {
    this.recentIndexes = [];
  }
}

// Default singleton instance for convenience
export const randomizer = new Randomizer();
