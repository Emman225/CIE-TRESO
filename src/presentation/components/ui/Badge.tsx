import React from 'react';

interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
}

const variantClasses: Record<BadgeProps['variant'], string> = {
  success: 'bg-[#22a84c]/10 text-[#22a84c] dark:bg-[#22a84c]/20 dark:text-[#2ec45a]',
  warning: 'bg-[#e65000]/10 text-[#e65000] dark:bg-[#e65000]/20 dark:text-[#ff8c4a]',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
};

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1
        text-[10px] font-black uppercase tracking-wider
        rounded-lg shadow-sm
        ${variantClasses[variant]}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
