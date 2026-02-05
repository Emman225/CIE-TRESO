import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string;
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 focus:ring-4 focus:ring-primary/20',
  secondary:
    'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg hover:scale-105 active:scale-95 focus:ring-4 focus:ring-zinc-900/20 dark:focus:ring-white/20',
  outline:
    'border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-primary hover:text-primary focus:ring-4 focus:ring-primary/10 active:scale-95',
  ghost:
    'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white active:scale-95',
  danger:
    'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700 hover:scale-105 active:scale-95 focus:ring-4 focus:ring-red-600/20',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-4 text-xs gap-1.5',
  md: 'h-11 px-6 text-sm gap-2',
  lg: 'h-14 px-8 text-base gap-2.5',
};

const iconSizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        inline-flex items-center justify-center font-black rounded-xl
        transition-all duration-200 whitespace-nowrap select-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `.trim()}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span
          className={`material-symbols-outlined animate-spin ${iconSizeClasses[size]}`}
        >
          sync
        </span>
      ) : icon ? (
        <span
          className={`material-symbols-outlined ${iconSizeClasses[size]}`}
        >
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
