import React from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { PrimaryButton, SecondaryButton } from '../common/buttons';

/**
 * Kiểu dữ liệu Props truyền vào CropStep
 */
interface CropStepProps {
  imageSrc: string;                                                      // Đường dẫn URL tạm của ảnh gốc (Object URL)
  crop: Point;                                                           // Tọa độ vị trí crop hiện tại: { x: number, y: number }
  zoom: number;                                                          // Mức độ phóng to hiện tại (từ 1x đến 3x)
  onCropChange: (location: Point) => void;                               // Hàm callback khi người dùng kéo di chuyển vùng ảnh
  onZoomChange: (zoom: number) => void;                                  // Hàm callback khi người dùng kéo thanh trượt zoom
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;  // Hàm callback khi người dùng dừng di chuyển/zoom để lấy tọa độ pixel chuẩn
  onCancel: () => void;                                                  // Hàm đóng/hủy bỏ modal
  onProceedToPreview: () => void;                                        // Hàm cắt ảnh và chuyển sang màn hình xem trước (Preview)
  isProcessing: boolean;                                                 // Cờ trạng thái khi Canvas đang tính toán xử lý ảnh
  hasCropArea: boolean;                                                  // Cờ kiểm tra đã xác định được vùng crop hay chưa
}

/**
 * Component Bước 1: Giao diện cắt ảnh (Crop Step)
 * Sử dụng thư viện react-easy-crop để cho phép người dùng kéo ảnh và phóng to/thu nhỏ
 */
export const CropStep: React.FC<CropStepProps> = ({
  imageSrc,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onProceedToPreview,
  isProcessing,
  hasCropArea,
}) => {
  return (
    <>
      {/* KHÔNG GIAN CẮT ẢNH (REACT-EASY-CROP WORKSPACE) */}
      <div className="crop-workspace">
        <Cropper
          image={imageSrc}                  // Ảnh gốc cần cắt
          crop={crop}                        // Vị trí tọa độ tâm của ảnh
          zoom={zoom}                        // Hệ số phóng to ảnh
          aspect={1}                         // Tỷ lệ khung hình 1:1 (hình vuông chuẩn 400x400)
          onCropChange={onCropChange}        // Cập nhật tọa độ khi kéo chuột/chạm tay
          onCropComplete={onCropComplete}    // Trả về tọa độ pixel thật trên ảnh gốc
          onCropAreaChange={onCropComplete}  // Cập nhật ngay lập tức cho mọi tương tác (real-time, không bị trễ)
          onZoomChange={onZoomChange}        // Cập nhật độ zoom
          showGrid={true}                    // Hiển thị đường lưới (grid) 3x3 hỗ trợ căn chỉnh
          minZoom={1}                        // Zoom tối thiểu: 100% (không thu nhỏ dưới kích thước gốc)
          maxZoom={3}                        // Zoom tối đa: 300%
          roundCropAreaPixels={true}         // Làm tròn vùng pixel chuẩn số nguyên
        />
      </div>

      {/* THANH ĐIỀU KHIỂN ĐỘ PHÓNG TO & CÁC NÚT HÀNH ĐỘNG */}
      <div className="crop-controls">
        {/* Điều chỉnh độ zoom bằng thanh trượt (slider) */}
        <div className="zoom-control-group">
          <label htmlFor="zoom-input" className="zoom-label">
            <span>Phóng to:</span>
            <span>{Math.round(zoom * 100)}%</span>
          </label>
          <div className="zoom-slider-wrapper">
            <span aria-hidden="true">−</span>
            <input
              id="zoom-input"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className="zoom-slider"
              aria-label="Thanh trượt phóng to thu nhỏ ảnh"
            />
            <span aria-hidden="true">+</span>
          </div>
        </div>

        {/* Các nút bấm hành động được tách riêng (SecondaryButton và PrimaryButton) */}
        <div className="crop-actions">
          {/* Nút Hủy: Dùng SecondaryButton */}
          <SecondaryButton
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Hủy
          </SecondaryButton>

          {/* Nút Xem trước: Dùng PrimaryButton có hỗ trợ isLoading */}
          <PrimaryButton
            type="button"
            onClick={onProceedToPreview}
            disabled={isProcessing || !hasCropArea}
            isLoading={isProcessing}
          >
            Xem trước (Preview) →
          </PrimaryButton>
        </div>
      </div>
    </>
  );
};
