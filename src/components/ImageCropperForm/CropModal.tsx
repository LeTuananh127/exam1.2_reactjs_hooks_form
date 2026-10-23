import React, { useState, useCallback } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { TARGET_CROP_SIZE } from '../../types/image-crop';

interface CropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onCropApply: (croppedAreaPixels: Area) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  imageSrc,
  onCropApply,
  onCancel,
  isProcessing = false,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, currentCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleApply = () => {
    if (croppedAreaPixels) {
      onCropApply(croppedAreaPixels);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      className="crop-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div className="crop-modal-container">
        <div className="crop-modal-header">
          <div>
            <h3 id="crop-modal-title">Cắt ảnh (Crop Image)</h3>
            <p className="crop-modal-subtitle">
              Di chuyển và phóng to ảnh để chọn vùng mong muốn. Ảnh xuất ra sẽ có kích thước chuẩn{' '}
              <strong>
                {TARGET_CROP_SIZE.width} × {TARGET_CROP_SIZE.height} pixel
              </strong>
              .
            </p>
          </div>
          <button
            type="button"
            className="btn-icon-close"
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Đóng cửa sổ cắt ảnh"
          >
            ✕
          </button>
        </div>

        <div className="crop-workspace">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Tỷ lệ 1:1 hình vuông
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
            cropShape="rect"
            minZoom={1}
            maxZoom={3}
            zoomSpeed={0.1}
          />
        </div>

        <div className="crop-controls">
          <div className="zoom-control-group">
            <label htmlFor="zoom-range" className="zoom-label">
              <span>Phóng to / Thu nhỏ:</span>
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            </label>
            <div className="zoom-slider-wrapper">
              <span className="zoom-icon" aria-hidden="true">−</span>
              <input
                id="zoom-range"
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Thanh điều chỉnh độ phóng to ảnh"
                className="zoom-slider"
                disabled={isProcessing}
              />
              <span className="zoom-icon" aria-hidden="true">+</span>
            </div>
          </div>

          <div className="crop-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Hủy / Đổi ảnh
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApply}
              disabled={!croppedAreaPixels || isProcessing}
            >
              {isProcessing ? 'Đang xử lý...' : 'Cắt & Áp dụng (400×400px)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
