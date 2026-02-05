import React from 'react';

interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface BarChartWidgetProps {
  items: BarItem[];
}

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({ items }) => {
  return (
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={i} className="group cursor-default">
          <div className="flex justify-between text-xs font-bold mb-2 transition-transform group-hover:translate-x-1">
            <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {item.label}
            </span>
            <span className="text-zinc-900 dark:text-white font-black">
              {item.value}%
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min(item.value, 100)}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChartWidget;
