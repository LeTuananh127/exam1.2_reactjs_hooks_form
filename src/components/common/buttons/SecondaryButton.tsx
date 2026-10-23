import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * Nút bấm phụ (Secondary Button)
 * Dùng cho các hành động hủy bỏ, quay lại hoặc đóng popup như: "Hủy", "✂ Cắt lại", "Đóng"
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`btn btn-secondary ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
