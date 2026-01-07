import { describe, it, expect, vi } from 'vitest';
import { getThumbnailImageUrl } from './processor';

// Mock dependencies
vi.mock('@/features/thumbnail/finder', () => ({
  findThumbnails: vi.fn(),
  markAsProcessed: vi.fn(),
}));

vi.mock('@/features/overlay/manager', () => ({
  applyOverlay: vi.fn(),
}));

vi.mock('@/shared/lib/assetLoader', () => ({
  assetManager: {
    getRandomImage: vi.fn().mockReturnValue({ url: 'mock-url', folder: 'mock', index: 0 }),
  },
  getImageCount: vi.fn().mockReturnValue(10),
}));

vi.mock('@/shared/lib/utils/logger', () => ({
  Logger: {
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('processor', () => {
  describe('getThumbnailImageUrl', () => {
    it('should return src if element is an image', () => {
      const img = document.createElement('img');
      img.src = 'https://example.com/thumb.jpg';
      expect(getThumbnailImageUrl(img)).toBe('https://example.com/thumb.jpg');
    });

    it('should find child image src', () => {
      const div = document.createElement('div');
      const img = document.createElement('img');
      img.src = 'https://example.com/child.jpg';
      div.appendChild(img);
      expect(getThumbnailImageUrl(div)).toBe('https://example.com/child.jpg');
    });

    it('should return null if no image found', () => {
      const div = document.createElement('div');
      expect(getThumbnailImageUrl(div)).toBeNull();
    });
  });

  // applyOverlayToThumbnails 테스트는 통합 테스트 성격이 강하므로
  // 여기서는 로직 분리가 잘 되었는지 기본 동작만 확인
});
