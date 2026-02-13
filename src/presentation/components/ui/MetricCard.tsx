import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  accentColor?: string;
  info?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  accentColor = '#e65000',
  info,
  onClick,
}) => {
  const trendIcon =
    trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';

  const trendColor =
    trend === 'up'
      ? 'text-[#22a84c]'
      : trend === 'down'
        ? 'text-[#e65000]'
        : 'text-zinc-400';

  const trendBg =
    trend === 'up'
      ? 'bg-[#22a84c]/10'
      : trend === 'down'
        ? 'bg-[#e65000]/10'
        : 'bg-zinc-100 dark:bg-zinc-400/10';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-sm p-5 ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} transition-all duration-300 group`}
    >
      {/* Colored wave blob - behind icon top right */}
      <svg
        className="absolute -top-4 -right-4 w-36 h-36 opacity-[0.15]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M200 0 V200 C180 160, 100 140, 60 120 C20 100, 0 60, 0 0 Z"
          fill={accentColor}
        />
      </svg>

      {/* Icon badge - top right, card border-radius clips the corner */}
      {icon && (
        <div
          className="absolute top-0 right-0 size-14 rounded-2xl flex items-center justify-center shadow-lg z-10"
          style={{ backgroundColor: accentColor }}
        >
          <span className="material-symbols-outlined text-white text-2xl">
            {icon}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 pr-14">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {label}
        </span>

        <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-2 mb-2">
          {value}
        </p>

        <div className="flex items-center gap-2">
          {change !== undefined && (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${trendBg} ${trendColor}`}>
              <span className="material-symbols-outlined text-sm">{trendIcon}</span>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
          )}

          {info && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">{info}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
