import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
  type ImageCropFormValues,
  type CroppedImageMetadata,
} from '../../types/image-crop';
import { formatFileSize } from '../../utils/cropImage';
import { CropAndPreviewModal } from './CropAndPreviewModal';
import { MainPreviewCard } from './MainPreviewCard';
import './ImageCropperForm.css';

/**
 * Component chính của bài thực hành: ImageCropperForm
 * Quản lý trạng thái form bằng React Hook Form, xử lý upload, validate file, crop và hiển thị kết quả
 */
export const ImageCropperForm: React.FC = () => {
  // =========================================================================
  // 1. KHỞI TẠO REACT HOOK FORM
  // =========================================================================
  const {
    register,                     // Hàm đăng ký trường vào hệ thống validation của form
    handleSubmit,                 // Hàm bọc xử lý submit và tự động chạy validation
    setValue,                     // Hàm cập nhật giá trị trường thủ công (khi crop xong)
    setError,                     // Hàm đặt thông báo lỗi thủ công (khi file sai định dạng hoặc quá dung lượng)
    clearErrors,                  // Hàm xóa thông báo lỗi khi file hợp lệ
    reset,                        // Hàm reset toàn bộ dữ liệu form về mặc định
    formState: { errors },        // Đối tượng chứa các lỗi validation hiện tại của form
  } = useForm<ImageCropFormValues>({
    defaultValues: {
      croppedImage: null,         // Khởi tạo trường croppedImage ban đầu là null
    },
    mode: 'onSubmit',             // Kích hoạt kiểm tra validation khi người dùng submit
  });

  /**
   * Đăng ký trường 'croppedImage' với điều kiện bắt buộc (required)
   * Sử dụng useEffect để đăng ký một lần khi component mount
   */
  useEffect(() => {
    register('croppedImage', {
      required: 'Vui lòng chọn ảnh, cắt ảnh 400×400px và nhấn Upload.',
    });
  }, [register]);

  // =========================================================================
  // 2. CÁC STATE QUẢN LÝ GIAO DIỆN
  // =========================================================================
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);             // File ảnh gốc được chọn từ máy
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);                   // Object URL tạm của ảnh gốc (dùng cho Cropper)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);                        // Trạng thái mở/đóng Modal cắt ảnh
  const [uploadedImage, setUploadedImage] = useState<CroppedImageMetadata | null>(null); // Dữ liệu ảnh sau khi bấm Upload thành công

  // Tham chiếu DOM đến thẻ <input type="file" /> để kích hoạt hoặc xóa giá trị
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =========================================================================
  // 3. QUẢN LÝ BỘ NHỚ: THU HỒI OBJECT URL TRÁNH RÒ RỈ (MEMORY LEAK)
  // =========================================================================
  const revokeRawUrl = useCallback(() => {
    if (rawImageSrc) {
      URL.revokeObjectURL(rawImageSrc);
      setRawImageSrc(null);
    }
  }, [rawImageSrc]);

  const revokeUploadedUrl = useCallback(() => {
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
  }, [uploadedImage?.previewUrl]);

  // Effect dọn dẹp bộ nhớ khi unmount component
  useEffect(() => {
    return () => {
      revokeRawUrl();
      revokeUploadedUrl();
    };
  }, [revokeRawUrl, revokeUploadedUrl]);

  // =========================================================================
  // 4. KIỂM TRA ĐỊNH DẠNG VÀ DUNG LƯỢNG FILE (FILE VALIDATION)
  // =========================================================================
  const validateFile = (file: File): { isValid: boolean; errorMessage?: string } => {
    // Kiểm tra định dạng: Chỉ chấp nhận JPG/JPEG hoặc PNG
    const hasValidMime = (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);
    const hasValidExtension = /\.(jpe?g|png)$/i.test(file.name);

    if (!hasValidMime && !hasValidExtension) {
      return {
        isValid: false,
        errorMessage: 'Định dạng file không hợp lệ. Chỉ chấp nhận ảnh JPG hoặc PNG.',
      };
    }

    // Kiểm tra dung lượng: Không vượt quá 5MB (5 * 1024 * 1024 bytes)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        errorMessage: `Dung lượng file (${formatFileSize(file.size)}) vượt quá giới hạn tối đa ${MAX_FILE_SIZE_MB}MB.`,
      };
    }

    return { isValid: true };
  };

  // =========================================================================
  // 5. XỬ LÝ KHI NGƯỜI DÙNG CHỌN FILE
  // =========================================================================
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      if (!uploadedImage) {
        setError('croppedImage', {
          type: 'manual',
          message: 'Vui lòng chọn một file ảnh JPG hoặc PNG.',
        });
      }
      return;
    }

    const file = files[0];
    const validation = validateFile(file);

    // Nếu file vi phạm (sai định dạng hoặc > 5MB)
    if (!validation.isValid) {
      revokeRawUrl();
      setSelectedRawFile(null);
      setError('croppedImage', {
        type: 'manual',
        message: validation.errorMessage || 'File không hợp lệ.',
      });

      // Reset value của input để cho phép chọn lại cùng file đó nếu muốn
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // File hợp lệ: Xóa thông báo lỗi trước đó
    clearErrors('croppedImage');
    revokeRawUrl();

    // Tạo Object URL mới cho ảnh gốc và mở modal cắt ảnh
    const newRawUrl = URL.createObjectURL(file);
    setSelectedRawFile(file);
    setRawImageSrc(newRawUrl);
    setIsModalOpen(true);
  };

  // =========================================================================
  // 6. XỬ LÝ KHI NGƯỜI DÙNG BẤM "UPLOAD NGAY!" TỪ POPUP PREVIEW
  // =========================================================================
  const handleUploadConfirm = (metadata: CroppedImageMetadata) => {
    revokeUploadedUrl();

    // Lưu thông tin ảnh để hiển thị lên Giao Diện Chính
    setUploadedImage(metadata);

    // Cập nhật giá trị vào React Hook Form (đánh dấu form đã có ảnh crop hợp lệ)
    setValue('croppedImage', metadata.file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Đóng Modal popup
    setIsModalOpen(false);
  };

  // =========================================================================
  // 7. CÁC HÀNH ĐỘNG PHỤ: ĐỔI ẢNH, XÓA ẢNH, NỘP FORM
  // =========================================================================
  const handleChangeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    revokeRawUrl();
    revokeUploadedUrl();
    setSelectedRawFile(null);
    setUploadedImage(null);
    reset({ croppedImage: null });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setError('croppedImage', {
      type: 'manual',
      message: 'Vui lòng chọn ảnh, cắt ảnh 400×400px và nhấn Upload.',
    });
  };

  const onSubmit = () => {
    alert('Đã hoàn tất! Ảnh 400x400 đã được tải lên thành công.');
  };

  return (
    <div className="crop-form-card">
      <h2 className="form-title">Upload & Crop Image (400×400)</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="image-form" noValidate>
        {/* TRƯỜNG 1: UPLOAD ẢNH (BẮT BUỘC, JPG/PNG, TỐI ĐA 5MB) */}
        <div className="form-group">
          <label htmlFor="image-file-input" className="form-label">
            Upload Image <span className="required-star">*</span>
          </label>
          <span className="form-hint">Định dạng: JPG, PNG • Dung lượng: Tối đa 5MB</span>

          <div className="upload-box">
            <input
              ref={fileInputRef}
              id="image-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
              className="file-input-native"
            />
          </div>

          {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ LỖI VALIDATION */}
          {errors.croppedImage && (
            <div className="error-message" role="alert">
              ⚠️ {errors.croppedImage.message}
            </div>
          )}
        </div>

        {/* TRƯỜNG 2: ẢNH HIỂN THỊ LÊN GIAO DIỆN CHÍNH SAU KHI UPLOAD (MainPreviewCard) */}
        {uploadedImage && (
          <MainPreviewCard
            metadata={uploadedImage}
            onChangeImage={handleChangeImage}
            onRemoveImage={handleRemoveImage}
          />
        )}
      </form>

      {/* MODAL POPUP: CẮT ẢNH & PREVIEW POPUP TRƯỚC KHI BẤM UPLOAD */}
      <CropAndPreviewModal
        isOpen={isModalOpen}
        rawImageSrc={rawImageSrc}
        rawFile={selectedRawFile}
        onUploadConfirm={handleUploadConfirm}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
