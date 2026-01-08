/**
 * Color Analysis Service (No Worker - Main Thread Processing)
 * Worker was failing in WXT content script environment.
 * Using main thread with chunked processing for reasonable performance.
 */

import {
  calculateStats,
  applyReinhardTransfer,
  COLOR_SYNC_DEFAULTS,
  type ColorStats,
} from '../lib/colorMath';
import { LRUCache } from '../../../shared/lib/utils/lruCache';
import { Logger } from '@/shared/lib/utils/logger';

export class ColorAnalysisService {
  private static instance: ColorAnalysisService;
  private readonly cache: LRUCache<string, ColorStats>;
  private readonly characterCache: Map<
    string,
    { stats: ColorStats; width: number; height: number }
  >;
  private readonly blobUrlCache: LRUCache<string, string>;

  private constructor() {
    this.cache = new LRUCache(50);
    this.characterCache = new Map();
    this.blobUrlCache = new LRUCache(20);
    Logger.info('[ColorService] Initialized (Main Thread Mode)');
  }

  public static getInstance(): ColorAnalysisService {
    if (!ColorAnalysisService.instance) {
      ColorAnalysisService.instance = new ColorAnalysisService();
    }
    return ColorAnalysisService.instance;
  }

  /**
   * Analyzes a thumbnail image and returns color statistics.
   * Uses 64x64 downscale for performance.
   */
  public async analyzeThumbnail(url: string): Promise<ColorStats> {
    if (this.cache.has(url)) {
      Logger.info('[ColorService] Thumbnail cache hit');
      return this.cache.get(url)!;
    }

    try {
      Logger.info('[ColorService] Analyzing thumbnail:', url);
      const response = await fetch(url);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      // Downscale to 64x64 for fast processing
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context failed');

      ctx.drawImage(bitmap, 0, 0, 64, 64);
      bitmap.close();

      const imageData = ctx.getImageData(0, 0, 64, 64);
      const stats = calculateStats(imageData.data);

      Logger.info('[ColorService] Thumbnail analyzed:', stats.mean);
      this.cache.put(url, stats);
      return stats;
    } catch (err) {
      Logger.error('[ColorService] Failed to analyze thumbnail:', err);
      return { mean: { l: 50, a: 0, b: 0 }, std: { l: 0, a: 0, b: 0 } };
    }
  }

  /**
   * Analyzes a character image.
   */
  private async analyzeCharacter(url: string): Promise<{
    stats: ColorStats;
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  }> {
    Logger.info('[ColorService] Analyzing character:', url);

    if (this.characterCache.has(url)) {
      Logger.info('[ColorService] Character cache hit');
      const cached = this.characterCache.get(url)!;

      // Re-fetch for fresh canvas
      const response = await fetch(url);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);

      const canvas = document.createElement('canvas');
      canvas.width = cached.width;
      canvas.height = cached.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();

      return { ...cached, canvas, ctx };
    }

    const response = await fetch(url);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const { width, height } = bitmap;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context failed');

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const imageData = ctx.getImageData(0, 0, width, height);
    const stats = calculateStats(imageData.data);

    Logger.info('[ColorService] Character analyzed:', stats.mean);
    this.characterCache.set(url, { stats, width, height });

    return { stats, width, height, canvas, ctx };
  }

  /**
   * Generates a transformed Blob URL for the character image.
   * @param characterUrl URL of the character/overlay image
   * @param targetStats Color stats of the target thumbnail
   * @param strengthL Optional brightness strength override (0-1)
   * @param strengthAB Optional color tint strength override (0-1)
   */
  public async getTransformedBlobUrl(
    characterUrl: string,
    targetStats: ColorStats,
    strengthL?: number,
    strengthAB?: number,
  ): Promise<string> {
    // Use provided strengths or defaults
    const baseStrengthL = strengthL ?? COLOR_SYNC_DEFAULTS.STRENGTH_L;
    const baseStrengthAB = strengthAB ?? COLOR_SYNC_DEFAULTS.STRENGTH_AB;

    const statsHash = `${targetStats.mean.l.toFixed(1)}_${targetStats.std.l.toFixed(1)}_${baseStrengthL}_${baseStrengthAB}`;
    const cacheKey = `${characterUrl}_${statsHash}`;

    if (this.blobUrlCache.has(cacheKey)) {
      Logger.info('[ColorService] Blob URL cache hit');
      return this.blobUrlCache.get(cacheKey)!;
    }

    try {
      Logger.info('[ColorService] Transforming character...');
      const {
        stats: sourceStats,
        width,
        height,
        canvas,
        ctx,
      } = await this.analyzeCharacter(characterUrl);

      const imageData = ctx.getImageData(0, 0, width, height);

      // Calculate dynamic strengths based on thumbnail color variance
      // L (brightness) is always applied for lighting effect
      // A/B (color) is reduced on monochrome thumbnails
      const colorVariance = targetStats.std.l + targetStats.std.a + targetStats.std.b;

      // Use provided L strength
      const finalStrengthL = baseStrengthL;

      // Color tint strength: weaker on monochrome thumbnails
      let finalStrengthAB = baseStrengthAB;
      if (colorVariance < COLOR_SYNC_DEFAULTS.VARIANCE_THRESHOLD) {
        // Scale from MIN_STRENGTH_AB (at variance=0) to baseStrengthAB (at threshold)
        const ratio = colorVariance / COLOR_SYNC_DEFAULTS.VARIANCE_THRESHOLD;
        finalStrengthAB =
          COLOR_SYNC_DEFAULTS.MIN_STRENGTH_AB +
          ratio * (baseStrengthAB - COLOR_SYNC_DEFAULTS.MIN_STRENGTH_AB);
      }

      // Apply Reinhard Transfer with channel-separated strengths
      Logger.info(
        `[ColorService] Applying Reinhard transfer (L: ${finalStrengthL}, AB: ${finalStrengthAB.toFixed(2)})`,
      );
      applyReinhardTransfer(
        imageData.data,
        sourceStats,
        targetStats,
        finalStrengthL,
        finalStrengthAB,
      );

      ctx.putImageData(imageData, 0, 0);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            this.blobUrlCache.put(cacheKey, blobUrl);
            Logger.info('[ColorService] Transform complete:', blobUrl);
            resolve(blobUrl);
          } else {
            Logger.warn('[ColorService] toBlob failed, using original');
            resolve(characterUrl);
          }
        });
      });
    } catch (err) {
      Logger.error('[ColorService] Transformation failed:', err);
      return characterUrl;
    }
  }
}
