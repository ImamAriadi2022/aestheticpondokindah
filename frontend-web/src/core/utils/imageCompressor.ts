export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CompressedImageResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  format: "webp" | "jpeg" | "png";
}

/**
 * Compresses an image file and converts it into a high-performance WebP base64 DataURL.
 * Keeps the image sharp without blur while drastically reducing file size for fast rendering.
 */
export async function compressImageToWebP(
  file: File | Blob,
  options: ImageCompressOptions = {}
): Promise<CompressedImageResult> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("Gagal memuat format gambar"));

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal menginisialisasi canvas untuk kompresi"));
          return;
        }

        // Enable high quality bicubic smoothing to prevent blur
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format
        let dataUrl = canvas.toDataURL("image/webp", quality);
        let format: "webp" | "jpeg" | "png" = "webp";

        // Fallback to JPEG if browser does not support webp canvas export
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
          format = "jpeg";
        }

        // Estimate size in bytes
        const head = "data:image/" + format + ";base64,";
        const base64Length = dataUrl.length - head.length;
        const compressedSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize,
          width,
          height,
          format,
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
