/**
 * YouTube Speakify - Asset Loader Module
 * Dynamically detects and loads images from multiple folders.
 *
 * @module lib/assetLoader
 */
import { Logger } from '@/shared/lib/utils/logger';
import { IMAGE_PATHS, IMAGE_COUNT, ImageFolder } from '@/shared/config/constants';
import browser from 'webextension-polyfill';

/**
 * 이미지 로더 결과 타입
 */
export interface ImageAsset {
  url: string;
  folder: ImageFolder;
  index: number;
}

/**
 * AssetLoader 클래스
 * 특정 폴더의 이미지를 탐지하고 로드하는 기능을 담당
 */
export class AssetLoader {
  private highestImageIndex = 0;
  private readonly basePath: string;
  private readonly folderName: ImageFolder;

  constructor(folder: ImageFolder) {
    this.folderName = folder;
    this.basePath = IMAGE_PATHS[folder];
  }

  /**
   * Gets the full URL for an image by index
   * @param index - 이미지 인덱스 (1-based)
   */
  getImageURL(index: number): string {
    const path = `${this.basePath}${index}.png`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (browser.runtime as any).getURL(path);
  }

  /**
   * Gets image asset with metadata
   */
  getImageAsset(index: number): ImageAsset {
    return {
      url: this.getImageURL(index),
      folder: this.folderName,
      index,
    };
  }

  /**
   * 이미지 개수 초기화 (IMAGE_COUNT 상수 사용)
   * 네트워크 요청 없이 즉시 반환
   */
  async detectImageCount(): Promise<number> {
    this.highestImageIndex = IMAGE_COUNT[this.folderName];
    return this.highestImageIndex;
  }

  /**
   * Gets the current highest image index
   */
  getImageCount(): number {
    return this.highestImageIndex;
  }

  /**
   * Gets folder name
   */
  getFolderName(): ImageFolder {
    return this.folderName;
  }

  /**
   * Resets the loader state (for testing)
   */
  reset(): void {
    this.highestImageIndex = 0;
  }
}

// ============================================================
// AssetManager: 여러 폴더를 통합 관리
// ============================================================

/**
 * AssetManager 클래스
 * 여러 AssetLoader를 관리하고 통합 API 제공
 */
class AssetManager {
  private readonly loaders: Map<ImageFolder, AssetLoader> = new Map();

  constructor() {
    // 각 폴더별 로더 생성
    this.loaders.set('small', new AssetLoader('small'));
    this.loaders.set('big', new AssetLoader('big'));
  }

  /**
   * 특정 폴더의 로더 반환
   */
  getLoader(folder: ImageFolder): AssetLoader {
    return this.loaders.get(folder)!;
  }

  /**
   * 모든 폴더의 이미지 탐지
   */
  async detectAllImages(): Promise<void> {
    const results = await Promise.all([
      this.loaders.get('small')!.detectImageCount(),
      this.loaders.get('big')!.detectImageCount(),
    ]);

    Logger.info(`Detected images - small: ${results[0]}, big: ${results[1]}`);
  }

  /**
   * 모든 폴더의 총 이미지 개수
   */
  getTotalImageCount(): number {
    let total = 0;
    this.loaders.forEach((loader) => {
      total += loader.getImageCount();
    });
    return total;
  }

  /**
   * 랜덤 이미지 선택 (모든 폴더에서)
   * @param randomizer - Randomizer 인스턴스 (중복 방지용)
   */
  getRandomImage(randomIndex: number): ImageAsset {
    const smallCount = this.loaders.get('small')!.getImageCount();
    const bigCount = this.loaders.get('big')!.getImageCount();
    const total = smallCount + bigCount;

    if (total === 0) {
      throw new Error('No images available');
    }

    // 1 ~ total 범위의 인덱스를 폴더별로 분배
    if (randomIndex <= smallCount) {
      return this.loaders.get('small')!.getImageAsset(randomIndex);
    } else {
      return this.loaders.get('big')!.getImageAsset(randomIndex - smallCount);
    }
  }

  /**
   * 특정 폴더에서 이미지 URL 가져오기
   */
  getImageURL(folder: ImageFolder, index: number): string {
    return this.loaders.get(folder)!.getImageURL(index);
  }

  /**
   * 특정 폴더의 이미지 개수
   */
  getImageCount(folder: ImageFolder): number {
    return this.loaders.get(folder)!.getImageCount();
  }

  /**
   * 모든 이미지 URL을 배열로 반환 (Multi-Image Overlay용)
   */
  getAllImageUrls(): string[] {
    const urls: string[] = [];

    this.loaders.forEach((loader) => {
      const count = loader.getImageCount();
      for (let i = 1; i <= count; i++) {
        urls.push(loader.getImageURL(i));
      }
    });

    return urls;
  }

  /**
   * 모든 이미지 에셋 정보를 배열로 반환 (디버그 정보 포함)
   */
  getAllImageAssets(): ImageAsset[] {
    const assets: ImageAsset[] = [];

    this.loaders.forEach((loader, folder) => {
      const count = loader.getImageCount();
      for (let i = 1; i <= count; i++) {
        assets.push({
          folder,
          index: i,
          url: loader.getImageURL(i),
        });
      }
    });

    return assets;
  }
}

// ============================================================
// Singleton Export
// ============================================================

/** 전역 AssetManager 인스턴스 */
export const assetManager = new AssetManager();

// Legacy exports for backward compatibility
export const detectImageCount = (): Promise<void> => assetManager.detectAllImages();
export const getImageCount = (): number => assetManager.getTotalImageCount();
export const getImageURL = (index: number): string => {
  // Legacy: small 폴더만 사용하던 기존 코드 호환
  return assetManager.getImageURL('small', index);
};
