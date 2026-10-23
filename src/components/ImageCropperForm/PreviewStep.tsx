import React from 'react';
import { TARGET_CROP_SIZE, type CroppedImageMetadata } from '../../types/image-crop';
import { formatFileSize } from '../../utils/cropImage';
import { PrimaryButton, SecondaryButton } from '../common/buttons';

/**
 * Kiểu dữ liệu Props truyền vào PreviewStep
 */
interface PreviewStepProps {
  metadata: CroppedImageMetadata;  // Dữ liệu ảnh đã crop từ Canvas (file, previewUrl, width, height, size)
  onBackToCrop: () => void;        // Hàm quay trở lại bước cắt ảnh để căn chỉnh lại
  onConfirmUpload: () => void;     // Hàm xác nhận upload ảnh khi người dùng thấy ưng ý (oke)
  isUploading?: boolean;           // Cờ trạng thái đang tải lên
}

/**
 * Component Bước 2: Xem trước ảnh dạng Popup (Preview Step)
 * Hiển thị ảnh vừa cắt chuẩn 400x400 px để người dùng kiểm tra trước khi bấm Upload
 */
export const PreviewStep: React.FC<PreviewStepProps> = ({
  metadata,
  onBackToCrop,
  onConfirmUpload,
  isUploading = false,
}) => {
  return (
    <div className="modal-preview-body">
      {/* KHUNG HIỂN THỊ ẢNH PREVIEW 400x400 PX */}
      <div className="modal-preview-frame">
        <img
          src={metadata.previewUrl}
          alt="Preview ảnh 400x400"
          className="modal-preview-img"
        />
        {/* Nhãn hiển thị kích thước chuẩn 400x400 */}
        <span className="dimension-badge">
          {TARGET_CROP_SIZE.width} × {TARGET_CROP_SIZE.height} px
        </span>
      </div>

      {/* THÔNG TIN FILE (Có chống tràn text-overflow ellipsis nếu tên dài) */}
      <div className="modal-preview-info">
        <span className="modal-file-name" title={metadata.file.name}>
          {metadata.file.name}
        </span>
        <span className="modal-file-size">
          {TARGET_CROP_SIZE.width} × {TARGET_CROP_SIZE.height} px • {formatFileSize(metadata.sizeBytes)}
        </span>
      </div>

      {/* CỤM NÚT ĐƯỢC TÁCH RIÊNG THÀNH TỪNG LOẠI BUTTON CỤ THỂ */}
      <div className="modal-preview-actions">
        {/* Nút Cắt lại: Dùng SecondaryButton */}
        <SecondaryButton
          type="button"
          onClick={onBackToCrop}
          disabled={isUploading}
        >
          ✂ Cắt lại
        </SecondaryButton>

        {/* Nút Upload: Dùng PrimaryButton có hỗ trợ isLoading */}
        <PrimaryButton
          type="button"
          onClick={onConfirmUpload}
          isLoading={isUploading}
          className="btn-upload-confirm"
        >
          🚀 Oke, Upload ngay!
        </PrimaryButton>
      </div>
    </div>
  );
};
