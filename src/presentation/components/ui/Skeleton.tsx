import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const variantClasses = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: '',
  rounded: 'rounded-xl',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const animationClass = animation === 'pulse' ? 'animate-pulse' : animation === 'wave' ? 'animate-shimmer' : '';

  const style: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`bg-zinc-200 dark:bg-zinc-700 ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
    />
  );
};

// ============ Pre-built Skeleton Components ============

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 5,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height={12} width={`${15 + Math.random() * 10}%`} />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                height={16}
                width={colIndex === 0 ? '20%' : `${10 + Math.random() * 15}%`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showImage = false,
  lines = 3,
}) => {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6 ${className}`}>
      {showImage && (
        <Skeleton variant="rounded" height={160} className="mb-4" />
      )}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" height={14} width="60%" className="mb-2" />
          <Skeleton variant="text" height={10} width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} variant="text" height={12} width={i === lines - 1 ? '70%' : '100%'} />
        ))}
      </div>
    </div>
  );
};

interface SkeletonMetricCardProps {
  className?: string;
}

export const SkeletonMetricCard: React.FC<SkeletonMetricCardProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton variant="text" height={10} width="50%" />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <Skeleton variant="text" height={28} width="70%" className="mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton variant="rounded" height={20} width={60} />
        <Skeleton variant="text" height={10} width={40} />
      </div>
    </div>
  );
};

interface SkeletonChartProps {
  className?: string;
  height?: number;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({ className = '', height = 300 }) => {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="text" height={20} width="30%" />
        <div className="flex gap-4">
          <Skeleton variant="rounded" height={24} width={80} />
          <Skeleton variant="rounded" height={24} width={80} />
        </div>
      </div>
      <Skeleton variant="rounded" height={height} />
    </div>
  );
};

interface SkeletonListProps {
  items?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ items = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-[20px] border border-zinc-200 dark:border-zinc-800 p-4 flex items-center gap-4">
          <Skeleton variant="rounded" width={48} height={48} />
          <div className="flex-1">
            <Skeleton variant="text" height={14} width="40%" className="mb-2" />
            <Skeleton variant="text" height={10} width="70%" />
          </div>
          <Skeleton variant="rounded" width={80} height={28} />
        </div>
      ))}
    </div>
  );
};

// Global CSS for wave animation (add to your global styles)
// @keyframes shimmer {
//   0% { background-position: -200% 0; }
//   100% { background-position: 200% 0; }
// }
// .animate-shimmer {
//   background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
//   background-size: 200% 100%;
//   animation: shimmer 1.5s infinite;
// }

export default Skeleton;
