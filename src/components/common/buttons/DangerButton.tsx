import React from 'react';

interface DangerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * Nút bấm cảnh báo / xóa (Danger Button)
 * Dùng cho các hành động xóa dữ liệu như: "🗑 Xóa ảnh"
 */
export const DangerButton: React.FC<DangerButtonProps> = ({
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn-danger-outline ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
