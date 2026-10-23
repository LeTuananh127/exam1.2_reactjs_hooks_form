import React, { useState, useCallback, useEffect } from 'react';
import type { Area, Point } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { TARGET_CROP_SIZE, type CroppedImageMetadata } from '../../types/image-crop';
import { getCroppedImg } from '../../utils/cropImage';
import { CropStep } from './CropStep';
import { PreviewStep } from './PreviewStep';

/**
 * Kiểu dữ liệu Props của Modal Cắt & Xem Trước
 */
interface CropAndPreviewModalProps {
  isOpen: boolean;                                                     // Trạng thái mở/đóng modal (true: mở, false: đóng)
  rawImageSrc: string | null;                                          // URL tạm của ảnh gốc được tạo từ URL.createObjectURL(file)
  rawFile: File | null;                                                // Đối tượng File gốc được chọn từ máy tính
  onUploadConfirm: (metadata: CroppedImageMetadata) => void;           // Callback gọi khi người dùng bấm "Upload ngay" trong popup
  onClose: () => void;                                                 // Callback đóng modal
}

/**
 * Component Modal điều phối 2 bước:
 * - Bước 1 ('crop'): Cho phép người dùng căn chỉnh góc và phóng to/thu nhỏ
 * - Bước 2 ('preview'): Cho người dùng xem trước kết quả chuẩn 400x400 dạng popup trước khi bấm Upload
 */
export const CropAndPreviewModal: React.FC<CropAndPreviewModalProps> = ({
  isOpen,
  rawImageSrc,
  rawFile,
  onUploadConfirm,
  onClose,
}) => {
  // State quản lý bước hiện tại trong modal: 'crop' hoặc 'preview'
  const [modalStep, setModalStep] = useState<'crop' | 'preview'>('crop');

  // State tọa độ vùng crop { x, y } (dùng cho react-easy-crop)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });

  // State độ zoom ảnh (mặc định 1x)
  const [zoom, setZoom] = useState<number>(1);

  // State lưu tọa độ pixel thực tế trên ảnh gốc do react-easy-crop tính toán
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // State lưu tạm thông tin ảnh đã cắt sau khi chạy Canvas API
  const [tempCropped, setTempCropped] = useState<CroppedImageMetadata | null>(null);

  // State hiển thị trạng thái đang xử lý Canvas
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // State lưu thông báo lỗi nếu có lỗi trong quá trình xử lý ảnh
  const [cropError, setCropError] = useState<string | null>(null);

  /**
   * Effect reset các thông số về ban đầu mỗi khi mở modal với ảnh mới
   */
  useEffect(() => {
    if (isOpen) {
      setModalStep('crop');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropError(null);
    }
  }, [isOpen, rawImageSrc]);

  /**
   * Callback nhận tọa độ pixel khi người dùng kéo di chuyển hoặc zoom ảnh
   * Sử dụng useCallback để tránh tạo lại hàm không cần thiết giữa các lần re-render
   */
  const onCropComplete = useCallback((_croppedArea: Area, currentPixels: Area) => {
    setCroppedAreaPixels(currentPixels);
  }, []);

  /**
   * Xử lý chuyển từ Bước Cắt ảnh sang Bước Xem trước (Preview Popup)
   * Sử dụng Canvas API để render ảnh 400x400 pixel thật sự
   */
  const handleProceedToPreview = async () => {
    if (!rawImageSrc || !rawFile || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      setCropError(null);

      // Xác định định dạng đầu ra dựa theo file gốc (JPG hoặc PNG)
      const outputMime = rawFile.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';

      // Gọi helper Canvas API xuất ra File và URL ảnh chuẩn 400x400
      const { file, previewUrl } = await getCroppedImg(
        rawImageSrc,
        croppedAreaPixels,
        TARGET_CROP_SIZE.width,
        TARGET_CROP_SIZE.height,
        outputMime,
        rawFile.name
      );

      // Lưu kết quả cắt ảnh vào state tạm
      setTempCropped({
        file,
        previewUrl,
        width: TARGET_CROP_SIZE.width,
        height: TARGET_CROP_SIZE.height,
        sizeBytes: file.size,
        mimeType: file.type,
        originalFileName: rawFile.name,
      });

      // Chuyển sang giao diện xem trước (Bước 2)
      setModalStep('preview');
    } catch (err) {
      setCropError(err instanceof Error ? err.message : 'Lỗi khi cắt ảnh trên Canvas');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Người dùng xem trước ảnh trong popup thấy oke và bấm "🚀 Oke, Upload ngay!"
   */
  const handleConfirmUpload = () => {
    if (tempCropped) {
      onUploadConfirm(tempCropped);
    }
  };

  // Nếu modal không mở hoặc chưa có ảnh gốc thì không render gì cả
  if (!isOpen || !rawImageSrc) return null;

  return (
    <div
      className="crop-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-step-title"
    >
      <div className="crop-modal-container">
        {/* TIÊU ĐỀ MODAL (Thay đổi linh hoạt theo từng bước) */}
        <div className="crop-modal-header">
          <div>
            <h3 id="modal-step-title">
              {modalStep === 'crop'
                ? 'Cắt ảnh (Crop 400 × 400 pixel)'
                : 'Xem trước ảnh (Preview Popup)'}
            </h3>
            <p className="modal-subtitle">
              {modalStep === 'crop'
                ? 'Di chuyển và phóng to để chọn vùng ảnh ưng ý.'
                : 'Xem trước ảnh kết quả. Nếu bạn thấy oke, hãy bấm Upload!'}
            </p>
          </div>
          {/* Nút đóng modal góc phải trên */}
          <button
            type="button"
            className="btn-icon-close"
            onClick={onClose}
            aria-label="Đóng popup"
          >
            ✕
          </button>
        </div>

        {/* Thông báo lỗi nếu Canvas gặp sự cố */}
        {cropError && <div className="error-message mx-4 mt-2">⚠️ {cropError}</div>}

        {/* BƯỚC 1: HIỂN THỊ GIAO DIỆN CẮT ẢNH (CropStep) */}
        {modalStep === 'crop' && (
          <CropStep
            imageSrc={rawImageSrc}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onCancel={onClose}
            onProceedToPreview={handleProceedToPreview}
            isProcessing={isProcessing}
            hasCropArea={Boolean(croppedAreaPixels)}
          />
        )}

        {/* BƯỚC 2: HIỂN THỊ GIAO DIỆN XEM TRƯỚC VÀ NÚT UPLOAD (PreviewStep) */}
        {modalStep === 'preview' && tempCropped && (
          <PreviewStep
            metadata={tempCropped}
            onBackToCrop={() => setModalStep('crop')}
            onConfirmUpload={handleConfirmUpload}
          />
        )}
      </div>
    </div>
  );
};
