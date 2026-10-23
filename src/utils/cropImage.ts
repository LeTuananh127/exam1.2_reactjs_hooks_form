import type { Area } from 'react-easy-crop';
import { TARGET_CROP_SIZE } from '../types/image-crop';

/**
 * Tải HTMLImageElement từ URL an toàn
 * Sử dụng new Image() và Promise để chờ sự kiện 'load' của ảnh
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) =>
      reject(new Error(`Không thể tải ảnh: ${error instanceof ErrorEvent ? error.message : 'Lỗi định dạng ảnh'}`))
    );
    // Thiết lập crossOrigin anonymous để tránh lỗi tainted canvas nếu ảnh load từ xa
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export interface CropResult {
  file: File;           // Đối tượng File nhị phân chuẩn được tạo từ Canvas
  blob: Blob;           // Đối tượng Blob nhị phân
  previewUrl: string;   // Object URL tạo từ Blob để hiển thị xem trước
}

/**
 * HÀM CẮT ẢNH BẰNG HTML5 CANVAS (XUẤT RA ẢNH CHUẨN 400 × 400 PIXEL)
 * 
 * @param imageSrc         - URL ảnh gốc (Object URL)
 * @param pixelCrop        - Tọa độ { x, y, width, height } trên ảnh gốc do react-easy-crop trả về
 * @param targetWidth      - Chiều rộng mong muốn của Canvas (mặc định 400px)
 * @param targetHeight     - Chiều cao mong muốn của Canvas (mặc định 400px)
 * @param outputMimeType   - Định dạng ảnh đầu ra ('image/png' hoặc 'image/jpeg')
 * @param originalFileName - Tên file gốc ban đầu để đặt tên cho file mới
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  targetWidth = TARGET_CROP_SIZE.width,
  targetHeight = TARGET_CROP_SIZE.height,
  outputMimeType: 'image/png' | 'image/jpeg' = 'image/png',
  originalFileName = 'image'
): Promise<CropResult> {
  // 1. Chờ ảnh gốc tải xong vào đối tượng HTMLImageElement
  const image = await createImage(imageSrc);

  // 2. Tạo một thẻ Canvas ảo trong bộ nhớ (không cần gắn vào DOM)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Trình duyệt không hỗ trợ Canvas 2D Context.');
  }

  // 3. Đặt kích thước thực tế của Canvas đúng bằng 400x400 pixel
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 4. Bật chế độ làm mịn ảnh chất lượng cao khi scale kích thước
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 5. Nếu xuất định dạng JPEG, tô nền trắng để tránh bị đen ở các vùng trong suốt
  if (outputMimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // 6. Làm tròn tọa độ thành số nguyên (Math.round) để tránh sai lệch sub-pixel
  const cropX = Math.round(pixelCrop.x);
  const cropY = Math.round(pixelCrop.y);
  const cropWidth = Math.round(pixelCrop.width);
  const cropHeight = Math.round(pixelCrop.height);

  /**
   * 7. Vẽ vùng ảnh được chọn lên Canvas:
   * ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
   * - sx, sy, sWidth, sHeight: Tọa độ và kích thước vùng cắt trên ảnh gốc
   * - dx, dy, dWidth, dHeight: Tọa độ (0, 0) và kích thước đích trên Canvas (400, 400)
   */
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // 8. Chuyển Canvas thành đối tượng Blob và bọc thành File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas xuất ảnh thất bại (toBlob trả về null).'));
          return;
        }

        const ext = outputMimeType === 'image/jpeg' ? '.jpg' : '.png';
        const baseName = originalFileName.replace(/\.[^/.]+$/, '');
        const outputFileName = `${baseName}_cropped_400x400${ext}`;

        // Tạo instance File từ dữ liệu nhị phân Blob
        const croppedFile = new File([blob], outputFileName, {
          type: outputMimeType,
          lastModified: Date.now(),
        });

        // Tạo Object URL cho ảnh đã crop để hiển thị xem trước
        const previewUrl = URL.createObjectURL(blob);

        resolve({
          file: croppedFile,
          blob,
          previewUrl,
        });
      },
      outputMimeType,
      0.95 // Chất lượng nén 95%
    );
  });
}

/**
 * Hàm định dạng dung lượng bytes sang chuỗi dễ đọc (Bytes, KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
