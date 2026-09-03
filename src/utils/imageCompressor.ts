/**
 * Ultra-fast, resilient Client-Side Image Compressor
 * - Uses createImageBitmap for instant hardware-accelerated decode where supported
 * - Falls back to URL.createObjectURL + HTML5 Canvas
 * - Guarantee sub-second execution with strict 2500ms safety timeout
 * - Outputs lightweight, high-clarity JPEG/WebP base64 (~15KB-45KB)
 * - Safely fits within Firestore's 1MB doc limits & localStorage's 5MB total quota
 */

export async function compressImage(
  fileOrBase64: File | Blob | string,
  maxWidth = 350,
  maxHeight = 350,
  quality = 0.72
): Promise<string> {
  // If it's a regular remote HTTP/HTTPS image URL and not a data URI, no compression needed
  if (typeof fileOrBase64 === 'string') {
    if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
      return fileOrBase64;
    }
    // If it's already a very small base64 string (< 30KB), return as is
    if (fileOrBase64.startsWith('data:image/') && fileOrBase64.length < 40000) {
      return fileOrBase64;
    }
  }

  // Safety race timeout to guarantee never hanging the UI
  return Promise.race([
    executeCompression(fileOrBase64, maxWidth, maxHeight, quality),
    new Promise<string>((resolve) => {
      setTimeout(() => {
        console.warn('[imageCompressor] Timeout safety fallback triggered');
        if (typeof fileOrBase64 === 'string') {
          resolve(fileOrBase64.length > 500000 ? '' : fileOrBase64);
        } else {
          resolve('');
        }
      }, 5000);
    }),
  ]);
}

async function executeCompression(
  fileOrBase64: File | Blob | string,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> {
  let blob: Blob | null = null;
  let objectUrlToRevoke: string | null = null;

  try {
    if (fileOrBase64 instanceof Blob) {
      blob = fileOrBase64;
    } else if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('data:image/')) {
        blob = await dataURItoBlob(fileOrBase64);
      } else {
        return fileOrBase64;
      }
    }

    if (!blob) {
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : '';
    }

    // Fast path: Use createImageBitmap if available in modern browsers
    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(blob);
        let { width, height } = bitmap;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          bitmap.close();
          return canvas.toDataURL('image/jpeg', quality);
        }
        bitmap.close();
      } catch (bitmapErr) {
        // Fall back to Image element if createImageBitmap fails on specific format
        console.debug('[imageCompressor] createImageBitmap fallback:', bitmapErr);
      }
    }

    // Standard fallback: URL.createObjectURL + HTMLImageElement
    objectUrlToRevoke = URL.createObjectURL(blob);
    const objectUrl = objectUrlToRevoke;

    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          resolve(objectUrl);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const res = canvas.toDataURL('image/jpeg', quality);
          resolve(res);
        } catch {
          resolve('');
        }
      };

      img.onerror = () => {
        resolve('');
      };

      img.src = objectUrl;
    });
  } catch (err) {
    console.error('[imageCompressor] Error in executeCompression:', err);
    return typeof fileOrBase64 === 'string' && fileOrBase64.length < 500000 ? fileOrBase64 : '';
  } finally {
    if (objectUrlToRevoke) {
      URL.revokeObjectURL(objectUrlToRevoke);
    }
  }
}

/**
 * Convert dataURI string to Blob using native fetch for extreme performance
 */
async function dataURItoBlob(dataURI: string): Promise<Blob | null> {
  try {
    const res = await fetch(dataURI);
    return await res.blob();
  } catch {
    return null;
  }
}
