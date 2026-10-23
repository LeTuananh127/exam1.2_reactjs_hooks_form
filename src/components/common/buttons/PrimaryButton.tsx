import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Trạng thái đang tải (ví dụ: đang xử lý cắt ảnh hoặc đang upload)
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Nút bấm hành động chính (Primary Button)
 * Dùng cho các hành động quan trọng nhất như: "Xem trước (Preview)", "Upload ngay!"
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn-primary ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Nếu đang loading thì hiển thị thông báo, ngược lại hiển thị nội dung nút */}
      {isLoading ? 'Đang xử lý...' : children}
    </button>
  );
};
