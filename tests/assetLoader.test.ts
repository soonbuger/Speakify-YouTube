/**
 * AssetLoader Module Tests
 * Tests for image URL generation and count detection
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AssetLoader } from '../src/lib/assetLoader';

// Mock browser global manually
const mockGetURL = vi.fn((path: string) => `chrome-extension://test-id${path}`);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).browser = {
  runtime: {
    getURL: mockGetURL,
  },
};

// Mock fetch for image existence checks
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Logger to avoid console output during tests
vi.mock('../src/lib/logger', () => ({
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
    assetLoader = new AssetLoader('small');
    vi.clearAllMocks();
    // Reset mockGetURL default behavior
    mockGetURL.mockImplementation((path: string) => `chrome-extension://test-id${path}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getImageURL', () => {
    it('should generate correct image URL format', () => {
      const url = assetLoader.getImageURL(1);

      expect(url).toBe('chrome-extension://test-id/images/1.png');
      expect(mockGetURL).toHaveBeenCalledWith('/images/1.png');
    });

    it('should handle different image indexes', () => {
      expect(assetLoader.getImageURL(5)).toBe('chrome-extension://test-id/images/5.png');
      expect(assetLoader.getImageURL(100)).toBe('chrome-extension://test-id/images/100.png');
      expect(mockGetURL).toHaveBeenCalledTimes(2);
    });
  });

  describe('getImageCount', () => {
    it('should return 0 initially', () => {
      expect(assetLoader.getImageCount()).toBe(0);
    });

    it('should return correct count after detection', async () => {
      // Setup: 5 images exist (1-5)
      mockFetch.mockImplementation((url: string) => {
        const match = url.match(/\/images\/(\d+)\.png/);
        if (match) {
          const index = parseInt(match[1], 10);
          return Promise.resolve({ ok: index <= 5 });
        }
        return Promise.resolve({ ok: false });
      });

      await assetLoader.detectImageCount();

      expect(assetLoader.getImageCount()).toBe(5);
    });
  });

  describe('detectImageCount', () => {
    it('should detect correct image count (10 images)', async () => {
      // 10개 이미지 존재 시뮬레이션
      mockFetch.mockImplementation((url: string) => {
        const match = url.match(/\/images\/(\d+)\.png/);
        if (match) {
          const index = parseInt(match[1], 10);
          return Promise.resolve({ ok: index <= 10 });
        }
        return Promise.resolve({ ok: false });
      });

      const count = await assetLoader.detectImageCount();

      expect(count).toBe(10);
    });

    it('should detect correct image count (1 image)', async () => {
      // 1개 이미지만 존재
      mockFetch.mockImplementation((url: string) => {
        const match = url.match(/\/images\/(\d+)\.png/);
        if (match) {
          const index = parseInt(match[1], 10);
          return Promise.resolve({ ok: index === 1 });
        }
        return Promise.resolve({ ok: false });
      });

      const count = await assetLoader.detectImageCount();

      expect(count).toBe(1);
    });

    it('should return 0 or less when no images exist', async () => {
      // 이미지 없음
      mockFetch.mockResolvedValue({ ok: false });

      const count = await assetLoader.detectImageCount();

      expect(count).toBeLessThanOrEqual(0);
    });

    it('should handle fetch errors gracefully', async () => {
      // fetch 에러 시뮬레이션
      mockFetch.mockRejectedValue(new Error('Network error'));

      const count = await assetLoader.detectImageCount();

      // 에러 시 0 이하 반환
      expect(count).toBeLessThanOrEqual(0);
    });
  });

  describe('reset', () => {
    it('should reset image count to 0', async () => {
      // Setup and detect
      mockFetch.mockImplementation((url: string) => {
        const match = url.match(/\/images\/(\d+)\.png/);
        if (match) {
          const index = parseInt(match[1], 10);
          return Promise.resolve({ ok: index <= 5 });
        }
        return Promise.resolve({ ok: false });
      });

      await assetLoader.detectImageCount();
      expect(assetLoader.getImageCount()).toBe(5);

      // Reset
      assetLoader.reset();

      expect(assetLoader.getImageCount()).toBe(0);
    });
  });
});
