/**
 * NeoNova Advanced Client-Side Image Preprocessing & Document Enhancement Engine
 * Provides ultra-fast, zero-lag canvas-based image correction:
 *  - Auto-Enhance / Document mode (adaptive contrast, shadow removal, white page leveling)
 *  - High-Contrast B&W / Binary mode (crisp pencil/ink strokes on clean background)
 *  - Sharpen / De-blur (unsharp mask convolution kernel)
 *  - Fine-tilt rotation & perspective straightening
 *  - High-quality crop & scale down to optimal OCR resolution (max 1600px)
 */

export type EnhancementFilter = 'original' | 'document' | 'grayscale' | 'high_contrast' | 'sharpen';

export interface ImageProcessingOptions {
  filter: EnhancementFilter;
  rotationDegrees: number; // 0, 90, 180, 270
  tiltDegrees: number; // -15 to +15 fine angle
  brightness: number; // -50 to +50 (default 0)
  contrast: number; // -50 to +50 (default 0)
  cropPercentages: {
    top: number; // 0 to 50
    bottom: number;
    left: number;
    right: number;
  };
  maxDimension?: number; // default 1600 for optimal OCR speed & accuracy
}

/**
 * Load image from Data URL or Object URL safely
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Apply 3x3 convolution kernel to ImageData
 */
function applyConvolutionKernel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  kernel: number[],
  weight: number = 1
): ImageData {
  const src = ctx.getImageData(0, 0, width, height);
  const srcData = src.data;
  const output = ctx.createImageData(width, height);
  const dstData = output.data;

  const half = 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      let kIndex = 0;

      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const pIndex = (py * width + px) * 4;
          const kVal = kernel[kIndex++];

          r += srcData[pIndex] * kVal;
          g += srcData[pIndex + 1] * kVal;
          b += srcData[pIndex + 2] * kVal;
        }
      }

      const outIndex = (y * width + x) * 4;
      dstData[outIndex] = Math.min(255, Math.max(0, r / weight));
      dstData[outIndex + 1] = Math.min(255, Math.max(0, g / weight));
      dstData[outIndex + 2] = Math.min(255, Math.max(0, b / weight));
      dstData[outIndex + 3] = srcData[outIndex + 3]; // Preserve alpha
    }
  }

  return output;
}

/**
 * Process image with rotation, cropping, filters, and scale optimizations
 */
export async function processAndEnhanceImage(
  imageSource: string,
  options: ImageProcessingOptions
): Promise<{ dataUrl: string; base64: string; mimeType: string; width: number; height: number }> {
  const img = await loadImage(imageSource);

  // 1. Calculate raw dimensions considering 90/270 rotation
  const totalRotation = (options.rotationDegrees + options.tiltDegrees) * (Math.PI / 180);
  const isSideways = options.rotationDegrees === 90 || options.rotationDegrees === 270;
  const rawW = isSideways ? img.height : img.width;
  const rawH = isSideways ? img.width : img.height;

  // 2. Crop calculations
  const { top, bottom, left, right } = options.cropPercentages;
  const cropX = (left / 100) * rawW;
  const cropY = (top / 100) * rawH;
  const cropW = Math.max(50, rawW * (1 - (left + right) / 100));
  const cropH = Math.max(50, rawH * (1 - (top + bottom) / 100));

  // 3. Scale down if larger than maxDimension to keep OCR fast and crisp without memory bloat
  const maxDim = options.maxDimension || 1600;
  let targetW = cropW;
  let targetH = cropH;
  if (targetW > maxDim || targetH > maxDim) {
    if (targetW >= targetH) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(targetW);
  canvas.height = Math.round(targetH);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to create 2D canvas context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill canvas with white background (useful for transparent pngs or margins)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 4. Transform, Rotate and Draw
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(totalRotation);

  const scaleFactorX = targetW / cropW;
  const scaleFactorY = targetH / cropH;
  const drawW = img.width * (isSideways ? scaleFactorY : scaleFactorX);
  const drawH = img.height * (isSideways ? scaleFactorX : scaleFactorY);

  const centerOffsetX = (cropX + cropW / 2 - rawW / 2) * (isSideways ? scaleFactorY : scaleFactorX);
  const centerOffsetY = (cropY + cropH / 2 - rawH / 2) * (isSideways ? scaleFactorX : scaleFactorY);

  if (isSideways) {
    ctx.drawImage(img, -drawW / 2 - centerOffsetY, -drawH / 2 - centerOffsetX, drawW, drawH);
  } else {
    ctx.drawImage(img, -drawW / 2 - centerOffsetX, -drawH / 2 - centerOffsetY, drawW, drawH);
  }
  ctx.restore();

  // 5. Apply Enhancement Filters & Color Grading
  if (options.filter !== 'original' || options.brightness !== 0 || options.contrast !== 0) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;

    // Contrast and brightness factors
    const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
    const brightnessVal = options.brightness * 2.5;

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness & user contrast
      if (options.brightness !== 0) {
        r = Math.min(255, Math.max(0, r + brightnessVal));
        g = Math.min(255, Math.max(0, g + brightnessVal));
        b = Math.min(255, Math.max(0, b + brightnessVal));
      }
      if (options.contrast !== 0) {
        r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
      }

      // Filter-specific enhancements
      if (options.filter === 'document') {
        // Document Auto-Enhance: Boost contrast, whiten shadows, sharpen dark ink
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 140) {
          // Flatten paper background to clean white
          const boost = Math.min(255, lum * 1.25 + 20);
          r = boost;
          g = boost;
          b = boost;
        } else {
          // Deepen text / ink
          const darken = Math.max(0, lum * 0.75 - 15);
          r = darken;
          g = darken;
          b = darken;
        }
      } else if (options.filter === 'grayscale') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray;
        g = gray;
        b = gray;
      } else if (options.filter === 'high_contrast') {
        // High contrast thresholding (binary scan mode)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const val = lum > 130 ? 255 : 0;
        r = val;
        g = val;
        b = val;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    ctx.putImageData(imgData, 0, 0);

    // Sharpen kernel if selected
    if (options.filter === 'sharpen') {
      const sharpenKernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ];
      const sharpened = applyConvolutionKernel(ctx, canvas.width, canvas.height, sharpenKernel, 1);
      ctx.putImageData(sharpened, 0, 0);
    }
  }

  // 6. Export optimized JPEG data
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const parts = dataUrl.split(',');
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const base64 = parts[1] || parts[0];

  return {
    dataUrl,
    base64,
    mimeType,
    width: canvas.width,
    height: canvas.height
  };
}

/**
 * Checks camera device capabilities for torch support
 */
export async function getCameraCapabilities(track: MediaStreamTrack | null): Promise<{
  supportsTorch: boolean;
  zoomRange?: { min: number; max: number; step: number };
}> {
  if (!track || typeof track.getCapabilities !== 'function') {
    return { supportsTorch: false };
  }
  try {
    const caps = track.getCapabilities() as any;
    return {
      supportsTorch: !!caps.torch,
      zoomRange: caps.zoom ? { min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step } : undefined
    };
  } catch {
    return { supportsTorch: false };
  }
}

/**
 * Toggle hardware flashlight / torch
 */
export async function toggleTorch(track: MediaStreamTrack | null, enable: boolean): Promise<boolean> {
  if (!track || typeof track.applyConstraints !== 'function') return false;
  try {
    await (track as any).applyConstraints({
      advanced: [{ torch: enable }]
    });
    return true;
  } catch {
    return false;
  }
}
