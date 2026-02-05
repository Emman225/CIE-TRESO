import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AreaConfig {
  dataKey: string;
  color: string;
  name: string;
  dashed?: boolean;
}

interface AreaChartWidgetProps {
  data: any[];
  areas: AreaConfig[];
  xAxisKey: string;
  height?: number;
  gradientId?: string;
}

export const AreaChartWidget: React.FC<AreaChartWidgetProps> = ({
  data,
  areas,
  xAxisKey,
  height = 320,
  gradientId = 'areaGradient',
}) => {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            {areas.map((area, idx) => (
              <linearGradient
                key={area.dataKey}
                id={`${gradientId}_${idx}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={area.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
            opacity={0.5}
          />
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            }}
            itemStyle={{ fontSize: '12px', fontWeight: '900' }}
            cursor={{
              stroke: '#e65000',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />
          {areas.map((area, idx) =>
            area.dashed ? (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={area.color}
                strokeWidth={2}
                strokeDasharray="6 3"
                fillOpacity={0}
                fill="none"
                dot={{ r: 3, fill: area.color, strokeWidth: 0 }}
                animationDuration={1500}
              />
            ) : (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={area.color}
                strokeWidth={4}
                fillOpacity={1}
                fill={`url(#${gradientId}_${idx})`}
                animationDuration={1500}
              />
            )
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChartWidget;
