import React from 'react';
import { TARGET_CROP_SIZE, type CroppedImageMetadata } from '../../types/image-crop';

interface ImagePreviewSectionProps {
  metadata: CroppedImageMetadata | null;
  onUpload: () => void;
  onRecrop: () => void;
  onChangeImage: () => void;
  isUploading?: boolean;
}

export const ImagePreviewSection: React.FC<ImagePreviewSectionProps> = ({
  metadata,
  onUpload,
  onRecrop,
  onChangeImage,
  isUploading = false,
}) => {
  if (!metadata) return null;

  return (
    <div className="preview-section">
      <h3 className="section-title">Preview Image (400 × 400 px)</h3>

      <div className="preview-box">
        <div className="preview-image-wrapper">
          <img
            src={metadata.previewUrl}
            alt="Preview ảnh đã crop 400x400"
            width={TARGET_CROP_SIZE.width}
            height={TARGET_CROP_SIZE.height}
            className="preview-image"
          />
        </div>

        <div className="preview-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Đang upload...' : 'Upload Image'}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onRecrop}
            disabled={isUploading}
          >
            Cắt lại
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onChangeImage}
            disabled={isUploading}
          >
            Đổi ảnh
          </button>
        </div>
      </div>
    </div>
  );
};
