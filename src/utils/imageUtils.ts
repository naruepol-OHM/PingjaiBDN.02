/**
 * Safe Image Compression and Processing Utility
 * Prevents main thread freeze and localStorage QuotaExceededError by resizing and compressing images before saving.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

export const compressImageFile = async (
  file: File,
  options: CompressImageOptions = {}
): Promise<string> => {
  const {
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.82,
    mimeType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image file
    if (!file.type.startsWith('image/')) {
      reject(new Error('ไฟล์ที่เลือกไม่ใช่รูปภาพ กรุณาเลือกไฟล์รูปภาพ (JPG/PNG/WebP)'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('ไม่สามารถประมวลผลข้อมูลรูปภาพได้'));
      };

      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Calculate aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Render on canvas
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original read if canvas context fails
            resolve(readerEvent.target?.result as string);
            return;
          }

          // Better image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // If converting to JPEG, fill background with white (in case transparent PNG)
          if (mimeType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Get compressed data URI
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch (err) {
          console.error('Compression error:', err);
          // Fallback to reader result if compression encounters an edge case
          resolve(readerEvent.target?.result as string);
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Avatar portrait presets for quick selection
 */
export const COUNSELOR_PRESET_AVATARS = [
  {
    name: 'ครูท่านที่ 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    gender: 'female'
  },
  {
    name: 'ครูท่านที่ 2',
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=400',
    gender: 'female'
  },
  {
    name: 'ครูท่านที่ 3',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    gender: 'male'
  },
  {
    name: 'ครูท่านที่ 4',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    gender: 'male'
  },
  {
    name: 'ครูท่านที่ 5',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400',
    gender: 'female'
  },
  {
    name: 'ครูท่านที่ 6',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    gender: 'male'
  },
  {
    name: 'ครูท่านที่ 7',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    gender: 'female'
  },
  {
    name: 'ครูท่านที่ 8',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    gender: 'male'
  }
];
