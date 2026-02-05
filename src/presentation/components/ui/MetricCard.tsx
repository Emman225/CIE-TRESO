import React from 'react';
import { Card } from '@/presentation/components/ui/Card';

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  accentColor?: string;
  info?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  accentColor = '#e65000',
  info,
}) => {
  const trendIcon =
    trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';

  const trendColor =
    trend === 'up'
      ? 'text-emerald-400'
      : trend === 'down'
        ? 'text-red-400'
        : 'text-zinc-400';

  const trendBg =
    trend === 'up'
      ? 'bg-emerald-400/10'
      : trend === 'down'
        ? 'bg-red-400/10'
        : 'bg-zinc-400/10';

  return (
    <Card className="p-5 relative overflow-hidden group hover:border-zinc-600 transition-all duration-300">
      {/* Accent glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {label}
          </span>
          {icon && (
            <span
              className="material-symbols-outlined text-lg"
              style={{ color: accentColor }}
            >
              {icon}
            </span>
          )}
        </div>

        <p className="text-2xl font-black text-white tracking-tight mb-2">
          {value}
        </p>

        <div className="flex items-center justify-between">
          {change !== undefined && (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${trendBg} ${trendColor}`}>
              <span className="material-symbols-outlined text-sm">{trendIcon}</span>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
          )}

          {info && (
            <span className="text-[10px] text-zinc-500 font-semibold">{info}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;
