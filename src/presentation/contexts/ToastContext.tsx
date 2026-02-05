import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  createdAt: number;
}

export interface ToastOptions {
  type: ToastType;
  title?: string;
  message?: string;
}

type AddToastFn = {
  (message: string, type: ToastType): void;
  (options: ToastOptions): void;
};

interface ToastContextValue {
  toasts: Toast[];
  addToast: AddToastFn;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 4000;

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string; iconText: string }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-400 dark:border-emerald-600',
    icon: 'text-emerald-600 dark:text-emerald-400',
    iconText: '\u2713',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-400 dark:border-red-600',
    icon: 'text-red-600 dark:text-red-400',
    iconText: '\u2717',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-400 dark:border-amber-600',
    icon: 'text-amber-600 dark:text-amber-400',
    iconText: '\u26A0',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-400 dark:border-blue-600',
    icon: 'text-blue-600 dark:text-blue-400',
    iconText: '\u2139',
  },
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (messageOrOptions: string | ToastOptions, type?: ToastType) => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

      let toast: Toast;

      if (typeof messageOrOptions === 'object') {
        // Object format: { type, title?, message? }
        toast = {
          id,
          title: messageOrOptions.title,
          message: messageOrOptions.message || messageOrOptions.title || '',
          type: messageOrOptions.type,
          createdAt: Date.now(),
        };
      } else {
        // Simple format: (message, type)
        toast = {
          id,
          message: messageOrOptions,
          type: type!,
          createdAt: Date.now(),
        };
      }

      setToasts((prev) => [...prev, toast]);

      // Auto-remove after TOAST_DURATION
      const timer = setTimeout(() => {
        removeToast(id);
      }, TOAST_DURATION);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  ) as AddToastFn;

  // Clean up all timers on unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container rendered at bottom-right */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((toast) => {
            const styles = TOAST_STYLES[toast.type];
            return (
              <div
                key={toast.id}
                className={`
                  pointer-events-auto
                  flex items-start gap-3 p-4 rounded-lg border shadow-lg
                  ${styles.bg} ${styles.border}
                  animate-in slide-in-from-right fade-in duration-300
                `}
                role="alert"
              >
                <span className={`text-lg font-bold flex-shrink-0 ${styles.icon}`}>
                  {styles.iconText}
                </span>
                <div className="flex-1 min-w-0">
                  {toast.title && (
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                      {toast.title}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Fermer"
                >
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastContext;
