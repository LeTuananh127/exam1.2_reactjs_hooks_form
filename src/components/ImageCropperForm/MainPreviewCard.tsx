import React from 'react';
import { TARGET_CROP_SIZE, type CroppedImageMetadata } from '../../types/image-crop';
import { formatFileSize } from '../../utils/cropImage';
import { OutlineButton, DangerButton } from '../common/buttons';

/**
 * Kiểu dữ liệu Props truyền vào MainPreviewCard
 */
interface MainPreviewCardProps {
  metadata: CroppedImageMetadata; // Dữ liệu ảnh đã upload thành công (file, previewUrl, dung lượng,...)
  onChangeImage: () => void;       // Hàm kích hoạt chọn ảnh khác từ máy tính
  onRemoveImage: () => void;       // Hàm xóa ảnh hiện tại và reset form
}

/**
 * Component hiển thị ảnh đã upload thành công trên Giao Diện Chính
 * Được tách riêng giúp component ImageCropperForm ngắn gọn và dễ bảo trì
 */
export const MainPreviewCard: React.FC<MainPreviewCardProps> = ({
  metadata,
  onChangeImage,
  onRemoveImage,
}) => {
  return (
    <div className="main-preview-container">
      {/* Huy hiệu thông báo trạng thái upload thành công */}
      <div className="main-preview-badge">
        ✓ Đã Upload thành công ({TARGET_CROP_SIZE.width} × {TARGET_CROP_SIZE.height} px)
      </div>

      {/* Khung ảnh vuông tỷ lệ 1:1, hiển thị ảnh crop 400x400 rõ nét */}
      <div className="main-preview-frame">
        <img
          src={metadata.previewUrl}
          alt="Ảnh đã upload trên giao diện chính"
          className="main-preview-img"
        />
        <span className="main-dimension-tag">
          {TARGET_CROP_SIZE.width} × {TARGET_CROP_SIZE.height} px
        </span>
      </div>

      {/* Thông tin tên file và dung lượng (Tự động co gọn bằng dấu ... nếu tên quá dài) */}
      <div className="main-file-info">
        <span className="main-file-name" title={metadata.file.name}>
          {metadata.file.name}
        </span>
        <span className="main-file-size">
          • {formatFileSize(metadata.sizeBytes)}
        </span>
      </div>

      {/* Cụm nút hành động sử dụng các loại Button chuyên biệt */}
      <div className="main-preview-actions">
        {/* Nút Đổi ảnh khác: Dùng OutlineButton */}
        <OutlineButton
          type="button"
          onClick={onChangeImage}
        >
          🔄 Thay ảnh khác
        </OutlineButton>

        {/* Nút Xóa ảnh: Dùng DangerButton chuyên dùng cho hành động cảnh báo/xóa */}
        <DangerButton
          type="button"
          onClick={onRemoveImage}
        >
          🗑 Xóa ảnh
        </DangerButton>
      </div>
    </div>
  );
};
