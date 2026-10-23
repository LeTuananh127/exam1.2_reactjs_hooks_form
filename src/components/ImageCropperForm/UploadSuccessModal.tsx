import React from 'react';
import { type CroppedImageMetadata } from '../../types/image-crop';

interface UploadSuccessModalProps {
  isOpen: boolean;
  data: CroppedImageMetadata | null;
  onClose: () => void;
  onUploadNew: () => void;
}

export const UploadSuccessModal: React.FC<UploadSuccessModalProps> = ({
  isOpen,
  data,
  onClose,
  onUploadNew,
}) => {
  if (!isOpen || !data) return null;

  return (
    <div
      className="crop-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-success-title"
      onClick={onClose}
    >
      <div
        className="upload-success-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn-icon-close popup-close-btn"
          onClick={onClose}
          aria-label="Đóng"
        >
          ✕
        </button>

        <div className="popup-icon-wrapper">
          <div className="popup-success-icon">✓</div>
        </div>

        <h3 id="upload-success-title" className="popup-title">
          Upload thành công!
        </h3>
        <p className="popup-subtitle">
          Ảnh đã được crop chuẩn <strong>400 × 400 pixel</strong>.
        </p>

        <div className="popup-preview-frame">
          <img
            src={data.previewUrl}
            alt="Ảnh đã upload 400x400"
            className="popup-preview-img"
          />
        </div>

        <div className="popup-actions">
          <button
            type="button"
            className="btn btn-secondary popup-btn"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-primary popup-btn"
            onClick={onUploadNew}
          >
            Upload ảnh mới
          </button>
        </div>
      </div>
    </div>
  );
};
