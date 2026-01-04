/**
 * YouTube Speakify - Asset Loader Module
 * Dynamically detects and loads images from the public/images folder.
 *
 * @module lib/assetLoader
 */
import { Logger } from './logger';
import { IMAGES_PATH } from './constants';

/**
 * AssetLoader 클래스
 * 이미지 탐지 및 로드 기능을 캡슐화하여 테스트 용이성 향상
 */
export class AssetLoader {
  private highestImageIndex = 0;

  /**
   * Gets the full URL for an image by index
   * @param index - 이미지 인덱스 (1-based)
   */
  getImageURL(index: number): string {
    // WXT의 PublicPath 타입 제한을 우회 (동적 경로 사용)
    const path = `${IMAGES_PATH}${index}.png`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (browser.runtime as any).getURL(path);
  }

  /**
   * Checks if an image exists at the given index
   * @param index - 이미지 인덱스
   */
  private async checkImageExistence(index: number): Promise<boolean> {
    try {
      const response = await fetch(this.getImageURL(index));
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Detects the highest image index using Binary Search
   * 지수 증가 + 이진 탐색으로 효율적인 이미지 수 탐지
   */
  async detectImageCount(): Promise<number> {
    const INITIAL_INDEX = 4;
    let i = INITIAL_INDEX;

    // Exponential increase to find upper bound
    while (await this.checkImageExistence(i)) {
      i *= 2;
    }

    // Binary search for exact count
    let min = i <= INITIAL_INDEX ? 1 : i / 2;
    let max = i;

    while (min <= max) {
      const mid = Math.floor((min + max) / 2);
      if (await this.checkImageExistence(mid)) {
        min = mid + 1;
      } else {
        max = mid - 1;
      }
    }

    this.highestImageIndex = max;
    Logger.info(`Detected ${this.highestImageIndex} images`);
    return this.highestImageIndex;
  }

  /**
   * Gets the current highest image index
   */
  getImageCount(): number {
    return this.highestImageIndex;
  }

  /**
   * Resets the loader state (for testing)
   */
  reset(): void {
    this.highestImageIndex = 0;
  }
}

// Default singleton instance for convenience
const assetLoader = new AssetLoader();

// Legacy exports for backward compatibility
export const getImageURL = (index: number): string => assetLoader.getImageURL(index);
export const detectImageCount = (): Promise<number> => assetLoader.detectImageCount();
export const getImageCount = (): number => assetLoader.getImageCount();

export { assetLoader };
