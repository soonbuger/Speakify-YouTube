import { calculateStats, applyReinhardTransfer, ColorStats } from '../lib/colorMath';

export type WorkerMessage =
  | { type: 'ANALYZE_THUMBNAIL'; id: string; bitmap: ImageBitmap }
  | {
      type: 'APPLY_TRANSFER';
      id: string;
      sourcePixels: Uint8ClampedArray;
      sourceStats: ColorStats;
      targetStats: ColorStats;
    };

export type WorkerResponse =
  | { type: 'ANALYSIS_COMPLETE'; id: string; stats: ColorStats }
  | { type: 'TRANSFER_COMPLETE'; id: string; pixels: Uint8ClampedArray }
  | { type: 'ERROR'; id: string; error: string };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, id } = e.data;

  try {
    if (type === 'ANALYZE_THUMBNAIL') {
      const bitmap = e.data.bitmap;
      const offscreen = new OffscreenCanvas(64, 64);
      const ctx = offscreen.getContext('2d');
      if (!ctx) throw new Error('Failed to get OffscreenCanvas context');

      // Draw resized image for fast stats
      ctx.drawImage(bitmap, 0, 0, 64, 64);
      const imageData = ctx.getImageData(0, 0, 64, 64);

      const stats = calculateStats(imageData.data);

      // Close bitmap to free memory
      bitmap.close();

      self.postMessage({ type: 'ANALYSIS_COMPLETE', id, stats });
    } else if (type === 'APPLY_TRANSFER') {
      const { sourcePixels, sourceStats, targetStats } = e.data;

      // Modify pixels in place
      applyReinhardTransfer(sourcePixels, sourceStats, targetStats);

      // Transfer ownership back if possible, or just copy
      self.postMessage({ type: 'TRANSFER_COMPLETE', id, pixels: sourcePixels }, [
        sourcePixels.buffer,
      ]);
    }
  } catch (err) {
    self.postMessage({ type: 'ERROR', id, error: (err as Error).message });
  }
};
