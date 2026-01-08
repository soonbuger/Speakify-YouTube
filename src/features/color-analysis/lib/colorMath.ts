export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LabColor {
  l: number;
  a: number;
  b: number;
}

export interface ChannelStats {
  l: number;
  a: number;
  b: number;
}

export interface ColorStats {
  mean: ChannelStats;
  std: ChannelStats;
}

/**
 * Color Sync 기본 설정값 (중앙 관리)
 * 이 값을 변경하면 전체 Color Sync 동작이 조정됨
 */
export const COLOR_SYNC_DEFAULTS = {
  /** L (밝기) 채널 강도 - 조명 효과 */
  STRENGTH_L: 0.2,
  /** A/B (색상) 채널 강도 - 색조 효과 */
  STRENGTH_AB: 0.25,
  /** 단색 배경에서의 최소 A/B 강도 */
  MIN_STRENGTH_AB: 0.05,
  /** 색상 분산 임계값 (이 이하면 단색으로 처리) */
  VARIANCE_THRESHOLD: 45,
};

/**
 * Converts RGB to LAB using D65 illuminant.
 * RGB range: 0-255
 * L: 0-100, a: -128-127, b: -128-127
 */
export function rgbToLab(rgb: RGB): LabColor {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  };
}

/**
 * Converts LAB to RGB.
 * Returns RGB in range 0-255 clamped.
 */
export function labToRgb(lab: LabColor): RGB {
  let y = (lab.l + 16) / 116;
  let x = lab.a / 500 + y;
  let z = y - lab.b / 200;

  x = 0.95047 * (Math.pow(x, 3) > 0.008856 ? Math.pow(x, 3) : (x - 16 / 116) / 7.787);
  y = 1 * (Math.pow(y, 3) > 0.008856 ? Math.pow(y, 3) : (y - 16 / 116) / 7.787);
  z = 1.08883 * (Math.pow(z, 3) > 0.008856 ? Math.pow(z, 3) : (z - 16 / 116) / 7.787);

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.204 + z * 1.057;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(b * 255))),
  };
}

/**
 * Calculates Mean and Standard Deviation of LAB colors from pixel data.
 * IMPORTANT: Ignores fully transparent pixels (Alpha = 0).
 */
export function calculateStats(pixels: Uint8ClampedArray): ColorStats {
  let count = 0;

  let sumL = 0;
  let sumA = 0;
  let sumB = 0;
  let sqSumL = 0;
  let sqSumA = 0;
  let sqSumB = 0;

  // 1st Pass: Compute LAB values and Sums
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const alpha = pixels[i + 3];

    if (alpha > 0) {
      const lab = rgbToLab({ r, g, b });

      sumL += lab.l;
      sumA += lab.a;
      sumB += lab.b;

      sqSumL += lab.l * lab.l;
      sqSumA += lab.a * lab.a;
      sqSumB += lab.b * lab.b;

      count++;
    }
  }

  if (count === 0) {
    return {
      mean: { l: 0, a: 0, b: 0 },
      std: { l: 0, a: 0, b: 0 },
    };
  }

  const meanL = sumL / count;
  const meanA = sumA / count;
  const meanB = sumB / count;

  // Variance = (SumSq / N) - (Mean^2)
  const varL = Math.max(0, sqSumL / count - meanL * meanL);
  const varA = Math.max(0, sqSumA / count - meanA * meanA);
  const varB = Math.max(0, sqSumB / count - meanB * meanB);

  return {
    mean: { l: meanL, a: meanA, b: meanB },
    std: {
      l: Math.sqrt(varL),
      a: Math.sqrt(varA),
      b: Math.sqrt(varB),
    },
  };
}

/**
 * Applies Reinhard Color Transfer to a single pixel (in LAB space).
 * Returns the new L, A, B values.
 */
function transferChannel(
  sourceVal: number,
  sourceMean: number,
  sourceStd: number,
  targetMean: number,
  targetStd: number,
): number {
  const stdRatio = sourceStd < 0.1 ? 1 : targetStd / sourceStd;

  // Safety Clamp: Don't scale contrast by more than 2x or less than 0.3x
  const clampedRatio = Math.max(0.3, Math.min(stdRatio, 2));

  return clampedRatio * (sourceVal - sourceMean) + targetMean;
}

/**
 * Applies Reinhard Color Transfer to a source image's pixel data.
 * Uses separate strengths for brightness (L) and color (A/B) channels
 * for natural "lighting" effect instead of full color transfer.
 *
 * @param sourcePixels Input image data (modified in place)
 * @param sourceStats Pre-calculated stats of source
 * @param targetStats Stats of the target (thumbnail)
 * @param strengthL Intensity of brightness transfer (0 = none, 1 = full). Default: 0.5
 * @param strengthAB Intensity of color tint transfer (0 = none, 1 = full). Default: 0.2
 */
export function applyReinhardTransfer(
  sourcePixels: Uint8ClampedArray,
  sourceStats: ColorStats,
  targetStats: ColorStats,
  strengthL: number = COLOR_SYNC_DEFAULTS.STRENGTH_L,
  strengthAB: number = COLOR_SYNC_DEFAULTS.STRENGTH_AB,
): void {
  // Clamp strengths to valid range
  const sL = Math.max(0, Math.min(1, strengthL));
  const sAB = Math.max(0, Math.min(1, strengthAB));

  for (let i = 0; i < sourcePixels.length; i += 4) {
    const alpha = sourcePixels[i + 3];
    if (alpha === 0) continue; // Skip transparent pixels

    const rgb = {
      r: sourcePixels[i],
      g: sourcePixels[i + 1],
      b: sourcePixels[i + 2],
    };

    const originalLab = rgbToLab(rgb);

    // Calculate transferred LAB values
    const transferredL = transferChannel(
      originalLab.l,
      sourceStats.mean.l,
      sourceStats.std.l,
      targetStats.mean.l,
      targetStats.std.l,
    );
    const transferredA = transferChannel(
      originalLab.a,
      sourceStats.mean.a,
      sourceStats.std.a,
      targetStats.mean.a,
      targetStats.std.a,
    );
    const transferredB = transferChannel(
      originalLab.b,
      sourceStats.mean.b,
      sourceStats.std.b,
      targetStats.mean.b,
      targetStats.std.b,
    );

    // Blend with different strengths: stronger on L (lighting), weaker on A/B (color)
    const finalLab = {
      l: originalLab.l + (transferredL - originalLab.l) * sL,
      a: originalLab.a + (transferredA - originalLab.a) * sAB,
      b: originalLab.b + (transferredB - originalLab.b) * sAB,
    };

    const newRgb = labToRgb(finalLab);

    sourcePixels[i] = newRgb.r;
    sourcePixels[i + 1] = newRgb.g;
    sourcePixels[i + 2] = newRgb.b;
    // Alpha remains unchanged
  }
}
