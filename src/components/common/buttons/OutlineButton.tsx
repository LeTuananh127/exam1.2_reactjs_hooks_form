import React from 'react';

interface OutlineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * Nút bấm dạng viền (Outline Button)
 * Dùng cho các hành động phụ không mang tính hủy bỏ như: "🔄 Thay ảnh khác"
 */
export const OutlineButton: React.FC<OutlineButtonProps> = ({
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn-outline ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
