/**
 * Resizes an image to 500x500 and converts it to WebP format
 * @param imageSrc - The source image (File, Blob, or data URL)
 * @param cropArea - Optional crop area {x, y, width, height}
 * @returns Promise<Blob> - The processed image as a WebP Blob
 */
export async function processImage(
  imageSrc: File | Blob | string,
  cropArea?: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to 500x500
      canvas.width = 500;
      canvas.height = 500;

      // Calculate source dimensions
      let sx = 0;
      let sy = 0;
      let sWidth = img.width;
      let sHeight = img.height;

      // Apply crop area if provided
      if (cropArea) {
        sx = cropArea.x;
        sy = cropArea.y;
        sWidth = cropArea.width;
        sHeight = cropArea.height;
      }

      // Fill background with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 500, 500);

      // Draw the cropped image, scaling it to fill the entire 500x500 canvas
      // This will stretch/squash if aspect ratio doesn't match, but ensures 500x500 output
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 500, 500);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image to WebP'));
          }
        },
        'image/webp',
        0.9, // Quality (0-1)
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Set image source
    if (imageSrc instanceof File || imageSrc instanceof Blob) {
      img.src = URL.createObjectURL(imageSrc);
    } else {
      img.src = imageSrc;
    }
  });
}

/**
 * Creates a data URL from a File or Blob
 */
export function createImageUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
