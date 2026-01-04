/**
 * OverlayManager Module Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { applyOverlay, isAlreadyProcessed, getExtensionName } from '../src/lib/overlayManager';

describe('OverlayManager', () => {
  let parentElement: HTMLDivElement;
  let thumbnailElement: HTMLImageElement;

  beforeEach(() => {
    // Create DOM structure
    parentElement = document.createElement('div');
    thumbnailElement = document.createElement('img');
    thumbnailElement.src = 'https://example.com/thumbnail.jpg';
    parentElement.appendChild(thumbnailElement);
    document.body.appendChild(parentElement);
  });

  describe('applyOverlay', () => {
    it('should create an overlay image element', () => {
      const result = applyOverlay(thumbnailElement, 'https://example.com/overlay.png');

      expect(result).not.toBeNull();
      expect(result?.tagName).toBe('IMG');
      expect(result?.src).toBe('https://example.com/overlay.png');
    });

    it('should return null if no URL provided', () => {
      const result = applyOverlay(thumbnailElement, '');
      expect(result).toBeNull();
    });

    it('should apply center position by default', () => {
      const result = applyOverlay(thumbnailElement, 'https://example.com/overlay.png');

      expect(result?.style.top).toBe('50%');
      expect(result?.style.left).toBe('50%');
      expect(result?.style.transform).toContain('translate(-50%, -50%)');
    });

    it('should apply bottom-right position', () => {
      const result = applyOverlay(thumbnailElement, 'https://example.com/overlay.png', {
        position: 'bottom-right',
      });

      expect(result?.style.bottom).toBe('8px');
      expect(result?.style.right).toBe('8px');
    });

    it('should apply flip transform', () => {
      const result = applyOverlay(thumbnailElement, 'https://example.com/overlay.png', {
        flip: true,
      });

      expect(result?.style.transform).toContain('scaleX(-1)');
    });

    it('should apply custom opacity', () => {
      const result = applyOverlay(thumbnailElement, 'https://example.com/overlay.png', {
        opacity: 0.5,
      });

      expect(result?.style.opacity).toBe('0.5');
    });
  });

  describe('isAlreadyProcessed', () => {
    it('should return false for unprocessed element', () => {
      expect(isAlreadyProcessed(thumbnailElement)).toBe(false);
    });

    it('should return true after overlay is applied', () => {
      applyOverlay(thumbnailElement, 'https://example.com/overlay.png');
      expect(isAlreadyProcessed(thumbnailElement)).toBe(true);
    });
  });

  describe('getExtensionName', () => {
    it('should return the extension name', () => {
      expect(getExtensionName()).toBe('YouTube Speakify');
    });
  });
});
