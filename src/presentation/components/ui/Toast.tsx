import React, { useEffect, useState } from 'react';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onRemove: (id: string) => void;
}

const typeConfig: Record<
  ToastProps['type'],
  { icon: string; bg: string; border: string; text: string; iconColor: string }
> = {
  success: {
    icon: 'check_circle',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-[#22a84c]/30 dark:border-[#22a84c]/20',
    text: 'text-[#22a84c] dark:text-[#2ec45a]',
    iconColor: 'text-[#22a84c]',
  },
  error: {
    icon: 'error',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: 'warning',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-[#e65000]/30 dark:border-[#e65000]/20',
    text: 'text-[#e65000] dark:text-[#ff8c4a]',
    iconColor: 'text-[#e65000]',
  },
  info: {
    icon: 'info',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    iconColor: 'text-blue-500',
  },
};

const AUTO_DISMISS_MS = 5000;

export const Toast: React.FC<ToastProps> = ({ id, message, type, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = typeConfig[type];

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-5 py-4
        ${config.bg} border ${config.border}
        rounded-2xl shadow-xl
        min-w-[320px] max-w-md
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      role="alert"
    >
      <span className={`material-symbols-outlined text-xl filled shrink-0 ${config.iconColor}`}>
        {config.icon}
      </span>

      <p className={`text-sm font-bold flex-1 ${config.text}`}>{message}</p>

      <button
        onClick={handleDismiss}
        className="size-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
};

export default Toast;
