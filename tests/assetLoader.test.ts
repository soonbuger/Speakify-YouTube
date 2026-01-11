/**
 * AssetLoader Module Tests
 * Tests for image URL generation and count detection
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AssetLoader } from '@/shared/lib/assets/loader';
import { fakeBrowser } from 'wxt/testing';

// Mock browser global
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).browser = fakeBrowser;

// Mock fetch (이제 실제 fetch 안하지만 호환성 위해 남김)
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock Logger to avoid console output during tests
vi.mock('@/shared/lib/utils/logger', () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('AssetLoader', () => {
  let assetLoader: AssetLoader;

  beforeEach(() => {
    fakeBrowser.reset();
    assetLoader = new AssetLoader('small'); // small type -> expected count 15
    vi.clearAllMocks();

    // Mock getURL using fakeBrowser
    fakeBrowser.runtime.getURL = vi.fn((path: string) => `chrome-extension://test-id${path}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getImageURL', () => {
    it('should generate correct image URL format', () => {
      const url = assetLoader.getImageURL(1);

      expect(url).toBe('chrome-extension://test-id/images/1.png');
      expect(fakeBrowser.runtime.getURL).toHaveBeenCalledWith('/images/1.png');
    });

    it('should handle different image indexes', () => {
      expect(assetLoader.getImageURL(5)).toBe('chrome-extension://test-id/images/5.png');
      expect(assetLoader.getImageURL(100)).toBe('chrome-extension://test-id/images/100.png');
      expect(fakeBrowser.runtime.getURL).toHaveBeenCalledTimes(2);
    });
  });

  describe('getImageCount', () => {
    it('should return 0 initially', () => {
      // 초기 상태에서는 아직 감지 안됨
      expect(assetLoader.getImageCount()).toBe(0);
    });

    it('should return defined constant count after detection', async () => {
      // detectImageCount 호출
      await assetLoader.detectImageCount();

      // small 타입의 상수는 15
      expect(assetLoader.getImageCount()).toBe(15);
    });
  });

  describe('detectImageCount', () => {
    it('should resolve to constant count immediately', async () => {
      // 더 이상 fetch를 하지 않고 바로 상수를 반환해야 함
      const count = await assetLoader.detectImageCount();

      expect(count).toBe(15);
      expect(mockFetch).not.toHaveBeenCalled(); // fetch 호출 안함 확인
    });
  });

  describe('reset', () => {
    it('should reset image count to 0', async () => {
      // Setup
      await assetLoader.detectImageCount();
      expect(assetLoader.getImageCount()).toBe(15);

      // Reset
      assetLoader.reset();

      expect(assetLoader.getImageCount()).toBe(0);
    });
  });
});
